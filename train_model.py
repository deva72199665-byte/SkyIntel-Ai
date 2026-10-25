"""Train and persist the bundled rain-probability model."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))
from app.ml.model_service import MODEL_PATH, train_model


if __name__ == "__main__":
    train_model()
    print(f"Rain model trained successfully: {MODEL_PATH}")
