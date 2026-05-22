from __future__ import annotations

from collections.abc import AsyncIterable, AsyncGenerator
from typing import Any

from livekit import rtc
from livekit.agents import Agent, ModelSettings, llm
from livekit.agents.llm import StopResponse
from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import (
    CaseGameplayConfig,
    ExaminationConfig,
    MedicalRecord,
    PatientFact,
    VoiceReplyValidation,
    is_meaningful_user_transcript,
    validate_patient_reply,
)
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

    async def on_user_turn_completed(
        self,
        turn_ctx: llm.ChatContext,
        new_message: llm.ChatMessage,
    ) -> None:
        transcript = new_message.text_content or ""
        if not is_meaningful_user_transcript(transcript):
            self._record_event(
                "ignored_user_turn",
                "info",
                {"reason": "empty_or_noise_transcript", "transcript": transcript[:120]},
            )
            raise StopResponse()

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
                "Regenerate the patient reply. You are the patient, not an assistant. "
                "Never say offers of help such as 'Apa yang bisa saya bantu?'. "
                "Use only allowed interview facts that answer the doctor's question. "
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
        case_id = str(
            self._context.get("case_id")
            or "internal-medicine-dengue-warning-signs"
        )
        try:
            case = get_case_config(case_id)
        except KeyError:
            case = self._case_config_from_context(case_id)
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

    def _case_config_from_context(self, case_id: str) -> CaseGameplayConfig:
        allowed_facts = [
            fact
            for fact in self._context.get("allowed_facts", [])
            if isinstance(fact, dict) and fact.get("response")
        ]
        completed_examinations = [
            exam
            for exam in self._context.get("completed_examinations", [])
            if isinstance(exam, dict)
        ]
        medical_context = [
            str(fact["response"])
            for fact in allowed_facts
        ] + [
            str(exam.get("result") or exam.get("label") or "")
            for exam in completed_examinations
            if exam.get("result") or exam.get("label")
        ]

        return CaseGameplayConfig(
            id=case_id,
            patient_name=str(self._context.get("patient_name") or "Pasien"),
            timer_seconds=300,
            medical_record=MedicalRecord(
                summary="Voice-agent context supplied by PixelAid API.",
                history=medical_context,
                medications=[],
                allergies=[],
            ),
            patient_facts=[
                PatientFact(
                    keywords=[str(fact.get("key") or index), str(fact["response"])],
                    response=str(fact["response"]),
                    rubric_key=str(fact.get("key") or index),
                    allowed_terms=[str(fact["response"])],
                )
                for index, fact in enumerate(allowed_facts)
            ],
            examinations=[
                ExaminationConfig(
                    id=str(exam.get("id") or exam.get("score_key") or index),
                    label=str(exam.get("label") or exam.get("id") or "Pemeriksaan"),
                    category="completed",
                    delay_seconds=0,
                    result=str(exam.get("result") or ""),
                    score_key=str(exam.get("score_key") or exam.get("id") or index),
                    guard_terms=[str(exam.get("label") or "")],
                )
                for index, exam in enumerate(completed_examinations)
            ],
            quiz=[],
            interview_rubric=[
                str(fact.get("key") or index)
                for index, fact in enumerate(allowed_facts)
            ],
            examination_rubric=[
                str(exam.get("score_key") or exam.get("id") or index)
                for index, exam in enumerate(completed_examinations)
            ],
            feedback_template="",
            patient_persona=str(self._context.get("patient_persona") or ""),
            forbidden_terms=[
                str(term)
                for term in self._context.get("forbidden_terms", [])
                if str(term).strip()
            ],
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
