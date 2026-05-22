# syntax=docker/dockerfile:1.7

FROM python:3.12-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:0.9.18 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /app/apps/api

COPY apps/api/pyproject.toml apps/api/uv.lock ./
COPY packages/shared-py /app/packages/shared-py

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --locked --no-dev --no-install-project

COPY apps/api /app/apps/api

RUN --mount=type=cache,target=/root/.cache/uv \
  uv sync --locked --no-dev --no-editable

FROM python:3.12-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/app/apps/api/.venv/bin:$PATH"

WORKDIR /app/apps/api

RUN addgroup --system app \
  && adduser --system --ingroup app app

COPY --from=builder --chown=app:app /app/apps/api/.venv /app/apps/api/.venv
COPY --from=builder --chown=app:app /app/apps/api/src /app/apps/api/src
COPY --from=builder --chown=app:app /app/packages/shared-py /app/packages/shared-py

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/healthz')"

CMD ["fastapi", "run", "src/pixelaid_api/main.py", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
