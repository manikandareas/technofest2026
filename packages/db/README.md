# technofest2026 Supabase Workspace

Supabase CLI files live here so migrations, seed data, and generated database types stay isolated from app code.

Cloud project name: `technofest2026`.

```bash
supabase --workdir packages/db init
supabase --workdir packages/db link --project-ref "$SUPABASE_PROJECT_REF"
bun run db:types
```

No product schema is pushed during pra-development. Phase 1 owns domain migrations.
