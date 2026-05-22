# Pra-Development Bootstrap

This repo has been bootstrapped as the `technofest2026` monorepo. Cloud-linked resources should use the same project name:

- Supabase Cloud project: `technofest2026`
- LiveKit Cloud project: `technofest2026`

## Manual Cloud Steps

These steps require interactive login and cloud credentials, so they are intentionally left for an operator:

```bash
brew install supabase/tap/supabase
bunx supabase --version
supabase login
supabase orgs list
supabase projects create technofest2026 --org-id "$SUPABASE_ORG_ID" --region ap-southeast-1 --db-password "$SUPABASE_DB_PASSWORD"
supabase projects list
supabase --workdir packages/db link --project-ref "$SUPABASE_PROJECT_REF"
bun run db:types
```

If Homebrew is blocked by outdated macOS Command Line Tools, `bunx supabase` works for non-interactive CLI commands in this repo.

```bash
brew install livekit-cli
lk cloud auth
lk project list
lk token create --join --room bootstrap_smoke --identity bootstrap_user --valid-for 1h
```

Domain migrations and product endpoints start in Phase 1. The current bootstrap only includes runtime health, readiness, env wiring, route skeletons, and generated contracts.
