from collections.abc import Mapping, Sequence

import numpy as np

FEATURES = ("temperature", "humidity", "pressure", "wind_speed", "rainfall", "cloudiness")
FEATURE_BOUNDS = {
    "temperature": (-80.0, 70.0), "humidity": (0.0, 100.0), "pressure": (800.0, 1200.0),
    "wind_speed": (0.0, 150.0), "rainfall": (0.0, 500.0), "cloudiness": (0.0, 100.0),
}


def preprocess_weather(weather: Mapping[str, float | int | None]) -> np.ndarray:
    """Validate, order, and bound one live-weather observation for model inference."""
    values: list[float] = []
    for name in FEATURES:
        value = weather.get(name)
        if value is None:
            values.append(np.nan)
            continue
        try:
            numeric = float(value)
        except (TypeError, ValueError) as exc:
            raise ValueError(f"{name} must be numeric.") from exc
        lower, upper = FEATURE_BOUNDS[name]
        values.append(float(np.clip(numeric, lower, upper)))
    return np.asarray([values], dtype=float)


def preprocess_training_data(rows: Sequence[Mapping[str, float | int | None]]) -> np.ndarray:
    if not rows:
        raise ValueError("Training data cannot be empty.")
    return np.vstack([preprocess_weather(row) for row in rows])
