def assess_impact(weather: dict[str, float], rain_probability: float) -> tuple[str, str, list[str]]:
    humidity, cloudiness, wind = weather["humidity"], weather["cloudiness"], weather["wind_speed"]
    flood_score = rain_probability * 0.65 + humidity * 0.2 + cloudiness * 0.15
    flood_risk = "High" if flood_score >= 78 else "Medium" if flood_score >= 48 else "Low"

    drying_score = (100 - rain_probability) * 0.55 + (100 - humidity) * 0.25 + min(wind * 5, 20)
    drying_condition = "Good" if drying_score >= 62 else "Average" if drying_score >= 35 else "Poor"

    recommendations: list[str] = []
    if rain_probability >= 45:
        recommendations.append("Carry an umbrella or a raincoat.")
        recommendations.append("Travel earlier and allow extra time for wet roads.")
    else:
        recommendations.append("Good window for outdoor travel; keep an eye on local updates.")
    if flood_risk == "High":
        recommendations.append("Avoid low-lying roads and areas prone to waterlogging.")
    elif flood_risk == "Medium":
        recommendations.append("Prefer main roads and check drainage-prone routes before leaving.")
    if drying_condition == "Good":
        recommendations.append("A suitable day to dry clothes outdoors.")
    elif drying_condition == "Average":
        recommendations.append("Dry clothes in a covered, well-ventilated space.")
    else:
        recommendations.append("Avoid outdoor clothes drying; use an indoor rack or dryer.")
    return flood_risk, drying_condition, recommendations
