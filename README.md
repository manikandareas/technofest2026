# technofest2026

PixelAid pra-development bootstrap for the `technofest2026` workspace.

## Structure

```txt
apps/web             Next.js App Router PWA shell
apps/api             FastAPI health/readiness and OpenAPI source
apps/voice-agent     LiveKit Agents Python smoke worker scaffold
packages/db          Supabase CLI workspace
packages/contracts   Generated OpenAPI contract and typed client
packages/shared-py   Shared Python schemas and utilities
```

## Local bootstrap

```bash
bun install
cd apps/api && uv sync
cd ../../apps/voice-agent && uv sync
bun run contracts:generate
```

Cloud projects should use the parent folder name: `technofest2026`.
