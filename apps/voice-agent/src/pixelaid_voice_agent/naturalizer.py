from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

import httpx


@dataclass(frozen=True)
class NaturalizedReply:
    patient_reply: str
    used_fact_keys: set[str]
    needs_clarification: bool = False


class Naturalizer(Protocol):
    async def naturalize(
        self,
        *,
        user_transcript: str,
        context: dict[str, Any],
    ) -> NaturalizedReply: ...


class DeterministicNaturalizer:
    async def naturalize(
        self,
        *,
        user_transcript: str,
        context: dict[str, Any],
    ) -> NaturalizedReply:
        normalized = user_transcript.casefold()
        for fact in context.get("allowed_facts", []):
            if any(
                part in normalized
                for part in str(fact["response"]).casefold().split()[:3]
            ):
                return NaturalizedReply(
                    patient_reply=str(fact["response"]),
                    used_fact_keys={str(fact["key"])},
                )
        facts = context.get("allowed_facts", [])
        if facts:
            return NaturalizedReply(
                patient_reply=str(facts[0]["response"]),
                used_fact_keys={str(facts[0]["key"])},
            )
        return NaturalizedReply(
            patient_reply="Saya belum paham maksud pertanyaannya, Dok.",
            used_fact_keys=set(),
            needs_clarification=True,
        )


class OpenAiResponsesNaturalizer:
    def __init__(self, *, api_key: str, model: str = "gpt-4.1-mini") -> None:
        self._api_key = api_key
        self._model = model

    async def naturalize(
        self,
        *,
        user_transcript: str,
        context: dict[str, Any],
    ) -> NaturalizedReply:
        schema = {
            "type": "object",
            "additionalProperties": False,
            "properties": {
                "patient_reply": {"type": "string"},
                "used_fact_keys": {"type": "array", "items": {"type": "string"}},
                "needs_clarification": {"type": "boolean"},
            },
            "required": ["patient_reply", "used_fact_keys", "needs_clarification"],
        }
        payload = {
            "model": self._model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "You are only a naturalizer for an Indonesian medical "
                        "simulation patient. Use only allowed_facts. Do not reveal "
                        "diagnosis or examination results not present in context."
                    ),
                },
                {
                    "role": "user",
                    "content": {
                        "transcript": user_transcript,
                        "context": context,
                    },
                },
            ],
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": "patient_reply",
                    "strict": True,
                    "schema": schema,
                }
            },
        }
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                "https://api.openai.com/v1/responses",
                headers={"Authorization": f"Bearer {self._api_key}"},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
        output_text = _extract_output_text(data)
        parsed = httpx.Response(200, text=output_text).json()
        return NaturalizedReply(
            patient_reply=str(parsed["patient_reply"]),
            used_fact_keys={str(item) for item in parsed["used_fact_keys"]},
            needs_clarification=bool(parsed["needs_clarification"]),
        )


def _extract_output_text(data: dict[str, Any]) -> str:
    if isinstance(data.get("output_text"), str):
        return str(data["output_text"])
    for item in data.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                return str(content.get("text", "{}"))
    return "{}"
