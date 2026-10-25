from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)
    weather_history_id: Mapped[int | None] = mapped_column(ForeignKey("weather_history.id"), nullable=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    rain_probability: Mapped[float] = mapped_column(Float, nullable=False)
    flood_risk: Mapped[str] = mapped_column(String(20), nullable=False)
    flood_risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    drying_condition: Mapped[str] = mapped_column(String(20), nullable=False)
    selected_model: Mapped[str] = mapped_column(String(50), default="best", nullable=False)
    recommendations: Mapped[str] = mapped_column(Text, nullable=False)
    shap_values_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    humidity: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure: Mapped[float | None] = mapped_column(Float, nullable=True)
    wind_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    cloudiness: Mapped[float | None] = mapped_column(Float, nullable=True)
    rainfall: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True, nullable=False)

    user: Mapped["User"] = relationship(back_populates="prediction_history")
    weather: Mapped["WeatherHistory | None"] = relationship()
