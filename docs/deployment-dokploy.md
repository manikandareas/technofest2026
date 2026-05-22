# PixelAid Dokploy Deployment

PixelAid deploys as three Docker Compose services:

- `web`: Next.js standalone server, public.
- `api`: FastAPI production server, public or private behind Dokploy/Traefik.
- `voice-agent`: LiveKit Agents worker, private worker with no exposed port.

Use `docker-compose.production.yml` in Dokploy Docker Compose mode. Put the
values from `.env.production.example` into the Dokploy Environment tab.

## Domains

Recommended domains:

- `web`: `https://pixelaid.example.com`
- `api`: `https://api.pixelaid.example.com`
- `voice-agent`: no domain

In Dokploy, route domains to the internal service ports:

- `web` -> port `3000`
- `api` -> port `8000`

Do not publish host ports such as `3000:3000` or `8000:8000` in production.
Those bindings can conflict with other Dokploy apps on the same server.

`PIXELAID_PUBLIC_API_URL` must point to the public API URL used by the web app.
The voice agent uses the internal Compose network instead:

```txt
PIXELAID_API_URL=http://api:8000
```

## Runtime Notes

- Do not inject service-role keys, LiveKit secrets, or provider API keys into
  the `web` service.
- Run Supabase migrations as an explicit deployment step. Do not run migrations
  from API container startup.
- Keep `VOICE_LATENCY_PROFILE=ptt` for MVP push-to-talk voice latency.
- Prefer `TTS_PROVIDER=gemini` with `GOOGLE_API_KEY` for one fewer TTS proxy hop.
- If using `TTS_PROVIDER=openrouter`, provide `OPENROUTER_API_KEY`.

## Local Validation

Validate the compose file:

```bash
docker compose --env-file .env.production.example -f docker-compose.production.yml config
```

Build the images when Docker is available:

```bash
docker compose --env-file .env.production.example -f docker-compose.production.yml build
```
