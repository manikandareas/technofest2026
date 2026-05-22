from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from livekit.api import TokenVerifier
import pytest
from typing import Any, cast

from pixelaid_api.main import app, create_app
from pixelaid_api.services import gameplay
from pixelaid_api.services import clock
from pixelaid_api.services.profiles import clear_memory_profiles
from pixelaid_api.services import rate_limits
from pixelaid_api.services import supabase as supabase_service
from pixelaid_api.settings import Settings
from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import (
    FeedbackInput,
    ScoreBreakdown,
    calculate_retry_xp,
    calculate_xp,
    fallback_feedback,
    level_for_xp,
    stars_for_score,
    summarize_missed_categories,
)

DEV_AUTH = {"Authorization": "Bearer dev:test-user"}
ANON_AUTH = {"Authorization": "Bearer dev-anon:anon-user"}
CASE_ID = "internal-medicine-dengue-warning-signs"


@pytest.fixture(autouse=True)
def reset_memory_store(monkeypatch: pytest.MonkeyPatch) -> None:
    gameplay._sessions.clear()
    gameplay._messages.clear()
    gameplay._exams.clear()
    gameplay._results.clear()
    gameplay._attempts.clear()
    gameplay._voice_events.clear()
    clear_memory_profiles()
    gameplay._leaderboard.clear()
    rate_limits._memory_events.clear()
    monkeypatch.setattr(
        gameplay,
        "generate_structured_feedback",
        lambda payload: fallback_feedback(payload),
    )
    monkeypatch.setattr(rate_limits, "get_supabase_admin", lambda: None)


def patch_utc_now(monkeypatch: pytest.MonkeyPatch, moment: datetime) -> None:
    monkeypatch.setattr(clock, "utc_now", lambda: moment)


def test_anonymous_user_completes_published_case(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)

    created = client.post(
        "/api/case-sessions",
        headers=ANON_AUTH,
        json={"case_id": CASE_ID},
    )
    assert created.status_code == 200
    session_id = created.json()["id"]
    assert created.json()["status"] == "brief"

    loaded = client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    assert loaded.status_code == 200
    assert loaded.json()["status"] == "in_consultation"

    message = client.post(
        f"/api/case-sessions/{session_id}/messages",
        headers=ANON_AUTH,
        json={"content": "Kapan demam mulai dan apakah ada keluhan penyerta?"},
    )
    assert message.status_code == 200
    assert "3 hari" in message.json()["patient_message"]["content"]

    record = client.post(
        f"/api/case-sessions/{session_id}/medical-record/opened",
        headers=ANON_AUTH,
    )
    assert record.status_code == 200
    assert record.json()["medical_record_opened"] is True

    exam = client.post(
        f"/api/case-sessions/{session_id}/examinations",
        headers=ANON_AUTH,
        json={"examination_id": "vitals"},
    )
    assert exam.status_code == 200
    assert exam.json()["examinations"][0]["status"] == "resulted"

    early_extension = client.post(
        f"/api/case-sessions/{session_id}/timer/extend",
        headers=ANON_AUTH,
    )
    assert early_extension.status_code == 409

    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation",
        headers=ANON_AUTH,
    )
    assert ended.status_code == 200
    assert ended.json()["status"] == "quiz"

    submitted = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=ANON_AUTH,
        json={"answers": _correct_answers(CASE_ID)},
    )
    assert submitted.status_code == 200
    result = submitted.json()
    assert result["score"] > 50
    assert result["stars"] >= 1
    assert result["xp_awarded"] > 0

    history = client.get("/api/history", headers=ANON_AUTH)
    assert history.status_code == 200
    assert history.json()["items"][0]["result_id"] == result["id"]

    leaderboard = client.get("/api/leaderboard").json()
    assert leaderboard["entries"] == []


