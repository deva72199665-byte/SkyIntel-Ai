from functools import lru_cache
import logging
from pathlib import Path

import joblib

from app.ml.explainability import compute_shap_explanations
from app.ml.preprocessing import FEATURES, preprocess_weather
from app.ml.recommendation_engine import generate_recommendations
from app.ml.training import train_and_select_model

logger = logging.getLogger(__name__)

MODEL_PATH = Path(__file__).resolve().parents[2] / "artifacts" / "rain_model.joblib"


def train_model() -> dict:
    """Train candidate models, evaluate metrics, and save the best performing bundle."""
    bundle = train_and_select_model(MODEL_PATH)
    _load_model_bundle.cache_clear()
    return bundle


def _patch_model_compat(model):
    if not model:
        return
    try:
        from sklearn.pipeline import Pipeline
        from sklearn.linear_model import LogisticRegression
        if isinstance(model, Pipeline):
            for name, step in model.steps:
                if isinstance(step, LogisticRegression) and not hasattr(step, "multi_class"):
                    step.multi_class = "deprecated"
        elif isinstance(model, LogisticRegression) and not hasattr(model, "multi_class"):
            model.multi_class = "deprecated"
    except Exception:
        pass


@lru_cache(maxsize=1)
def _load_model_bundle() -> dict:
    bundle = joblib.load(MODEL_PATH)
    if not isinstance(bundle, dict) or "model" not in bundle or bundle.get("feature_names") != list(FEATURES):
        raise ValueError("Invalid model bundle structure.")
    
    # Apply dynamic scikit-learn version patch
    _patch_model_compat(bundle.get("model"))
    for m_name, m_obj in bundle.get("all_models", {}).items():
        _patch_model_compat(m_obj)
        
    return bundle


def get_model_bundle() -> dict:
    if not MODEL_PATH.exists():
        return train_model()
    try:
        return _load_model_bundle()
    except Exception as err:
        logger.warning("Failed to load saved model bundle: %s. Retraining...", err)
        _load_model_bundle.cache_clear()
        return train_model()


def get_model_metrics() -> list[dict]:
    return get_model_bundle().get("metrics", [])


def predict_rain_and_impact(weather: dict[str, float], model_choice: str = "best", real_rain_prob: float | None = None) -> dict:
    """Predict rain probability, compute SHAP feature attributions, and generate recommendations."""
    bundle = get_model_bundle()
    model_choice_clean = (model_choice or "best").lower().strip()

    model = bundle.get("model")
    selected_name = bundle.get("model_name", "Random Forest")

    if model_choice_clean != "best" and "all_models" in bundle:
        if model_choice_clean in bundle["all_models"]:
            model = bundle["all_models"][model_choice_clean]
            selected_name = model_choice_clean

    features_array = preprocess_weather(weather)

    if real_rain_prob is not None:
        prob_clean = round(max(0.0, min(100.0, real_rain_prob)), 1)
    else:
        if hasattr(model, "predict_proba"):
            probability = float(model.predict_proba(features_array)[0][1]) * 100.0
        else:
            probability = float(model.predict(features_array)[0]) * 100.0
        prob_clean = round(max(0.0, min(100.0, probability)), 1)

    # Compute SHAP / feature attribution breakdown
    explanations = compute_shap_explanations(model, features_array)

    # Generate recommendations
    impact = generate_recommendations(weather, prob_clean / 100.0)

    # Use the real validation accuracy of the selected model as the confidence score
    confidence = 94.0
    for m in bundle.get("metrics", []):
        if m.get("name") == selected_name:
            confidence = round(m.get("accuracy", 0.94) * 100.0, 1)
            break

    # Compute weather severity score
    from app.ml.flood_model import calculate_weather_severity_score
    severity_info = calculate_weather_severity_score(
        temperature=weather.get("temperature", 25.0),
        humidity=weather.get("humidity", 60.0),
        pressure=weather.get("pressure", 1013.0),
        wind_speed=weather.get("wind_speed", 5.0),
        rainfall=weather.get("rainfall", 0.0),
        cloudiness=weather.get("cloudiness", 50.0),
    )

    return {
        "rain_probability": prob_clean,
        "prediction_confidence": confidence,
        "selected_model": selected_name,
        "explainability": explanations,
        "flood_risk": impact["flood_risk"],
        "flood_risk_score": impact["flood_risk_score"],
        "drying_condition": impact["drying_condition"],
        "weather_severity_score": severity_info["severity_score"],
        "weather_severity_status": severity_info["status"],
        "recommendation_details": impact,
        "recommendations": impact["recommendations"],
    }
