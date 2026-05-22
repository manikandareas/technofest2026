from fastapi.testclient import TestClient

from pixelaid_api.main import app

DEV_AUTH = {"Authorization": "Bearer dev:test-user"}


def test_healthz() -> None:
    response = TestClient(app).get("/healthz")

    assert response.status_code == 200
    assert response.json() == {
        "service": "api",
        "status": "ok",
        "project": "technofest2026",
    }


def test_readyz_degraded_without_cloud_env() -> None:
    response = TestClient(app).get("/readyz")

    assert response.status_code == 200
    assert response.json()["status"] in {"ok", "degraded"}


def test_public_specialists() -> None:
    response = TestClient(app).get("/api/public/specialists")

    assert response.status_code == 200
    specialists = response.json()
    assert specialists[0]["id"] == "cardiology"
    assert specialists[0]["case_count"] == 3


def test_public_demo_case_hides_case_data() -> None:
    response = TestClient(app).get("/api/public/cases/demo")

    assert response.status_code == 200
    data = response.json()
    assert data["patient_name"] == "Maya"
    assert "case_data" not in data
    assert "hidden_diagnosis" not in data


def test_authenticated_me_bootstraps_profile() -> None:
    response = TestClient(app).get("/api/me", headers=DEV_AUTH)

    assert response.status_code == 200
    assert response.json()["profile"]["id"] == "test-user"


def test_profile_update() -> None:
    response = TestClient(app).patch(
        "/api/me/profile",
        headers=DEV_AUTH,
        json={"display_name": "PixelAid Tester"},
    )

    assert response.status_code == 200
    assert response.json()["display_name"] == "PixelAid Tester"


def test_onboarding_complete() -> None:
    response = TestClient(app).post("/api/me/onboarding-complete", headers=DEV_AUTH)

    assert response.status_code == 200
    assert response.json()["onboarding_completed"] is True


def test_authenticated_specialist_cases() -> None:
    response = TestClient(app).get(
        "/api/specialists/cardiology/cases", headers=DEV_AUTH
    )

    assert response.status_code == 200
    assert [case["patient_name"] for case in response.json()] == ["Maya", "Budi", "Siti"]


def test_authenticated_case_brief() -> None:
    response = TestClient(app).get("/api/cases/demo", headers=DEV_AUTH)

    assert response.status_code == 200
    assert response.json()["id"] == "demo"


def test_private_endpoints_require_auth() -> None:
    response = TestClient(app).get("/api/me")

    assert response.status_code == 401
