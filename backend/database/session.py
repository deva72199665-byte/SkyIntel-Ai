from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from database.base import Base
import models  # noqa: F401
from utils.config import get_settings

settings = get_settings()
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

# Auto-create tables if they do not exist
try:
    Base.metadata.create_all(bind=engine)
    if settings.database_url.startswith("sqlite"):
        with engine.connect() as conn:
            from sqlalchemy import text
            # Ensure users table columns exist
            res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            user_cols = {row[1] for row in res}
            if "role" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user'"))
            if "is_verified" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 1"))

            # Ensure prediction_history table columns exist
            res_pred = conn.execute(text("PRAGMA table_info(prediction_history)")).fetchall()
            pred_cols = {row[1] for row in res_pred}
            cols = [
                ("flood_risk_score", "FLOAT NOT NULL DEFAULT 0.0"),
                ("selected_model", "VARCHAR(50) NOT NULL DEFAULT 'best'"),
                ("shap_values_json", "TEXT"),
                ("temperature", "FLOAT"),
                ("humidity", "FLOAT"),
                ("pressure", "FLOAT"),
                ("wind_speed", "FLOAT"),
                ("cloudiness", "FLOAT"),
                ("rainfall", "FLOAT"),
            ]
            for col_name, col_type in cols:
                if col_name not in pred_cols:
                    conn.execute(text(f"ALTER TABLE prediction_history ADD COLUMN {col_name} {col_type}"))

            # Ensure weather_history table columns exist
            res_w = conn.execute(text("PRAGMA table_info(weather_history)")).fetchall()
            w_cols = {row[1] for row in res_w}
            if "rainfall" not in w_cols:
                conn.execute(text("ALTER TABLE weather_history ADD COLUMN rainfall FLOAT NOT NULL DEFAULT 0.0"))
            conn.commit()
except Exception:
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