def test_timer_is_server_authoritative_and_blocks_expired_mutations(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]

    started = client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    assert started.status_code == 200
    assert started.json()["status"] == "in_consultation"
    assert started.json()["remaining_seconds"] == timer_seconds
    state = gameplay._sessions[session_id]["session_state"]
    assert state["timer_started_at"] == now.isoformat()
    assert state["timer_budget_seconds"] == timer_seconds

    later = now + timedelta(seconds=75)
    patch_utc_now(monkeypatch, later)
    loaded = client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    assert loaded.status_code == 200
    assert loaded.json()["remaining_seconds"] == timer_seconds - 75

    expired = now + timedelta(seconds=timer_seconds + 1)
    patch_utc_now(monkeypatch, expired)
    for method, path, body in [
        ("post", f"/api/case-sessions/{session_id}/messages", {"content": "Nyeri?"}),
        ("post", f"/api/case-sessions/{session_id}/medical-record/opened", None),
        (
            "post",
            f"/api/case-sessions/{session_id}/examinations",
            {"examination_id": "vitals"},
        ),
    ]:
        response = getattr(client, method)(path, headers=ANON_AUTH, json=body)
        assert response.status_code == 409
        assert response.json()["detail"] == "Consultation time has expired."

    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation", headers=ANON_AUTH
    )
    assert ended.status_code == 200
    assert ended.json()["status"] == "quiz"
    assert ended.json()["remaining_seconds"] == 0


def test_timer_extension_after_expiry_restarts_once(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)

    expired = now + timedelta(seconds=timer_seconds + 1)
    patch_utc_now(monkeypatch, expired)
    extended = client.post(
        f"/api/case-sessions/{session_id}/timer/extend", headers=ANON_AUTH
    )
    assert extended.status_code == 200
    assert extended.json() == {"remaining_seconds": 60, "used_extension": True}

    after_extension = expired + timedelta(seconds=15)
    patch_utc_now(monkeypatch, after_extension)
    loaded = client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    assert loaded.json()["remaining_seconds"] == 45

    second_extension = client.post(
        f"/api/case-sessions/{session_id}/timer/extend", headers=ANON_AUTH
    )
    assert second_extension.status_code == 409

    message = client.post(
        f"/api/case-sessions/{session_id}/messages",
        headers=ANON_AUTH,
        json={"content": "Kapan mulai?"},
    )
    assert message.status_code == 200


def test_scoring_uses_frozen_remaining_time_at_consultation_end(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)

    ended_at = now + timedelta(seconds=30)
    patch_utc_now(monkeypatch, ended_at)
    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation", headers=ANON_AUTH
    )
    assert ended.status_code == 200
    assert ended.json()["remaining_seconds"] == timer_seconds - 30

    after_timer_would_have_expired = now + timedelta(minutes=20)
    patch_utc_now(monkeypatch, after_timer_would_have_expired)
    submitted = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=ANON_AUTH,
        json={"answers": _correct_answers(CASE_ID)},
    )
    assert submitted.status_code == 200
    assert submitted.json()["score_breakdown"]["time"] > 0


def test_pause_freezes_remaining_seconds_and_resume_continues(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)

    paused_at = now + timedelta(seconds=45)
    patch_utc_now(monkeypatch, paused_at)
    paused = client.post(
        f"/api/case-sessions/{session_id}/pause", headers=ANON_AUTH
    )
    assert paused.status_code == 200
    assert paused.json()["is_paused"] is True
    assert paused.json()["remaining_seconds"] == timer_seconds - 45

    much_later = now + timedelta(minutes=20)
    patch_utc_now(monkeypatch, much_later)
    loaded = client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    assert loaded.status_code == 200
    assert loaded.json()["is_paused"] is True
    assert loaded.json()["remaining_seconds"] == timer_seconds - 45

    resumed = client.post(
        f"/api/case-sessions/{session_id}/resume", headers=ANON_AUTH
    )
    assert resumed.status_code == 200
    assert resumed.json()["is_paused"] is False
    assert resumed.json()["remaining_seconds"] == timer_seconds - 45

    after_resume = much_later + timedelta(seconds=10)
    patch_utc_now(monkeypatch, after_resume)
    loaded_after_resume = client.get(
        f"/api/case-sessions/{session_id}", headers=ANON_AUTH
    )
    assert loaded_after_resume.json()["remaining_seconds"] == timer_seconds - 55


