from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PHASE_5_MIGRATION = (
    ROOT / "packages/db/supabase/migrations/202605221106_phase_5_release_hardening.sql"
)
ANONYMOUS_GUEST_MIGRATION = (
    ROOT / "packages/db/supabase/migrations/202605221108_supabase_anonymous_guests.sql"
)


def test_phase_5_migration_locks_rate_limits() -> None:
    sql = PHASE_5_MIGRATION.read_text()

    assert "create table if not exists public.rate_limit_events" in sql
    assert "alter table public.rate_limit_events enable row level security" in sql
    assert "create policy" not in sql


def test_anonymous_guest_migration_removes_custom_guest_claim_model() -> None:
    sql = ANONYMOUS_GUEST_MIGRATION.read_text()

    assert "add column if not exists is_anonymous" in sql
    assert "drop function if exists public.claim_guest_demo_result" in sql
    assert "drop table if exists public.guest_sessions" in sql
    assert "drop column if exists guest_session_id" in sql
    assert "alter column user_id set not null" in sql
    assert "drop column if exists is_demo" in sql
    assert "p.is_anonymous = false" in sql
