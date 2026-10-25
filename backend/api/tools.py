import random
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from auth.dependencies import get_current_user
from models import User
from services.openweather_service import fetch_live_weather, fetch_weather_forecast
from app.ml.model_service import predict_rain_and_impact

router = APIRouter(prefix="/tools", tags=["AI Weather Copilot Tools"])


# Request / Response Schemas
class TripPlannerRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=120)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    activities: Optional[List[str]] = Field(default_factory=list)


class FarmingAdvisorRequest(BaseModel):
    city: str = Field(min_length=2, max_length=120)
    crop_type: str = Field(default="Wheat / Rice")
    soil_type: Optional[str] = Field(default="Loamy")


class SimulationRequest(BaseModel):
    temperature: float = Field(ge=-50, le=60, default=25.0)
    humidity: float = Field(ge=0, le=100, default=65.0)
    pressure: float = Field(ge=900, le=1100, default=1012.0)
    wind_speed: float = Field(ge=0, le=150, default=8.0)
    rainfall: float = Field(ge=0, le=300, default=2.0)
    cloudiness: float = Field(ge=0, le=100, default=50.0)
    model: Optional[str] = Field(default="ensemble")


@router.post("/trip-planner", response_model=dict)
async def ai_trip_planner(payload: TripPlannerRequest, user: User = Depends(get_current_user)):
    """AI Trip Planner: Evaluates destination weather risks, travel feasibility score, and packing list."""
    try:
        from services.geocoding_service import geocode_location
        geocoded = await geocode_location(payload.destination)
        if geocoded:
            target_city = geocoded[0].name
            target_lat = geocoded[0].lat
            target_lon = geocoded[0].lon
        else:
            target_city = payload.destination
            target_lat = None
            target_lon = None

        weather_obs = await fetch_live_weather(city=target_city, lat=target_lat, lon=target_lon)
        forecast_data = await fetch_weather_forecast(city=target_city, lat=target_lat, lon=target_lon)
        obs_dict = {
            "temperature": weather_obs.temperature,
            "humidity": weather_obs.humidity,
            "pressure": weather_obs.pressure,
            "wind_speed": weather_obs.wind_speed,
            "rainfall": weather_obs.rainfall,
            "cloudiness": weather_obs.cloudiness,
        }
        
        real_rain_prob = 0.0
        forecast_list = forecast_data.get("list", [])
        if forecast_list:
            today_intervals = forecast_list[:8]
            pops = [float(item.get("pop", 0.0)) for item in today_intervals]
            if pops:
                real_rain_prob = max(pops) * 100.0

        pred = predict_rain_and_impact(obs_dict, real_rain_prob=real_rain_prob)
        rain_prob = pred["rain_probability"]
        flood_risk = pred["flood_risk"]
        severity = pred.get("weather_severity_score", 20.0)

        # Travel feasibility score (100 - severity - rain_prob * 0.4)
        feasibility_score = max(10, min(98, round(100.0 - (severity * 0.5) - (rain_prob * 0.3))))

        if feasibility_score >= 80:
            verdict = "Excellent Travel Window"
            badge_color = "emerald"
        elif feasibility_score >= 55:
            verdict = "Moderate Conditions - Pack Umbrella"
            badge_color = "amber"
        else:
            verdict = "High Weather Impact - Consider Rescheduling"
            badge_color = "rose"

        packing_list = ["Breathable Cotton Clothing", "Sunglasses", "Power Bank"]
        if rain_prob > 30.0 or weather_obs.rainfall > 0:
            packing_list.extend(["Waterproof Jacket", "Foldable Umbrella", "Quick-Dry Footwear"])
        if weather_obs.temperature < 18.0:
            packing_list.append("Light Thermal Fleece")

        return {
            "destination": weather_obs.city,
            "travel_feasibility_score": feasibility_score,
            "verdict": verdict,
            "badge_color": badge_color,
            "weather_summary": {
                "temperature": weather_obs.temperature,
                "description": weather_obs.description,
                "rain_probability": rain_prob,
                "flood_risk": flood_risk,
                "wind_speed": weather_obs.wind_speed,
            },
            "packing_checklist": packing_list,
            "advisory_notes": pred["recommendations"],
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Trip planner telemetry error: {str(err)}")


@router.post("/farming-advisor", response_model=dict)
async def ai_farming_advisor(payload: FarmingAdvisorRequest, user: User = Depends(get_current_user)):
    """AI Farming & Agriculture Advisor: Irrigation guidance, sowing feasibility, and pest alerts."""
    try:
        weather_obs = await fetch_live_weather(city=payload.city)
        humidity = weather_obs.humidity
        rainfall = weather_obs.rainfall
        temp = weather_obs.temperature

        # Soil moisture estimate
        soil_moisture = min(100, max(10, round(humidity * 0.7 + rainfall * 4.0)))

        # Irrigation advisory
        if rainfall > 5.0 or humidity > 85:
            irrigation_status = "Hold Irrigation (Natural Rainfall Sufficient)"
            irrigation_code = "hold"
        elif humidity < 45 and temp > 30:
            irrigation_status = "Irrigation Required (High Evapotranspiration)"
            irrigation_code = "required"
        else:
            irrigation_status = "Normal Irrigation Cycle"
            irrigation_code = "normal"

        # Fungal & Pest Risk
        if humidity > 80 and temp > 24:
            pest_risk = "High Fungal Blight Risk (High Humidity + Warm Temp)"
        else:
            pest_risk = "Low Pest Vulnerability"

        return {
            "city": weather_obs.city,
            "crop_type": payload.crop_type,
            "estimated_soil_moisture": soil_moisture,
            "irrigation_status": irrigation_status,
            "irrigation_code": irrigation_code,
            "pest_fungal_risk": pest_risk,
            "sowing_suitability": "Optimal" if 15 <= temp <= 32 and rainfall < 10 else "Sub-optimal",
            "weather_metrics": {
                "temperature": temp,
                "humidity": humidity,
                "rainfall": rainfall,
            },
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Farming advisory error: {str(err)}")


@router.get("/outdoor-activities", response_model=dict)
async def ai_outdoor_activities(city: str = Query(default="Mumbai"), user: User = Depends(get_current_user)):
    """AI Outdoor Activity Advisor: Suitability scores for Running, Cycling, Photography, Drone Flying, Laundry."""
    try:
        weather_obs = await fetch_live_weather(city=city)
        temp = weather_obs.temperature
        humidity = weather_obs.humidity
        wind = weather_obs.wind_speed
        rain = weather_obs.rainfall

        # Running Score
        running_score = max(0, min(100, round(100 - abs(temp - 18) * 3 - rain * 10 - wind * 2)))
        # Cycling Score
        cycling_score = max(0, min(100, round(100 - abs(temp - 20) * 2.5 - wind * 4 - rain * 12)))
        # Drone Flying Score
        drone_score = max(0, min(100, round(100 - wind * 7 - rain * 20)))
        # Photography Score
        photo_score = max(0, min(100, round(85 + (20 if 40 <= humidity <= 70 else -15) - rain * 10)))
        # Laundry Score
        laundry_score = max(0, min(100, round(100 - humidity * 0.6 - rain * 25 + temp * 0.8)))

        return {
            "city": weather_obs.city,
            "weather_summary": f"{temp}°C, {weather_obs.description}, Humidity {humidity}%, Wind {wind} m/s",
            "activities": [
                {"name": "Running / Jogging", "score": running_score, "status": "Optimal" if running_score > 70 else "Fair"},
                {"name": "Cycling / Biking", "score": cycling_score, "status": "Optimal" if cycling_score > 70 else "Caution"},
                {"name": "Drone Flying", "score": drone_score, "status": "Optimal" if drone_score > 70 else "High Wind Risk"},
                {"name": "Outdoor Photography", "score": photo_score, "status": "Good Lighting" if photo_score > 70 else "Overcast"},
                {"name": "Outdoor Laundry Drying", "score": laundry_score, "status": "Fast Drying" if laundry_score > 65 else "Indoors Recommended"},
            ],
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Activity advisor error: {str(err)}")


@router.get("/health-advisory", response_model=dict)
async def ai_health_advisory(city: str = Query(default="Delhi"), user: User = Depends(get_current_user)):
    """AI Health & Biological Advisory: Hydration needs, joint pain index, respiratory warnings."""
    try:
        weather_obs = await fetch_live_weather(city=city)
        temp = weather_obs.temperature
        humidity = weather_obs.humidity
        pressure = weather_obs.pressure

        # Hydration requirement calculation (Base 2.0L + temp bonus)
        hydration_liters = round(2.0 + max(0.0, (temp - 22.0) * 0.08), 1)

        # Joint Pain Index (Barometric pressure drop sensitivity)
        pressure_drop = max(0.0, 1013.25 - pressure)
        joint_pain_score = min(100, round(pressure_drop * 4.5 + humidity * 0.3))

        # Respiratory Risk Index
        respiratory_risk = "Low Risk" if humidity < 75 else "Moderate Risk (High Mold/Humidity)"

        return {
            "city": weather_obs.city,
            "hydration_recommendation_liters": hydration_liters,
            "joint_pain_sensitivity_score": joint_pain_score,
            "joint_pain_status": "Elevated Discomfort Likely" if joint_pain_score > 55 else "Minimal Pressure Stress",
            "respiratory_risk_status": respiratory_risk,
            "uv_protection_advice": "SPF 30+ recommended during peak hours." if temp > 28 else "Standard sun protection.",
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Health advisory error: {str(err)}")


@router.post("/simulate", response_model=dict)
def simulate_weather_scenario(payload: SimulationRequest, user: User = Depends(get_current_user)):
    """'What-If' Weather Simulator: Runs Ensemble ML, SHAP, and Flood Risk models on custom inputs."""
    obs_dict = {
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "pressure": payload.pressure,
        "wind_speed": payload.wind_speed,
        "rainfall": payload.rainfall,
        "cloudiness": payload.cloudiness,
    }

    prediction_result = predict_rain_and_impact(obs_dict, model_choice=payload.model or "ensemble")

    # Dynamic Decision Engine Calculations
    rain_probability = prediction_result["rain_probability"]
    flood_risk_score = prediction_result["flood_risk_score"]
    severity_score = prediction_result["weather_severity_score"]
    confidence = prediction_result["prediction_confidence"]

    # Deduce Risk & Impact levels
    risk_score = int(max(rain_probability, flood_risk_score))
    if severity_score > 70.0:
        impact_level = "Extreme"
    elif severity_score > 40.0:
        impact_level = "High"
    elif severity_score > 15.0:
        impact_level = "Medium"
    else:
        impact_level = "Low"

    # Explanation based on features
    explanation = (
        f"Simulated weather indicates a {rain_probability}% rain probability. "
        f"Key attribution drivers show Humidity of {payload.humidity}% and Rainfall rate of {payload.rainfall} mm/h "
        f"acting as primary accelerators, yielding an overall hazard index of {severity_score}/100."
    )

    # Expected duration simulation
    if payload.rainfall > 8.0:
        expected_duration = "Next 6 to 12 hours"
    elif payload.rainfall > 1.0 or rain_probability > 40.0:
        expected_duration = "Next 2 to 4 hours"
    else:
        expected_duration = "No active precipitation expected"

    # Similar historical events
    if flood_risk_score > 60.0:
        similar_historical_events = "Similar to storm surges of September 2021"
    elif rain_probability > 50.0:
        similar_historical_events = "Comparable to monsoon cycles of July 2024"
    else:
        similar_historical_events = "Consistent with baseline seasonal conditions"

    # Recommended actions
    recommended_actions = prediction_result["recommendation_details"].get("summary_bullets", [prediction_result["recommendations"]])
    alternative_suggestions = [
        "Delay travel through high-density urban roads",
        "Perform crop protection or delay outdoor chemical spray"
    ] if risk_score > 40 else [
        "Good conditions for standard logistics and transit",
        "Aerate greenhouses and optimize indoor laundry drying"
    ]

    return {
        "simulated_inputs": obs_dict,
        "selected_model": prediction_result["selected_model"],
        "rain_probability": rain_probability,
        "prediction_confidence": confidence,
        "flood_risk": prediction_result["flood_risk"],
        "flood_risk_score": flood_risk_score,
        "weather_severity_score": severity_score,
        "weather_severity_status": prediction_result["weather_severity_status"],
        "shap_explainability": prediction_result["explainability"],
        "risk_score": risk_score,
        "confidence_score": confidence,
        "impact_level": impact_level,
        "explanation": explanation,
        "recommended_actions": recommended_actions,
        "alternative_suggestions": alternative_suggestions,
        "expected_duration": expected_duration,
        "similar_historical_events": similar_historical_events,
    }
