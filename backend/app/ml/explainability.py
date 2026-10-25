import logging
import numpy as np
from app.ml.preprocessing import FEATURES

logger = logging.getLogger(__name__)

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False


def compute_shap_explanations(pipeline, features_array: np.ndarray) -> dict:
    """Compute feature attribution explanations (SHAP values or fallback feature attributions)."""
    feature_names = list(FEATURES)
    raw_vals = features_array[0].tolist()

    if HAS_SHAP:
        try:
            classifier = pipeline.named_steps.get("classifier", pipeline)
            # Preprocess if pipeline has scaling/imputing
            processed_input = features_array
            for step_name, step in pipeline.steps[:-1]:
                processed_input = step.transform(processed_input)

            explainer = shap.Explainer(classifier, processed_input)
            shap_values = explainer(processed_input)

            # Format SHAP output
            values = shap_values.values[0]
            if len(values.shape) > 1:
                # Binary classification output array shape (n_samples, n_features, n_classes) or (n_features, 2)
                values = values[:, 1] if values.shape[-1] == 2 else values[:, 0]

            attribution = {
                name: round(float(val), 4) for name, val in zip(feature_names, values)
            }
            return {
                "method": "shap",
                "attributions": attribution,
                "feature_values": {name: round(float(val), 2) for name, val in zip(feature_names, raw_vals)},
            }
        except Exception as err:
            logger.debug("SHAP compute fallback invoked due to: %s", err)

    # High quality domain-heuristic feature attribution fallback
    # Normalize features according to rain probability impact weights
    temp, hum, pres, wind, rain, cloud = raw_vals
    hum_contrib = (hum - 50.0) * 0.012
    cloud_contrib = (cloud - 40.0) * 0.010
    rain_contrib = rain * 0.08
    pres_contrib = (1013.25 - pres) * 0.015
    temp_contrib = (25.0 - temp) * 0.005
    wind_contrib = wind * 0.004

    contributions = [temp_contrib, hum_contrib, pres_contrib, wind_contrib, rain_contrib, cloud_contrib]
    total_abs = sum(abs(c) for c in contributions) or 1.0

    attributions = {
        name: round(float(c / total_abs), 4)
        for name, c in zip(feature_names, contributions)
    }

    return {
        "method": "heuristic_attribution",
        "attributions": attributions,
        "feature_values": {name: round(float(val), 2) for name, val in zip(feature_names, raw_vals)},
    }
