# syntax=docker/dockerfile:1.7

FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.9.18 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app/apps/voice-agent

COPY apps/voice-agent/pyproject.toml apps/voice-agent/uv.lock ./
COPY packages/shared-py /app/packages/shared-py

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --locked --no-dev --no-install-project

COPY apps/voice-agent /app/apps/voice-agent

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --locked --no-dev --no-editable \
  && uv run python -m livekit.agents download-files

FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/apps/voice-agent/.venv/bin:$PATH"

WORKDIR /app/apps/voice-agent

RUN addgroup --system app \
  && adduser --system --ingroup app app

COPY --from=builder --chown=app:app /app/apps/voice-agent/.venv /app/apps/voice-agent/.venv
COPY --from=builder --chown=app:app /app/apps/voice-agent/src /app/apps/voice-agent/src
COPY --from=builder --chown=app:app /app/packages/shared-py /app/packages/shared-py

USER app

CMD ["pixelaid-voice-agent", "start"]
