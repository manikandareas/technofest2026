import asyncio
import json
import logging
import sys
import time
from typing import Any

from dotenv import load_dotenv
from livekit.agents import (
    AgentServer,
    AgentSession,
    AutoSubscribe,
    JobContext,
    JobProcess,
    cli,
)
from livekit.plugins import silero
from pixelaid_shared import ServiceStatus
from pixelaid_shared.cases import get_case_config
from pixelaid_voice_agent.api_client import PixelAidApiClient
from pixelaid_voice_agent.config import get_settings
from pixelaid_voice_agent.latency import resolve_latency_profile
from pixelaid_voice_agent.patient_agent import SAFE_FALLBACK_TEXT, PixelAidPatientAgent
from pixelaid_voice_agent.session_telemetry import (
    SessionEventRecorder,
    wire_model_metrics,
    wire_transcript_events,
)
from pixelaid_voice_agent.tts_factory import build_llm, build_stt, build_tts

load_dotenv()

logger = logging.getLogger(__name__)

AGENT_NAME = "pixelaid-patient"
DEFAULT_CASE_ID = "internal-medicine-dengue-warning-signs"


def _prewarm_process(proc: JobProcess) -> None:
    proc.userdata["vad"] = silero.VAD.load()


server = AgentServer(setup_fnc=_prewarm_process)


@server.rtc_session(agent_name=AGENT_NAME)
async def patient_session(ctx: JobContext) -> None:
    settings = get_settings()
    latency_profile = resolve_latency_profile(settings.voice_latency_profile)
    metadata = _parse_metadata(ctx.job.metadata)
    session_id = str(metadata.get("session_id") or "")
    api_client: PixelAidApiClient | None = None
    if session_id and not settings.voice_agent_api_token:
        raise RuntimeError("VOICE_AGENT_API_TOKEN is required.")
    if session_id and settings.voice_agent_api_token:
        api_client = PixelAidApiClient(
            base_url=settings.pixelaid_api_url,
            token=settings.voice_agent_api_token,
        )
    else:
        session_id = "console-session"
        metadata = {"session_id": session_id, "case_id": DEFAULT_CASE_ID, "actor": "console"}
    started = time.perf_counter()
    background_tasks: set[asyncio.Task[Any]] = set()
    telemetry = SessionEventRecorder(api_client, session_id, background_tasks)
    cleanup_done = False

    async def cleanup_api_client(reason: str = "") -> None:
        nonlocal cleanup_done
        if cleanup_done:
            return
        cleanup_done = True
        telemetry.close()
        await telemetry.drain()
        if api_client:
            await api_client.record_event(
                session_id,
                "ended",
                metadata={"reason": reason} if reason else {},
            )
            await api_client.aclose()

    ctx.add_shutdown_callback(cleanup_api_client)
    try:
        if api_client:
            await api_client.record_event(
                session_id,
                "joined",
                metadata=dict(metadata),
            )
            context = await api_client.get_agent_context(session_id)
        else:
            context = _console_context()
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

        session = AgentSession(
            vad=_prewarmed_vad(ctx),
            turn_handling=latency_profile.turn_handling,
            aec_warmup_duration=latency_profile.aec_warmup_duration,
        )
        wire_transcript_events(session, telemetry)
        stt_engine = build_stt(settings)
        llm_engine = build_llm(settings)
        tts_engine = build_tts(context, settings)
        wire_model_metrics("stt", stt_engine, telemetry)
        wire_model_metrics("llm", llm_engine, telemetry)
        wire_model_metrics("tts", tts_engine, telemetry)
        agent = PixelAidPatientAgent(
            context=context,
            telemetry=telemetry if telemetry.enabled else None,
            instructions=_instructions(context),
            stt=stt_engine,
            llm=llm_engine,
            tts=tts_engine,
        )
        await session.start(agent, room=ctx.room, record=False)
        if api_client:
            await api_client.record_event(
                session_id,
                "ready",
                metadata={
                    "latency_ms": round((time.perf_counter() - started) * 1000),
                    "latency_profile": latency_profile.name,
                },
            )
    except Exception as exc:
        if api_client:
            await api_client.record_event(
                session_id,
                "provider_error",
                severity="error",
                metadata={"error": str(exc)},
            )
        raise
    finally:
        if api_client and not ctx.room.isconnected():
            await cleanup_api_client("startup-ended-before-room-connected")


def _prewarmed_vad(ctx: JobContext) -> Any:
    vad = ctx.proc.userdata.get("vad")
    if vad is None:
        logger.warning("Silero VAD was not prewarmed; loading it during session startup.")
        vad = silero.VAD.load()
        ctx.proc.userdata["vad"] = vad
    return vad


def _instructions(context: dict[str, Any]) -> str:
    facts = "\n".join(
        f"- {fact['key']}: {fact['response']}"
        for fact in context.get("allowed_facts", [])
    )
    exams = "\n".join(
        f"- {exam['label']}: {exam['result']}"
        for exam in context.get("completed_examinations", [])
    )
    forbidden = ", ".join(context.get("forbidden_terms", []))
    return f"""
{context.get("patient_persona", "")}

Rules:
- You are the patient in a medical consultation simulation. You are NOT a call-center agent or assistant.
- Never speak first. Wait until the doctor asks a question, then answer only that question.
- Never greet with offers of help such as "Apa yang bisa saya bantu?" or similar assistant phrases.
- Address the doctor as "Dok", never as "Bu" or "Pak" as if they were your customer.
- Speak only as {context.get("patient_name", "the patient")}.
- Use Indonesian.
- Prefer one short sentence. Use two short sentences only if the doctor asks for detail.
- Answer only from allowed interview facts that match the doctor's question. Do not volunteer unrelated symptoms.
- Do not reveal diagnosis or mention these terms: {forbidden}.
- Do not invent new symptoms, history, examination findings, or test results.
- If the doctor asks something unclear or outside the facts, say: {SAFE_FALLBACK_TEXT}

Allowed interview facts:
{facts}

Completed examination results you may mention only if asked:
{exams or "- None yet."}
""".strip()


def _parse_metadata(value: str) -> dict[str, Any]:
    try:
        parsed = json.loads(value or "{}")
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _console_context() -> dict[str, Any]:
    case = get_case_config(DEFAULT_CASE_ID)
    return {
        "session_id": "console-session",
        "case_id": case.id,
        "patient_name": case.patient_name,
        "patient_persona": case.patient_persona,
        "tts_profile": case.tts_profile.model_dump(),
        "forbidden_terms": case.forbidden_terms,
        "allowed_facts": [
            {"key": fact.rubric_key or str(index), "response": fact.response}
            for index, fact in enumerate(case.patient_facts)
        ],
        "completed_examinations": [],
        "safety_rules": [
            "Do not reveal or name the diagnosis.",
            "Do not invent symptoms, history, examination findings, or test results.",
        ],
        "recent_messages": [],
    }


def main() -> None:
    mode = sys.argv[1] if len(sys.argv) > 1 else "health"

    if mode in {"console", "dev", "start"}:
        cli.run_app(server)
        return

    status = ServiceStatus(service="voice-agent", status="ok")
    print(status.model_dump_json(indent=2))
