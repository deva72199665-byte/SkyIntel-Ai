import pytest
from fastapi.testclient import TestClient

from app.ml.flood_model import predict_flood_risk
from app.ml.model_service import predict_rain_and_impact
from app.ml.recommendation_engine import generate_recommendations
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SkyIntel" in data["service"]


def test_flood_model_prediction():
    result = predict_flood_risk(rainfall=25.0, humidity=90.0, pressure=995.0, wind_speed=15.0, rain_probability=0.85)
    assert result["level"] in ["High", "Severe"]
    assert result["score"] > 50.0


def test_recommendation_engine():
    obs = {"temperature": 28.0, "humidity": 85.0, "pressure": 1005.0, "wind_speed": 10.0, "rainfall": 8.0, "cloudiness": 90.0}
    recs = generate_recommendations(obs, 0.8)
    assert recs["drying_condition"] in ["Poor", "Average"]
    assert "Umbrella" in recs["umbrella"] or "Essential" in recs["umbrella"] or "Recommended" in recs["umbrella"]


def test_ml_model_service_inference():
    obs = {"temperature": 22.0, "humidity": 70.0, "pressure": 1012.0, "wind_speed": 5.0, "rainfall": 2.0, "cloudiness": 60.0}
    res = predict_rain_and_impact(obs, model_choice="random_forest")
    assert "rain_probability" in res
    assert 0 <= res["rain_probability"] <= 100
    assert "explainability" in res


def test_recommendation_engine_clear_weather():
    obs = {"temperature": 25.0, "humidity": 40.0, "pressure": 1015.0, "wind_speed": 4.0, "rainfall": 0.0, "cloudiness": 10.0}
    recs = generate_recommendations(obs, 0.1)
    assert recs["drying_condition"] == "Good"
    assert "Not needed" in recs["umbrella"]
    assert recs["flood_risk"] in ["Low", "None", "Minimal"]


def test_register_and_login():
    import uuid
    test_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    reg_resp = client.post("/api/v1/auth/register", json={"name": "Test User", "email": test_email, "password": "password123"})
    assert reg_resp.status_code == 201, reg_resp.text
    login_resp = client.post("/api/v1/auth/login", json={"email": test_email, "password": "password123"})
    assert login_resp.status_code == 200, login_resp.text
    token_data = login_resp.json()
    assert "access_token" in token_data


def test_admin_endpoints():
    login_resp = client.post("/api/v1/auth/login", json={"email": "admin@skyintel.ai", "password": "adminpass"})
    assert login_resp.status_code == 200, login_resp.text
    token = login_resp.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    stats_resp = client.get("/api/v1/admin/stats", headers=headers)
    assert stats_resp.status_code == 200, stats_resp.text
    stats = stats_resp.json()
    assert "total_users" in stats
    assert "server_health" in stats
    
    users_resp = client.get("/api/v1/admin/users", headers=headers)
    assert users_resp.status_code == 200, users_resp.text
    users = users_resp.json()
    assert isinstance(users, list)