def test_paused_consultation_blocks_interactions_and_livekit_token(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(gameplay, "_ensure_livekit_agent_dispatch", _noop_dispatch)
    settings = cast(Any, Settings)(
        _env_file=None,
        livekit_url="wss://pixel-medic.test",
        livekit_api_key="dev-key",
        livekit_api_secret="dev-secret",
    )
    client = TestClient(create_app(settings))
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)
    client.post(f"/api/case-sessions/{session_id}/pause", headers=ANON_AUTH)

    for method, path, body in [
        ("post", f"/api/case-sessions/{session_id}/messages", {"content": "Nyeri?"}),
        ("post", f"/api/case-sessions/{session_id}/medical-record/opened", None),
        (
            "post",
            f"/api/case-sessions/{session_id}/examinations",
            {"examination_id": "vitals"},
        ),
        ("post", f"/api/case-sessions/{session_id}/timer/extend", None),
        ("post", "/api/livekit/token", {"session_id": session_id}),
    ]:
        response = getattr(client, method)(path, headers=ANON_AUTH, json=body)
        assert response.status_code == 409
        assert response.json()["detail"] == "Consultation is paused."


def test_end_consultation_while_paused_scores_with_frozen_time(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds
    session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=ANON_AUTH)

    paused_at = now + timedelta(seconds=25)
    patch_utc_now(monkeypatch, paused_at)
    client.post(f"/api/case-sessions/{session_id}/pause", headers=ANON_AUTH)

    after_expiry = now + timedelta(minutes=30)
    patch_utc_now(monkeypatch, after_expiry)
    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation", headers=ANON_AUTH
    )
    assert ended.status_code == 200
    assert ended.json()["status"] == "quiz"
    assert ended.json()["is_paused"] is False
    assert ended.json()["remaining_seconds"] == timer_seconds - 25

    submitted = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=ANON_AUTH,
        json={"answers": _correct_answers(CASE_ID)},
    )
    assert submitted.status_code == 200
    assert submitted.json()["score_breakdown"]["time"] > 0


def test_pause_resume_reject_invalid_or_expired_sessions(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    now = datetime(2026, 5, 22, 8, 0, tzinfo=timezone.utc)
    patch_utc_now(monkeypatch, now)
    client = TestClient(app)
    timer_seconds = get_case_config(CASE_ID).timer_seconds

    expired_session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{expired_session_id}", headers=ANON_AUTH)
    patch_utc_now(monkeypatch, now + timedelta(seconds=timer_seconds + 1))
    pause_expired = client.post(
        f"/api/case-sessions/{expired_session_id}/pause", headers=ANON_AUTH
    )
    resume_expired = client.post(
        f"/api/case-sessions/{expired_session_id}/resume", headers=ANON_AUTH
    )
    assert pause_expired.status_code == 409
    assert resume_expired.status_code == 409

    patch_utc_now(monkeypatch, now)
    quiz_session_id = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    ).json()["id"]
    client.get(f"/api/case-sessions/{quiz_session_id}", headers=ANON_AUTH)
    client.post(
        f"/api/case-sessions/{quiz_session_id}/end-consultation", headers=ANON_AUTH
    )
    for action in ["pause", "resume"]:
        response = client.post(
            f"/api/case-sessions/{quiz_session_id}/{action}", headers=ANON_AUTH
        )
        assert response.status_code == 409


def test_phase_4_domain_helpers() -> None:
    assert calculate_xp(100, 87, "easy") == 87
    assert calculate_xp(100, 87, "medium") == 109
    assert calculate_xp(100, 87, "hard") == 131
    assert calculate_retry_xp(109) == 22
    assert level_for_xp(0) == 1
    assert level_for_xp(199) == 2
    assert stars_for_score(39, 5) == 1
    assert stars_for_score(40, 5) == 2
    assert stars_for_score(70, 5) == 3
    assert stars_for_score(100, 0) == 2


