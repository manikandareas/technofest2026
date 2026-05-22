import json
import sys
import time
import asyncio
from typing import Any

from dotenv import load_dotenv
from livekit.agents import AgentServer, AgentSession, AutoSubscribe, JobContext, cli
from livekit.plugins import deepgram, openai
from pixelaid_shared import ServiceStatus
from pixelaid_shared.cases import get_case_config
from pixelaid_voice_agent.api_client import PixelAidApiClient
from pixelaid_voice_agent.config import get_settings
from pixelaid_voice_agent.patient_agent import SAFE_FALLBACK_TEXT, KoasPatientAgent

load_dotenv()

AGENT_NAME = "pixelaid-patient"
server = AgentServer()


@server.rtc_session(agent_name=AGENT_NAME)
async def patient_session(ctx: JobContext) -> None:
    settings = get_settings()
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
        session_id = "console-demo"
        metadata = {"session_id": session_id, "case_id": "demo", "actor": "console"}
    started = time.perf_counter()
    background_tasks: set[asyncio.Task[Any]] = set()
    try:
        if api_client:
            await api_client.record_event(session_id, "joined", metadata=metadata)
            context = await api_client.get_agent_context(session_id)
        else:
            context = _console_context()
        await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

        session = AgentSession()
        _wire_transcript_events(session, api_client, session_id, background_tasks)
        agent = KoasPatientAgent(
            context=context,
            api_client=api_client,
            session_id=session_id,
            instructions=_instructions(context),
            stt=deepgram.STT(
                model="nova-3",
                language="id",
                interim_results=True,
                smart_format=True,
                endpointing_ms=250,
                no_delay=True,
                filler_words=False,
                api_key=settings.deepgram_api_key or "",
            ),
            llm=openai.LLM(
                model="gpt-4.1-mini",
                api_key=settings.openai_api_key or "",
                temperature=0.2,
            ),
            tts=openai.TTS(
                voice=str(context.get("tts_profile", {}).get("voice_id") or "alloy"),
                model=str(
                    context.get("tts_profile", {}).get("model") or "gpt-4o-mini-tts"
                ),
                instructions=(
                    "Speak Indonesian clearly as a simulated patient. Keep the tone natural, "
                    "slightly worried, and concise."
                ),
                api_key=settings.openai_api_key or "",
            ),
        )
        await session.start(agent, room=ctx.room, record=False)
        if api_client:
            await api_client.record_event(
                session_id,
                "ready",
                metadata={"latency_ms": round((time.perf_counter() - started) * 1000)},
            )
        session.generate_reply(
            user_input=(
                "Sapa dokter koas dengan singkat sebagai Maya dan tunggu pertanyaan "
                "konsultasi pertama."
            ),
            instructions="Berikan sapaan pembuka singkat dalam Bahasa Indonesia.",
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
        if background_tasks:
            await asyncio.gather(*background_tasks, return_exceptions=True)
        if api_client:
            await api_client.record_event(session_id, "ended", metadata={})


def _wire_transcript_events(
    session: AgentSession,
    api_client: PixelAidApiClient | None,
    session_id: str,
    background_tasks: set[asyncio.Task[Any]],
) -> None:
    if api_client is None:
        return

    @session.on("user_input_transcribed")
    def on_user_input(event: Any) -> None:
        if not event.is_final or not event.transcript.strip():
            return
        _track_task(
            api_client.store_transcript(
                session_id,
                [
                    {
                        "external_id": f"stt:{event.created_at}",
                        "role": "user",
                        "content": event.transcript,
                        "metadata": {
                            "speaker_id": event.speaker_id,
                            "language": event.language,
                        },
                    }
                ],
            ),
            background_tasks,
        )
        _track_task(
            api_client.record_event(
                session_id,
                "stt_final",
                metadata={"chars": len(event.transcript)},
            ),
            background_tasks,
        )

    @session.on("conversation_item_added")
    def on_conversation_item(event: Any) -> None:
        item = event.item
        if getattr(item, "role", None) != "assistant":
            return
        text = getattr(item, "text_content", None)
        if not text:
            return
        _track_task(
            api_client.store_transcript(
                session_id,
                [
                    {
                        "external_id": f"agent:{getattr(item, 'id', event.created_at)}",
                        "role": "patient",
                        "content": text,
                        "metadata": {"source": "livekit-agent"},
                    }
                ],
            ),
            background_tasks,
        )

    @session.on("agent_state_changed")
    def on_agent_state(event: Any) -> None:
        _track_task(
            api_client.record_event(
                session_id,
                "agent_state_changed",
                metadata={"old_state": event.old_state, "new_state": event.new_state},
            ),
            background_tasks,
        )

    @session.on("error")
    def on_error(event: Any) -> None:
        _track_task(
            api_client.record_event(
                session_id,
                "provider_error",
                severity="error",
                metadata={"error": str(event.error)},
            ),
            background_tasks,
        )


def _track_task(
    coroutine: Any,
    background_tasks: set[asyncio.Task[Any]],
) -> None:
    task = asyncio.create_task(coroutine)
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)


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
- Speak only as {context.get("patient_name", "the patient")}.
- Use Indonesian.
- Keep replies concise, one or two sentences.
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
    case = get_case_config("demo")
    return {
        "session_id": "console-demo",
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
