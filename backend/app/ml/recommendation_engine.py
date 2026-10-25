from app.ml.flood_model import predict_flood_risk


def generate_recommendations(weather: dict[str, float | int], rain_probability: float) -> dict[str, object]:
    """Generate intelligent dynamic weather recommendations across multiple lifestyle & safety domains."""
    temp = float(weather.get("temperature", 25.0))
    humidity = float(weather.get("humidity", 50.0))
    pressure = float(weather.get("pressure", 1013.0))
    wind_speed = float(weather.get("wind_speed", 5.0))
    rainfall = float(weather.get("rainfall", 0.0))
    cloudiness = float(weather.get("cloudiness", 20.0))

    prob_pct = round(rain_probability * 100, 1) if rain_probability <= 1.0 else round(rain_probability, 1)

    # 1. Umbrella recommendation
    if prob_pct >= 70 or rainfall > 5.0:
        umbrella = "Essential — High likelihood of heavy rain. Carry a sturdy windproof umbrella or waterproof raincoat."
    elif prob_pct >= 35 or rainfall > 0.5:
        umbrella = "Recommended — Moderate chance of localized rain or light showers."
    else:
        umbrella = "Not needed — Low probability of precipitation. Clear skies expected."

    # 2. Travel & Commute advice
    if prob_pct >= 75 or wind_speed > 20.0 or rainfall > 15.0:
        travel = "Delay non-essential travel. Expect traffic delays, reduced visibility, and waterlogged routes."
    elif prob_pct >= 40:
        travel = "Allow extra travel time. Check traffic updates and maintain safe braking distances."
    else:
        travel = "Optimal travel conditions. Roads clear with good visibility."

    # 3. Flood Risk Assessment
    flood_info = predict_flood_risk(rainfall, humidity, pressure, wind_speed, prob_pct / 100.0)

    # 4. Clothes Drying feasibility
    if rainfall > 2.0 or prob_pct >= 60 or humidity > 85:
        drying_condition = "Poor"
        clothes_drying = "Indoors recommended — High humidity and rain threat will prevent outdoor clothes drying."
    elif humidity > 65 or cloudiness > 60:
        drying_condition = "Average"
        clothes_drying = "Covered outdoor drying — Partial sun with moderate drying duration."
    else:
        drying_condition = "Good"
        clothes_drying = "Excellent — Bright sunshine and breeze will dry laundry quickly outdoors."

    # 5. Outdoor Activities
    if prob_pct >= 65 or temp > 38.0 or wind_speed > 25.0:
        outdoor = "Not recommended — Reschedule sports, hiking, or picnics indoors due to adverse weather."
    elif prob_pct >= 30:
        outdoor = "Proceed with caution — Keep outdoor events short and stay close to sheltered areas."
    else:
        outdoor = "Ideal for outdoor activities — Great weather for jogging, parks, and sports."

    # 6. Road Safety
    if rainfall > 10.0 or wind_speed > 20.0:
        road_safety = "Hazardous — High risk of hydroplaning and fallen tree branches. Use low beams."
    elif prob_pct >= 45:
        road_safety = "Moderate caution — Wet asphalt reduces tire grip. Turn on headlights."
    else:
        road_safety = "Safe driving conditions — Normal speed limits and clear roads."

    # 7. Agriculture & Farming
    if rainfall > 20.0 or flood_info["level"] in ["High", "Severe"]:
        agriculture = "Action Required — Clear drainage channels to prevent crop submergence and soil erosion."
    elif prob_pct >= 50 or rainfall > 2.0:
        agriculture = "Pause Irrigation — Natural rainfall will cover soil moisture requirements."
    elif humidity < 35 and temp > 32.0:
        agriculture = "Irrigation needed — High evaporation rates require additional crop watering."
    else:
        agriculture = "Standard farming conditions — Ideal for routine field operations."

    summary_bullets = [
        f"Umbrella: {umbrella.split(' — ')[0]}",
        f"Travel: {travel.split('. ')[0]}",
        f"Flood Risk: {flood_info['level']} ({flood_info['score']}%)",
        f"Laundry: {clothes_drying.split(' — ')[0]}",
    ]

    return {
        "rain_probability_percent": prob_pct,
        "flood_risk": flood_info["level"],
        "flood_risk_score": flood_info["score"],
        "flood_risk_details": flood_info,
        "drying_condition": drying_condition,
        "umbrella": umbrella,
        "travel": travel,
        "flood_safety": flood_info["description"],
        "clothes_drying": clothes_drying,
        "outdoor_activities": outdoor,
        "road_safety": road_safety,
        "agriculture": agriculture,
        "summary_bullets": summary_bullets,
        "recommendations": ". ".join(summary_bullets),
    }