def test_feedback_fallback_and_missed_category_summary() -> None:
    case = get_case_config(CASE_ID)
    missed_interview, missed_exams, missed_safety = summarize_missed_categories(
        case,
        {**_correct_answers(CASE_ID), "next-best-step": "unsafe"},
        {"onset"},
        {"vitals"},
    )
    assert "asked_bleeding_warning" in missed_interview
    assert "ordered_ns1" in missed_exams
    assert missed_safety == ["next-best-step"]

    feedback = fallback_feedback(
        FeedbackInput(
            case_id=CASE_ID,
            patient_name="Raka",
            score=55,
            stars=2,
            score_breakdown=ScoreBreakdown(
                quiz=18,
                interview=5,
                examination=5,
                medical_record=10,
                time=5,
                safety=0,
                total=43,
            ),
            missed_interview=missed_interview,
            missed_examinations=missed_exams,
            missed_safety_questions=missed_safety,
            case_feedback_template=case.feedback_template,
        )
    )
    assert feedback.source == "fallback"
    assert feedback.safety_note
    assert not any("XP" in item for item in [feedback.summary, *feedback.improvements])


def test_authenticated_retry_profile_and_leaderboard(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)

    first = _complete_case(client, DEV_AUTH)
    second = _complete_case(client, DEV_AUTH)

    assert first["xp_awarded"] == first["score"]
    assert first["is_retry"] is False
    assert second["is_retry"] is True
    assert second["xp_awarded"] == calculate_retry_xp(second["score"])

    profile = client.get("/api/me", headers=DEV_AUTH).json()
    assert profile["progress"]["total_xp"] == first["xp_awarded"] + second["xp_awarded"]
    assert profile["progress"]["completed_cases"] == 1

    leaderboard = client.get("/api/leaderboard").json()
    assert leaderboard["entries"][0]["user_id"] == "test-user"
    assert leaderboard["entries"][0]["total_xp"] == profile["progress"]["total_xp"]


def test_anonymous_progress_is_hidden_until_upgrade(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)
    anonymous_result = _complete_case(client, ANON_AUTH)
    profile = client.get("/api/me", headers=ANON_AUTH).json()
    assert profile["profile"]["is_anonymous"] is True
    assert profile["progress"]["total_xp"] == anonymous_result["xp_awarded"]
    assert client.get("/api/leaderboard").json()["entries"] == []

    upgraded = client.get(
        "/api/me", headers={"Authorization": "Bearer dev:anon-user"}
    ).json()
    assert upgraded["profile"]["is_anonymous"] is False
    leaderboard = client.get("/api/leaderboard").json()
    assert leaderboard["entries"][0]["user_id"] == "anon-user"
    assert leaderboard["entries"][0]["total_xp"] == anonymous_result["xp_awarded"]


