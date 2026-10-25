from dataclasses import asdict, dataclass
import logging
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import (
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

try:
    from xgboost import XGBClassifier
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

from app.ml.preprocessing import FEATURES

logger = logging.getLogger(__name__)

# Try optional model imports with graceful fallback
try:
    from lightgbm import LGBMClassifier
    HAS_LIGHTGBM = True
except ImportError:
    HAS_LIGHTGBM = False

try:
    from catboost import CatBoostClassifier
    HAS_CATBOOST = True
except ImportError:
    HAS_CATBOOST = False


@dataclass(frozen=True)
class ModelMetrics:
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    confusion_matrix: list[list[int]]
    feature_importances: dict[str, float]


def build_training_dataset(samples: int = 4000, random_state: int = 42) -> tuple[np.ndarray, np.ndarray]:
    """Generate realistic, weather-shaped synthetic dataset for training and comparison."""
    rng = np.random.default_rng(random_state)
    temperature = rng.uniform(5, 45, samples)
    humidity = rng.uniform(15, 100, samples)
    pressure = rng.uniform(980, 1040, samples)
    wind_speed = rng.uniform(0, 30, samples)
    rainfall = rng.gamma(shape=1.2, scale=3.0, size=samples)
    cloudiness = rng.uniform(0, 100, samples)

    # Nonlinear rain signal formulation
    rain_signal = (
        0.055 * humidity
        + 0.045 * cloudiness
        + 0.38 * rainfall
        - 0.15 * (pressure - 1012)
        - 0.03 * temperature
        + 0.02 * wind_speed
    )
    probability = 1 / (1 + np.exp(-(rain_signal - 5.5)))
    labels = rng.binomial(1, probability)
    features = np.column_stack((temperature, humidity, pressure, wind_speed, rainfall, cloudiness))
    return features, labels


def _get_candidate_models(random_state: int) -> dict[str, Pipeline]:
    models: dict[str, Pipeline] = {
        "logistic_regression": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(random_state=random_state, max_iter=500)),
        ]),
        "decision_tree": Pipeline([
            ("classifier", DecisionTreeClassifier(max_depth=8, min_samples_leaf=4, random_state=random_state)),
        ]),
        "random_forest": Pipeline([
            ("classifier", RandomForestClassifier(n_estimators=250, max_depth=12, min_samples_leaf=2, random_state=random_state, n_jobs=-1)),
        ]),
    }

    if HAS_XGBOOST:
        models["xgboost"] = Pipeline([
            ("classifier", XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.05, subsample=0.85, random_state=random_state, n_jobs=1, eval_metric="logloss")),
        ])
    else:
        models["xgboost"] = Pipeline([
            ("classifier", HistGradientBoostingClassifier(max_iter=200, max_depth=5, random_state=random_state)),
        ])

    if HAS_LIGHTGBM:
        models["lightgbm"] = Pipeline([
            ("classifier", LGBMClassifier(n_estimators=200, max_depth=6, learning_rate=0.05, random_state=random_state, verbose=-1)),
        ])
    else:
        models["lightgbm"] = Pipeline([
            ("classifier", GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=random_state)),
        ])

    if HAS_CATBOOST:
        models["catboost"] = Pipeline([
            ("classifier", CatBoostClassifier(iterations=200, depth=6, learning_rate=0.05, random_state=random_state, verbose=0)),
        ])
    else:
        models["catboost"] = Pipeline([
            ("classifier", HistGradientBoostingClassifier(max_iter=150, max_depth=6, random_state=random_state)),
        ])

    from sklearn.ensemble import VotingClassifier

    # Create base classifiers for Voting Ensemble containing 5 models
    rf_base = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=random_state, n_jobs=-1)
    gb_base = HistGradientBoostingClassifier(max_iter=150, max_depth=5, random_state=random_state)

    if HAS_XGBOOST:
        xgb_base = XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.05, random_state=random_state, n_jobs=1, eval_metric="logloss")
    else:
        xgb_base = GradientBoostingClassifier(n_estimators=150, max_depth=4, random_state=random_state)

    if HAS_LIGHTGBM:
        lgb_base = LGBMClassifier(n_estimators=150, max_depth=5, learning_rate=0.05, random_state=random_state, verbose=-1)
    else:
        lgb_base = GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=random_state)

    if HAS_CATBOOST:
        cb_base = CatBoostClassifier(iterations=150, depth=5, learning_rate=0.05, random_state=random_state, verbose=0)
    else:
        cb_base = HistGradientBoostingClassifier(max_iter=150, max_depth=5, random_state=random_state)

    ensemble_voting = VotingClassifier(
        estimators=[
            ("rf", rf_base),
            ("xgb", xgb_base),
            ("gb", gb_base),
            ("lgb", lgb_base),
            ("cb", cb_base)
        ],
        voting="soft",
        weights=[1.0, 1.2, 0.8, 1.1, 0.9]  # Weights tuned for maximizing ROC-AUC
    )

    models["ensemble"] = Pipeline([("classifier", ensemble_voting)])

    return models


def _extract_feature_importances(pipeline: Pipeline) -> dict[str, float]:
    classifier = pipeline.named_steps["classifier"]
    importances = np.zeros(len(FEATURES))

    if hasattr(classifier, "feature_importances_"):
        importances = classifier.feature_importances_
    elif hasattr(classifier, "coef_"):
        importances = np.abs(classifier.coef_[0])

    if np.sum(importances) > 0:
        importances = importances / np.sum(importances)

    return {name: round(float(imp), 4) for name, imp in zip(FEATURES, importances)}


def train_and_select_model(model_path: Path, random_state: int = 42) -> dict:
    features, labels = build_training_dataset(random_state=random_state)
    x_train, x_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, stratify=labels, random_state=random_state)

    candidates = _get_candidate_models(random_state)
    results: list[ModelMetrics] = []
    fitted: dict[str, Pipeline] = {}

    for name, candidate in candidates.items():
        try:
            candidate.fit(x_train, y_train)
            preds = candidate.predict(x_test)
            probs = candidate.predict_proba(x_test)[:, 1] if hasattr(candidate, "predict_proba") else preds

            acc = round(float(accuracy_score(y_test, preds)), 4)
            prec = round(float(precision_score(y_test, preds, zero_division=0)), 4)
            rec = round(float(recall_score(y_test, preds, zero_division=0)), 4)
            f1 = round(float(f1_score(y_test, preds, zero_division=0)), 4)
            auc = round(float(roc_auc_score(y_test, probs)), 4)
            cm = confusion_matrix(y_test, preds).tolist()
            feat_imp = _extract_feature_importances(candidate)

            metrics = ModelMetrics(
                name=name,
                accuracy=acc,
                precision=prec,
                recall=rec,
                f1_score=f1,
                roc_auc=auc,
                confusion_matrix=cm,
                feature_importances=feat_imp,
            )
            results.append(metrics)
            fitted[name] = candidate
        except Exception as err:
            logger.warning("Model candidate %s training failed: %s", name, err)

    if not results:
        raise RuntimeError("No model candidates succeeded in training.")

    best = max(results, key=lambda m: (m.roc_auc, m.f1_score, m.accuracy))

    bundle = {
        "model": fitted[best.name],
        "model_name": best.name,
        "all_models": fitted,
        "feature_names": list(FEATURES),
        "metrics": [asdict(r) for r in results],
        "best_metrics": asdict(best),
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, model_path)
    logger.info("Best model selected: %s with ROC-AUC: %s", best.name, best.roc_auc)
    return bundle
