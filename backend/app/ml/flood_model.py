import numpy as np


def predict_flood_risk(
    rainfall: float,
    humidity: float,
    pressure: float,
    wind_speed: float,
    rain_probability: float,
) -> dict:
    """Multi-factor Flood Risk Assessment Classifier.
    Risk Levels: Low, Moderate, High, Severe.
    """
    # Base risk score calculation combining intensity, persistence, and pressure drop
    pressure_drop = max(0.0, 1013.25 - pressure)
    risk_score = (
        (rainfall * 0.45)
        + (rain_probability * 35.0)
        + ((humidity / 100.0) * 15.0)
        + (pressure_drop * 0.8)
        + (wind_speed * 0.3)
    )

    # Normalize risk score to range [0, 100]
    normalized_score = min(100.0, max(0.0, round(float(risk_score), 1)))

    if normalized_score < 25.0:
        level = "Low"
        badge_color = "emerald"
        description = "Minimal flood threat. Drainage systems functioning normally."
    elif normalized_score < 55.0:
        level = "Moderate"
        badge_color = "amber"
        description = "Water accumulation likely in low-lying roads. Exercise caution while traveling."
    elif normalized_score < 80.0:
        level = "High"
        badge_color = "orange"
        description = "Significant risk of localized flooding and river overflow. Avoid underground transit."
    else:
        level = "Severe"
        badge_color = "red"
        description = "Flash flood emergency warning! High water levels expected. Move to higher ground immediately."

    return {
        "level": level,
        "score": normalized_score,
        "badge_color": badge_color,
        "description": description,
    }


def calculate_weather_severity_score(
    temperature: float,
    humidity: float,
    pressure: float,
    wind_speed: float,
    rainfall: float,
    cloudiness: float,
    uv_index: float = 5.0,
    aqi: float = 2.0,
) -> dict:
    """Calculate 0-100 Weather Severity Score reflecting cumulative environmental stress."""
    # Thermal discomfort component
    temp_penalty = abs(temperature - 22.0) * 1.8
    wind_penalty = max(0.0, wind_speed - 15.0) * 2.5
    rain_penalty = rainfall * 3.5
    pressure_penalty = max(0.0, 1013.25 - pressure) * 1.2
    uv_penalty = max(0.0, uv_index - 7.0) * 4.0
    aqi_penalty = (aqi - 1.0) * 6.0

    raw_score = temp_penalty + wind_penalty + rain_penalty + pressure_penalty + uv_penalty + aqi_penalty
    severity = min(100.0, max(0.0, round(float(raw_score), 1)))

    if severity < 25.0:
        status = "Favorable / Normal"
        color = "emerald"
    elif severity < 55.0:
        status = "Moderate / Mild Caution"
        color = "amber"
    elif severity < 80.0:
        status = "Severe / High Alert"
        color = "orange"
    else:
        status = "Hazardous / Extreme Alert"
        color = "red"

    return {
        "severity_score": severity,
        "status": status,
        "color": color
    }

