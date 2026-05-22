from __future__ import annotations

from collections.abc import AsyncIterable, AsyncGenerator
from typing import Any

from livekit import rtc
from livekit.agents import Agent, ModelSettings, llm
from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import validate_patient_reply
from pixelaid_voice_agent.api_client import PixelAidApiClient

SAFE_FALLBACK_TEXT = "Maaf Dok, bisa ditanyakan lebih spesifik?"


class KoasPatientAgent(Agent):
    def __init__(
        self,
        *,
        context: dict[str, Any],
        api_client: PixelAidApiClient | None,
        session_id: str,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        self._context = context
        self._api_client = api_client
        self._session_id = session_id

    async def llm_node(
        self,
        chat_ctx: llm.ChatContext,
        tools: list[llm.Tool],
        model_settings: ModelSettings,
    ) -> str:
        first_reply = await self._collect_reply(chat_ctx, tools, model_settings)
        if self._is_safe(first_reply):
            return first_reply

        await self._record_event(
            "validation_failed",
            "warning",
            {"reply": first_reply[:300]},
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
        if self._is_safe(second_reply):
            return second_reply

        await self._record_event(
            "fallback_used",
            "warning",
            {"reply": second_reply[:300]},
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
            await self._record_event("tts_failed", "error", {"error": str(exc)})
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

    def _is_safe(self, reply: str) -> bool:
        case = get_case_config(str(self._context.get("case_id") or "demo"))
        allowed_keys = {
            str(fact.get("key"))
            for fact in self._context.get("allowed_facts", [])
            if fact.get("key")
        }
        completed_exam_keys = {
            str(exam.get("score_key") or exam.get("id"))
            for exam in self._context.get("completed_examinations", [])
        }
        return validate_patient_reply(
            case,
            reply,
            used_fact_keys=allowed_keys,
            completed_exam_keys=completed_exam_keys,
        ).ok

    async def _record_event(
        self,
        event_type: str,
        severity: str,
        metadata: dict[str, object],
    ) -> None:
        if self._api_client is None:
            return
        await self._api_client.record_event(
            self._session_id,
            event_type,
            severity=severity,
            metadata=metadata,
        )
