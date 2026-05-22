from __future__ import annotations

from collections.abc import AsyncIterable, AsyncGenerator
from typing import Any

from livekit import rtc
from livekit.agents import Agent, ModelSettings, llm
from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import VoiceReplyValidation, validate_patient_reply
from pixelaid_voice_agent.session_telemetry import EventRecorder

SAFE_FALLBACK_TEXT = "Maaf Dok, bisa ditanyakan lebih spesifik?"


class PixelAidPatientAgent(Agent):
    def __init__(
        self,
        *,
        context: dict[str, Any],
        telemetry: EventRecorder | None = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        self._context = context
        self._telemetry = telemetry

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        model_settings: ModelSettings,
    ) -> str:
        first_reply = await self._collect_reply(chat_ctx, tools, model_settings)
        first_validation = self._validate_reply(first_reply)
        if first_validation.ok:
            return first_reply

        self._record_event(
            "validation_failed",
            "warning",
            {"reply": first_reply[:300], "reasons": first_validation.reasons},
        )
        self._record_event(
            "safety_retry",
            "warning",
            {"attempt": 1, "reasons": first_validation.reasons},
        )
        retry_ctx = chat_ctx.copy()
        retry_ctx.add_message(
            role="system",
            content=(
                "Regenerate the patient reply. Use only allowed interview facts. "
                "Do not mention diagnosis, test names, or unperformed examination results. "
                f"If unsure, answer exactly: {SAFE_FALLBACK_TEXT}"
            ),
        )
        second_reply = await self._collect_reply(retry_ctx, tools, model_settings)
        second_validation = self._validate_reply(second_reply)
        if second_validation.ok:
            return second_reply

        self._record_event(
            "fallback_used",
            "warning",
            {"reply": second_reply[:300], "reasons": second_validation.reasons},
        )
        return SAFE_FALLBACK_TEXT

    async def tts_node(
        self,
        text: AsyncIterable[str],
        model_settings: ModelSettings,
    ) -> AsyncGenerator[rtc.AudioFrame, None]:
        try:
            async for frame in Agent.default.tts_node(self, text, model_settings):
                yield frame
        except Exception as exc:
            self._record_event("tts_failed", "error", {"error": str(exc)})
            raise

    async def _collect_reply(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        model_settings: ModelSettings,
    ) -> str:
        parts: list[str] = []
        stream = Agent.default.llm_node(self, chat_ctx, tools, model_settings)
        async for chunk in stream:
            if isinstance(chunk, str):
                parts.append(chunk)
                continue
            delta = getattr(chunk, "delta", None)
            if delta and delta.content:
                parts.append(delta.content)
        return "".join(parts).strip() or SAFE_FALLBACK_TEXT

    def _validate_reply(self, reply: str) -> VoiceReplyValidation:
        case = get_case_config(str(self._context.get("case_id") or "demo"))
        completed_exam_keys = {
            str(exam.get("score_key") or exam.get("id"))
            for exam in self._context.get("completed_examinations", [])
        }
        return validate_patient_reply(
            case,
            reply,
            used_fact_keys=set(),
            completed_exam_keys=completed_exam_keys,
        )

    def _record_event(
        self,
        event_type: str,
        severity: str,
        metadata: dict[str, object],
    ) -> None:
        if self._telemetry is None:
            return
        self._telemetry.record(event_type, severity=severity, metadata=metadata)
