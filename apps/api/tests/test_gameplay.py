from fastapi.testclient import TestClient
from livekit.api import TokenVerifier
import pytest
from typing import Any, cast

from pixelaid_api.main import app, create_app
from pixelaid_api.services import gameplay
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
GUEST_AUTH = {"X-Guest-Session": "guest-test"}


@pytest.fixture(autouse=True)
def reset_memory_store(monkeypatch: pytest.MonkeyPatch) -> None:
    gameplay._sessions.clear()
    gameplay._messages.clear()
    gameplay._exams.clear()
    gameplay._results.clear()
    gameplay._attempts.clear()
    gameplay._voice_events.clear()
    gameplay._profiles.clear()
    gameplay._leaderboard.clear()
    rate_limits._memory_events.clear()
    monkeypatch.setattr(
        gameplay,
        "generate_structured_feedback",
        lambda payload: fallback_feedback(payload),
    )
    monkeypatch.setattr(rate_limits, "get_supabase_admin", lambda: None)


def test_guest_completes_maya_demo(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)

    created = client.post(
        "/api/case-sessions",
        headers=GUEST_AUTH,
        json={"case_id": "demo"},
    )
    assert created.status_code == 200
    session_id = created.json()["id"]
    assert created.json()["status"] == "brief"

    loaded = client.get(f"/api/case-sessions/{session_id}", headers=GUEST_AUTH)
    assert loaded.status_code == 200
    assert loaded.json()["status"] == "in_consultation"

    message = client.post(
        f"/api/case-sessions/{session_id}/messages",
        headers=GUEST_AUTH,
        json={"content": "Kapan nyeri mulai dan apakah menjalar?"},
    )
    assert message.status_code == 200
    assert "dua jam" in message.json()["patient_message"]["content"]

    record = client.post(
        f"/api/case-sessions/{session_id}/medical-record/opened",
        headers=GUEST_AUTH,
    )
    assert record.status_code == 200
    assert record.json()["medical_record_opened"] is True

    exam = client.post(
        f"/api/case-sessions/{session_id}/examinations",
        headers=GUEST_AUTH,
        json={"examination_id": "vitals"},
    )
    assert exam.status_code == 200
    assert exam.json()["examinations"][0]["status"] == "resulted"

    extended = client.post(
        f"/api/case-sessions/{session_id}/timer/extend",
        headers=GUEST_AUTH,
    )
    assert extended.status_code == 200
    assert extended.json()["used_extension"] is True

    second_extension = client.post(
        f"/api/case-sessions/{session_id}/timer/extend",
        headers=GUEST_AUTH,
    )
    assert second_extension.status_code == 409

    ended = client.post(
        f"/api/case-sessions/{session_id}/end-consultation",
        headers=GUEST_AUTH,
    )
    assert ended.status_code == 200
    assert ended.json()["status"] == "quiz"

    submitted = client.post(
        f"/api/case-sessions/{session_id}/quiz-submit",
        headers=GUEST_AUTH,
        json={"answers": {"diagnosis": "acs", "next_step": "serial_ecg_trop"}},
    )
    assert submitted.status_code == 200
    result = submitted.json()
    assert result["score"] > 60
    assert result["stars"] >= 1
    assert result["xp_awarded"] == 0
    assert result["claim_available"] is True
    assert result["claim_token"]

    history = client.get("/api/history", headers=GUEST_AUTH)
    assert history.status_code == 200
    assert history.json()["items"][0]["result_id"] == result["id"]


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
    case = get_case_config("demo")
    missed_interview, missed_exams, missed_safety = summarize_missed_categories(
        case,
        {"diagnosis": "acs", "next_step": "discharge"},
        {"onset"},
        {"vitals"},
    )
    assert "quality" in missed_interview
    assert "ecg" in missed_exams
    assert missed_safety == ["next_step"]

    feedback = fallback_feedback(
        FeedbackInput(
            case_id="demo",
            patient_name="Maya",
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

    first = _complete_demo(client, DEV_AUTH)
    second = _complete_demo(client, DEV_AUTH)

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


def test_guest_claim_succeeds_once(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)
    guest_result = _complete_demo(client, GUEST_AUTH)

    claimed = client.post(
        f"/api/demo/{guest_result['session_id']}/claim",
        headers=DEV_AUTH,
        json={"token": guest_result["claim_token"]},
    )
    assert claimed.status_code == 200
    body = claimed.json()
    assert body["result"]["is_claimed"] is True
    assert body["result"]["xp_awarded"] == guest_result["score"]

    duplicate = client.post(
        f"/api/demo/{guest_result['session_id']}/claim",
        headers=DEV_AUTH,
        json={"token": guest_result["claim_token"]},
    )
    assert duplicate.status_code == 409


def test_guest_cannot_start_non_demo(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    response = TestClient(app).post(
        "/api/case-sessions",
        headers=GUEST_AUTH,
        json={"case_id": "budi-palpitasi"},
    )

    assert response.status_code == 403


def test_guest_demo_session_limit_returns_retry_after(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    settings = cast(Any, Settings)(
        _env_file=None,
        guest_demo_session_limit=1,
        guest_demo_session_window_seconds=3600,
    )
    client = TestClient(create_app(settings))

    first = client.post(
        "/api/case-sessions", headers=GUEST_AUTH, json={"case_id": "demo"}
    )
    second = client.post(
        "/api/case-sessions", headers=GUEST_AUTH, json={"case_id": "demo"}
    )

    assert first.status_code == 200
    assert second.status_code == 429
    assert second.headers["retry-after"].isdigit()
    assert all("guest-test" not in str(event) for event in rate_limits._memory_events)


def test_guest_voice_token_limit_uses_rate_limit_events(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(gameplay, "_ensure_livekit_agent_dispatch", _noop_dispatch)
    settings = cast(Any, Settings)(
        _env_file=None,
        livekit_url="wss://pixel-medic.test",
        livekit_api_key="dev-key",
        livekit_api_secret="dev-secret",
        guest_voice_token_limit=1,
        guest_voice_token_window_seconds=3600,
    )
    client = TestClient(create_app(settings))
    session_id = client.post(
        "/api/case-sessions",
        headers=GUEST_AUTH,
        json={"case_id": "demo"},
    ).json()["id"]

    first = client.post(
        "/api/livekit/token", headers=GUEST_AUTH, json={"session_id": session_id}
    )
    second = client.post(
        "/api/livekit/token", headers=GUEST_AUTH, json={"session_id": session_id}
    )

    assert first.status_code == 200
    assert second.status_code == 429
    assert rate_limits._memory_events[-1]["scope"] == "guest_voice_tokens"


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
        "/api/case-sessions", headers=DEV_AUTH, json={"case_id": "demo"}
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


def test_claim_attempt_limit_blocks_repeated_attempts(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    settings = cast(Any, Settings)(
        _env_file=None,
        guest_demo_claim_attempt_limit=1,
        guest_demo_claim_attempt_window_seconds=3600,
    )
    client = TestClient(create_app(settings))
    guest_result = _complete_demo(client, GUEST_AUTH)

    first = client.post(
        f"/api/demo/{guest_result['session_id']}/claim",
        headers=DEV_AUTH,
        json={"token": "wrong-token"},
    )
    second = client.post(
        f"/api/demo/{guest_result['session_id']}/claim",
        headers=DEV_AUTH,
        json={"token": guest_result["claim_token"]},
    )

    assert first.status_code == 403
    assert second.status_code == 429


def test_authenticated_user_completes_all_cardiology_cases(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    client = TestClient(app)

    for case_id, answers in [
        ("demo", {"diagnosis": "acs", "next_step": "serial_ecg_trop"}),
        ("budi-palpitasi", {"diagnosis": "stimulant", "safety": "syncope_chest_pain"}),
        (
            "siti-sesak",
            {"diagnosis": "heart_failure", "safety": "oxygen_diuretic_monitor"},
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
        assert submitted.json()["case"]["id"] == case_id


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
        headers=GUEST_AUTH,
        json={"case_id": "demo"},
    )
    session_id = created.json()["id"]

    response = client.post(
        "/api/livekit/token",
        headers=GUEST_AUTH,
        json={"session_id": session_id},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["room_name"] == f"case-session-{session_id}"
    claims = TokenVerifier("dev-key", "dev-secret").verify(body["token"])
    assert claims.video is not None
    assert claims.identity == "guest:guest-test"
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
        json={"case_id": "demo"},
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
    assert context.json()["patient_name"] == "Maya"
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


async def _noop_dispatch(*args: object, **kwargs: object) -> None:
    return None


def _complete_demo(client: TestClient, headers: dict[str, str]) -> dict[str, Any]:
    created = client.post(
        "/api/case-sessions", headers=headers, json={"case_id": "demo"}
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
        json={"answers": {"diagnosis": "acs", "next_step": "serial_ecg_trop"}},
    )
    assert response.status_code == 200
    return cast(dict[str, Any], response.json())
