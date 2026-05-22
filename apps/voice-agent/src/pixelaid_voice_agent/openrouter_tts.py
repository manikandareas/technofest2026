from __future__ import annotations

from dataclasses import dataclass
from time import perf_counter

import httpx
from livekit.agents import (
    APIConnectionError,
    APIConnectOptions,
    APIStatusError,
    APITimeoutError,
    tts,
)
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS

SAMPLE_RATE = 24000
NUM_CHANNELS = 1


@dataclass(frozen=True)
class OpenRouterTtsOptions:
    api_key: str
    model: str
    voice: str
    base_url: str = "https://openrouter.ai/api/v1"
    response_format: str = "pcm"
    speed: float = 1.0


class OpenRouterTTS(tts.TTS):
    def __init__(self, options: OpenRouterTtsOptions) -> None:
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=SAMPLE_RATE,
            num_channels=NUM_CHANNELS,
        )
        self._options = options
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=15.0, read=30.0, write=10.0, pool=5.0),
            follow_redirects=True,
            limits=httpx.Limits(
                max_connections=20,
                max_keepalive_connections=20,
                keepalive_expiry=120,
            ),
        )

    @property
    def model(self) -> str:
        return self._options.model

    @property
    def provider(self) -> str:
        return "openrouter"

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> tts.ChunkedStream:
        return OpenRouterChunkedStream(
            tts=self,
            input_text=text,
            conn_options=conn_options,
        )

    async def aclose(self) -> None:
        await self._client.aclose()


class OpenRouterChunkedStream(tts.ChunkedStream):
    def __init__(
        self,
        *,
        tts: OpenRouterTTS,
        input_text: str,
        conn_options: APIConnectOptions,
    ) -> None:
        super().__init__(tts=tts, input_text=input_text, conn_options=conn_options)
        self._tts: OpenRouterTTS = tts

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        options = self._tts._options
        url = f"{options.base_url.rstrip('/')}/audio/speech"
        payload = {
            "model": options.model,
            "input": self.input_text,
            "voice": options.voice,
            "response_format": options.response_format,
            "speed": options.speed,
        }
        headers = {
            "Authorization": f"Bearer {options.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with self._tts._client.stream(
                "POST",
                url,
                headers=headers,
                json=payload,
                timeout=httpx.Timeout(30, connect=self._conn_options.timeout),
            ) as response:
                if response.status_code >= 400:
                    body = await response.aread()
                    raise APIStatusError(
                        body.decode("utf-8", errors="replace"),
                        status_code=response.status_code,
                        request_id=response.headers.get("x-generation-id") or "",
                        body=body,
                    )

                request_id = response.headers.get("x-generation-id") or ""
                output_emitter.initialize(
                    request_id=request_id,
                    sample_rate=SAMPLE_RATE,
                    num_channels=NUM_CHANNELS,
                    mime_type=f"audio/{options.response_format}",
                )
                async for data in response.aiter_bytes():
                    if data:
                        output_emitter.push(data)

            output_emitter.flush()
        except httpx.TimeoutException:
            raise APITimeoutError() from None
        except APIStatusError:
            raise
        except Exception as exc:
            raise APIConnectionError() from exc
