from app.ml.model_service import get_model_bundle, predict_rain_probability
from app.ml.recommendation_engine import generate_recommendations


def predict_weather_impact(weather: dict[str, float]) -> dict[str, object]:
    """Produce the complete ML-backed rain-impact response without persistence concerns."""
    bundle = get_model_bundle()
    rain_probability = predict_rain_probability(weather, bundle)
    guidance = generate_recommendations(weather, rain_probability)
    return {
        "rain_probability": rain_probability,
        "selected_model": bundle["model_name"],
        "model_metrics": bundle["metrics"],
        **guidance,
    }
