from __future__ import annotations

import asyncio
import logging
from typing import Any, Protocol, cast

from livekit.agents import AgentSession

from pixelaid_voice_agent.api_client import PixelAidApiClient

logger = logging.getLogger(__name__)


class EventRecorder(Protocol):
    def record(
        self,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, object] | None = None,
    ) -> None: ...


class SessionEventRecorder:
    def __init__(
        self,
        api_client: PixelAidApiClient | None,
        session_id: str,
        background_tasks: set[asyncio.Task[Any]],
    ) -> None:
        self._api_client = api_client
        self._session_id = session_id
        self._background_tasks = background_tasks
        self._closed = False

    @property
    def enabled(self) -> bool:
        return self._api_client is not None and not self._closed

    @property
    def session_id(self) -> str:
        return self._session_id

    @property
    def api_client(self) -> PixelAidApiClient | None:
        return self._api_client

    @property
    def background_tasks(self) -> set[asyncio.Task[Any]]:
        return self._background_tasks

    def close(self) -> None:
        self._closed = True

    async def drain(self) -> None:
        while self._background_tasks:
            pending = tuple(self._background_tasks)
            await asyncio.gather(*pending, return_exceptions=True)

    def record(
        self,
        event_type: str,
        *,
        severity: str = "info",
        metadata: dict[str, object] | None = None,
    ) -> None:
        if not self.enabled or self._api_client is None:
            return
        track_task(
            self._api_client.record_event(
                self._session_id,
                event_type,
                severity=severity,
                metadata=metadata or {},
            ),
            self._background_tasks,
        )


def track_task(
    coroutine: Any,
    background_tasks: set[asyncio.Task[Any]],
) -> None:
    task = asyncio.create_task(coroutine)
    background_tasks.add(task)

    def on_done(done: asyncio.Task[Any]) -> None:
        background_tasks.discard(done)
        if done.cancelled():
            return
        try:
            done.result()
        except Exception:
            logger.exception("background telemetry task failed")

    task.add_done_callback(on_done)


def wire_transcript_events(
    session: AgentSession,
    telemetry: SessionEventRecorder,
) -> None:
    api_client = telemetry.api_client
    if api_client is None:
        return

    session_id = telemetry.session_id
    background_tasks = telemetry.background_tasks

    @session.on("user_input_transcribed")
    def on_user_input(event: Any) -> None:
        if not telemetry.enabled:
            return
        if not event.is_final or not event.transcript.strip():
            return
        track_task(
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
        telemetry.record("stt_final", metadata={"chars": len(event.transcript)})

    @session.on("conversation_item_added")
    def on_conversation_item(event: Any) -> None:
        if not telemetry.enabled:
            return
        item = event.item
        if getattr(item, "role", None) != "assistant":
            return
        text = getattr(item, "text_content", None)
        if not text:
            return
        track_task(
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
        if not telemetry.enabled:
            return
        telemetry.record(
            "agent_state_changed",
            metadata={"old_state": event.old_state, "new_state": event.new_state},
        )

    @session.on("error")
    def on_error(event: Any) -> None:
        if not telemetry.enabled:
            return
        telemetry.record(
            "provider_error",
            severity="error",
            metadata={"error": str(event.error)},
        )


def wire_model_metrics(
    source: str,
    model: Any,
    telemetry: SessionEventRecorder,
) -> None:
    if not telemetry.enabled:
        return
    if not callable(getattr(model, "on", None)):
        return

    def on_metrics(metric: Any) -> None:
        telemetry.record(
            "voice_latency_metric",
            metadata=metric_metadata(source, metric),
        )

    cast(Any, model).on("metrics_collected", on_metrics)


def metric_metadata(source: str, metric: Any) -> dict[str, object]:
    metadata: dict[str, object] = {
        "source": source,
        "metric_type": str(getattr(metric, "type", type(metric).__name__)),
    }
    fields = [
        "label",
        "request_id",
        "streamed",
        "cancelled",
        "characters_count",
        "completion_tokens",
        "prompt_tokens",
        "total_tokens",
        "tokens_per_second",
        "input_tokens",
        "output_tokens",
    ]
    second_fields = [
        "duration",
        "ttft",
        "ttfb",
        "audio_duration",
        "acquire_time",
        "end_of_utterance_delay",
        "transcription_delay",
    ]
    for field in fields:
        value = getattr(metric, field, None)
        if isinstance(value, str | int | float | bool):
            metadata[field] = value
    for field in second_fields:
        value = getattr(metric, field, None)
        if isinstance(value, int | float):
            metadata[f"{field}_ms"] = round(float(value) * 1000)

    metric_metadata_obj = getattr(metric, "metadata", None)
    if metric_metadata_obj is not None and hasattr(metric_metadata_obj, "model_dump"):
        model_metadata = cast(Any, metric_metadata_obj).model_dump()
        model_name = model_metadata.get("model_name")
        model_provider = model_metadata.get("model_provider")
        if isinstance(model_name, str):
            metadata["model"] = model_name
        if isinstance(model_provider, str):
            metadata["provider"] = model_provider
    return metadata
