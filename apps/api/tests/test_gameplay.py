from fastapi.testclient import TestClient

from pixelaid_api.main import app
from pixelaid_api.services import gameplay
from pixelaid_api.services import supabase as supabase_service

DEV_AUTH = {"Authorization": "Bearer dev:test-user"}
GUEST_AUTH = {"X-Guest-Session": "guest-test"}


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

    history = client.get("/api/history", headers=GUEST_AUTH)
    assert history.status_code == 200
    assert history.json()["items"][0]["result_id"] == result["id"]


def test_guest_cannot_start_non_demo(monkeypatch) -> None:
    monkeypatch.setattr(gameplay, "get_supabase_admin", lambda: None)
    monkeypatch.setattr(supabase_service, "get_supabase_admin", lambda: None)
    response = TestClient(app).post(
        "/api/case-sessions",
        headers=GUEST_AUTH,
        json={"case_id": "budi-palpitasi"},
    )

    assert response.status_code == 403


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
    ]:
        assert path in schema["paths"]
