import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_weather_simulator_endpoint():
    # Login as admin to get token
    login_resp = client.post("/api/v1/auth/login", json={"email": "admin@skyintel.ai", "password": "adminpass"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "temperature": 32.0,
        "humidity": 85.0,
        "pressure": 1002.0,
        "wind_speed": 18.0,
        "rainfall": 15.0,
        "cloudiness": 95.0,
        "model": "ensemble"
    }

    resp = client.post("/api/v1/tools/simulate", json=payload, headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "rain_probability" in data
    assert "prediction_confidence" in data
    assert "flood_risk" in data
    assert "weather_severity_score" in data
    assert "shap_explainability" in data

def test_trip_planner_endpoint():
    login_resp = client.post("/api/v1/auth/login", json={"email": "admin@skyintel.ai", "password": "adminpass"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/tools/trip-planner", json={"destination": "Goa"}, headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "travel_feasibility_score" in data
    assert "packing_checklist" in data

def test_outdoor_activities_endpoint():
    login_resp = client.post("/api/v1/auth/login", json={"email": "admin@skyintel.ai", "password": "adminpass"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/tools/outdoor-activities?city=Mumbai", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert "activities" in data
    assert len(data["activities"]) > 0

def test_platform_reset_security_rejection():
    login_resp = client.post("/api/v1/auth/login", json={"email": "admin@skyintel.ai", "password": "adminpass"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Wrong confirmation phrase should fail
    resp = client.post("/api/v1/admin/reset-platform", json={"password": "adminpass", "confirm_phrase": "WRONG PHRASE"}, headers=headers)
    assert resp.status_code == 400
    assert "DELETE EVERYTHING" in resp.json()["detail"]