def test_x_guest_session_header_does_not_authorize(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    response = TestClient(app).post(
        "/api/case-sessions",
        headers={"X-Guest-Session": "guest-test"},
        json={"case_id": "internal-medicine-diabetes-hyperglycemia"},
    )

    assert response.status_code == 401


def test_anonymous_case_session_limit_returns_retry_after(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    settings = cast(Any, Settings)(
        _env_file=None,
        anonymous_case_session_limit=1,
        anonymous_case_session_window_seconds=3600,
    )
    client = TestClient(create_app(settings))

    first = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    )
    second = client.post(
        "/api/case-sessions", headers=ANON_AUTH, json={"case_id": CASE_ID}
    )

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.headers["retry-after"].isdigit()
    assert all("anon-user" not in str(event) for event in rate_limits._memory_events)


def test_anonymous_voice_token_limit_uses_rate_limit_events(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(gameplay, "_ensure_livekit_agent_dispatch", _noop_dispatch)
    settings = cast(Any, Settings)(
        _env_file=None,
        livekit_url="wss://pixel-medic.test",
        livekit_api_key="dev-key",
        livekit_api_secret="dev-secret",
        anonymous_voice_token_limit=1,
        anonymous_voice_token_window_seconds=3600,
    )
    client = TestClient(create_app(settings))
    session_id = client.post(
        "/api/case-sessions",
        headers=ANON_AUTH,
        json={"case_id": CASE_ID},
    ).json()["id"]

    first = client.post(
        "/api/livekit/token", headers=ANON_AUTH, json={"session_id": session_id}
    )
    second = client.post(
        "/api/livekit/token", headers=ANON_AUTH, json={"session_id": session_id}
    )

    assert first.status_code == 200
    assert second.status_code == 429
    assert rate_limits._memory_events[-1]["scope"] == "anonymous_voice_tokens"


def test_ai_feedback_generation_limit_falls_before_result_write(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    settings = cast(Any, Settings)(
        _env_file=None,
        ai_feedback_generation_limit=0,
        ai_feedback_generation_window_seconds=86400,
    )
    client = TestClient(create_app(settings))
    created = client.post(
        "/api/case-sessions", headers=DEV_AUTH, json={"case_id": CASE_ID}
    )
    session_id = created.json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=DEV_AUTH)
    client.post(f"/api/case-sessions/{session_id}/end-consultation", headers=DEV_AUTH)

    response = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=DEV_AUTH,
        json={"answers": {"diagnosis": "acs", "next_step": "serial_ecg_trop"}},
    )

    assert response.status_code == 429
    assert gameplay._results == {}


def test_demo_claim_endpoint_is_removed(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)
    anonymous_result = _complete_case(client, ANON_AUTH)

    response = client.post(
        f"/api/demo/{anonymous_result['session_id']}/claim",
        headers=DEV_AUTH,
        json={"token": "wrong-token"},
    )
    assert response.status_code == 404


def test_authenticated_user_completes_all_internal_medicine_cases(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)

    for case_id, answers, expected_case_id in [
        (CASE_ID, _correct_answers(CASE_ID), "internal-medicine-dengue-warning-signs"),
        (
            "internal-medicine-diabetes-hyperglycemia",
            _correct_answers("internal-medicine-diabetes-hyperglycemia"),
            "internal-medicine-diabetes-hyperglycemia",
        ),
        (
            "internal-medicine-pneumonia",
            _correct_answers("internal-medicine-pneumonia"),
            "internal-medicine-pneumonia",
        ),
    ]:
        created = client.post(
            "/api/case-sessions",
            headers=DEV_AUTH,
            json={"case_id": case_id},
        )
        assert created.status_code == 200
        session_id = created.json()["id"]
        client.get(f"/api/case-sessions/{session_id}", headers=DEV_AUTH)
        client.post(
            f"/api/case-sessions/{session_id}/messages",
            headers=DEV_AUTH,
            json={"content": "Kapan mulai dan apakah ada keluhan penyerta?"},
        )
        client.post(
            f"/api/case-sessions/{session_id}/medical-record/opened",
            headers=DEV_AUTH,
        )
        client.post(
            f"/api/case-sessions/{session_id}/examinations",
            headers=DEV_AUTH,
            json={"examination_id": "vitals"},
        )
        client.post(
            f"/api/case-sessions/{session_id}/end-consultation", headers=DEV_AUTH
        )
        submitted = client.post(
            f"/api/case-sessions/{session_id}/quiz-submit",
            headers=DEV_AUTH,
            json={"answers": answers},
        )
        assert submitted.status_code == 200
        assert submitted.json()["case"]["id"] == expected_case_id


def test_contract_contains_gameplay_endpoints() -> None:
    schema = app.openapi()
    for path in [
        "/api/case-sessions",
        "/api/case-sessions/{session_id}/messages",
        "/api/case-sessions/{session_id}/quiz-submit",
        "/api/case-results/{result_id}",
        "/api/history",
        "/api/history/{result_id}",
        "/api/livekit/token",
        "/api/livekit/sessions/{session_id}/agent-context",
        "/api/livekit/sessions/{session_id}/transcript",
        "/api/livekit/sessions/{session_id}/events",
    ]:
        assert path in schema["paths"]


def test_livekit_token_is_room_scoped_and_dispatches_agent(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(gameplay, "_ensure_livekit_agent_dispatch", _noop_dispatch)
    settings = cast(Any, Settings)(
        _env_file=None,
        livekit_url="wss://pixel-medic.test",
        livekit_api_key="dev-key",
        livekit_api_secret="dev-secret",
        voice_agent_api_token="voice-token",
    )
    client = TestClient(create_app(settings))
    created = client.post(
        "/api/case-sessions",
        headers=ANON_AUTH,
        json={"case_id": CASE_ID},
    )
    session_id = created.json()["id"]

    response = client.post(
        "/api/livekit/token",
        headers=ANON_AUTH,
        json={"session_id": session_id},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["room_name"] == f"case-session-{session_id}"
    claims = TokenVerifier("dev-key", "dev-secret").verify(body["token"])
    assert claims.video is not None
    assert claims.identity == "user:anon-user"
    assert claims.video.room == body["room_name"]
    assert claims.video.room_join is True
    assert claims.video.room_admin is None
    assert claims.room_config is not None
    assert claims.room_config.agents[0].agent_name == "pixelaid-patient"


def test_voice_agent_context_and_transcript_are_agent_only(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    settings = cast(Any, Settings)(_env_file=None, voice_agent_api_token="voice-token")
    client = TestClient(create_app(settings))
    session_id = client.post(
        "/api/case-sessions",
        headers=DEV_AUTH,
        json={"case_id": CASE_ID},
    ).json()["id"]

    assert (
        client.get(
            f"/api/livekit/sessions/{session_id}/agent-context",
            headers=DEV_AUTH,
        ).status_code
        == 403
    )

    context = client.get(
        f"/api/livekit/sessions/{session_id}/agent-context",
        headers={"Authorization": "Bearer voice-token"},
    )
    assert context.status_code == 200
    assert context.json()["patient_name"] == "Raka"
    assert context.json()["completed_examinations"] == []

    first = client.post(
        f"/api/livekit/sessions/{session_id}/transcript",
        headers={"Authorization": "Bearer voice-token"},
        json={
            "messages": [
                {
                    "external_id": "voice-1",
                    "role": "user",
                    "content": "Kapan mulai?",
                    "metadata": {"provider": "deepgram"},
                }
            ]
        },
    )
    second = client.post(
        f"/api/livekit/sessions/{session_id}/transcript",
        headers={"Authorization": "Bearer voice-token"},
        json={
            "messages": [
                {
                    "external_id": "voice-1",
                    "role": "user",
                    "content": "Kapan mulai?",
                }
            ]
        },
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["messages"][0]["id"] == second.json()["messages"][0]["id"]

    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation",
        headers=DEV_AUTH,
    )
    assert ended.status_code == 200
    assert ended.json()["status"] == "quiz"

    late = client.post(
        f"/api/livekit/sessions/{session_id}/transcript",
        headers={"Authorization": "Bearer voice-token"},
        json={
            "messages": [
                {
                    "external_id": "voice-late",
                    "role": "user",
                    "content": "Transcript final yang telat setelah disconnect.",
                    "metadata": {"provider": "deepgram"},
                }
            ]
        },
    )
    assert late.status_code == 200
    assert late.json()["messages"][0]["content"] == (
        "Transcript final yang telat setelah disconnect."
    )


async def _noop_dispatch(*args: object, **kwargs: object) -> None:
    return None


def _complete_case(client: TestClient, headers: dict[str, str]) -> dict[str, Any]:
    created = client.post(
        "/api/case-sessions", headers=headers, json={"case_id": CASE_ID}
    )
    session_id = created.json()["id"]
    client.get(f"/api/case-sessions/{session_id}", headers=headers)
    client.post(
        f"/api/case-sessions/{session_id}/messages",
        headers=headers,
        json={"content": "Kapan mulai dan apakah nyeri menjalar?"},
    )
    client.post(
        f"/api/case-sessions/{session_id}/medical-record/opened", headers=headers
    )
    client.post(
        f"/api/case-sessions/{session_id}/examinations",
        headers=headers,
        json={"examination_id": "vitals"},
    )
    client.post(f"/api/case-sessions/{session_id}/end-consultation", headers=headers)
    response = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=headers,
        json={"answers": _correct_answers(CASE_ID)},
    )
    assert response.status_code == 200
    return cast(dict[str, Any], response.json())


def _correct_answers(case_id: str) -> dict[str, str]:
    config = get_case_config(case_id)
    return {question.id: question.correct_option_id for question in config.quiz}
