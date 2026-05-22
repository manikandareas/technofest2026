from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
PHASE_5_MIGRATION = (
    ROOT / "packages/db/supabase/migrations/202605221106_phase_5_release_hardening.sql"
)


def test_phase_5_migration_locks_rate_limits_and_guest_claim_function() -> None:
    sql = PHASE_5_MIGRATION.read_text()

    assert "create table if not exists public.rate_limit_events" in sql
    assert "alter table public.rate_limit_events enable row level security" in sql
    assert "create policy" not in sql
    assert "set search_path = ''" in sql
    assert "revoke execute on function public.claim_guest_demo_result" in sql
    assert "from anon" in sql
    assert "from authenticated" in sql
    assert "grant execute on function public.claim_guest_demo_result" in sql
    assert "to service_role" in sql
