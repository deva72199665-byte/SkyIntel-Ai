from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class PredictionCreate(BaseModel):
    weather_history_id: int | None = Field(default=None, gt=0)
    city: str = Field(min_length=2, max_length=120)
    rain_probability: float = Field(ge=0, le=100)
    flood_risk: str = Field(pattern="^(Low|Moderate|Medium|High|Severe)$")
    flood_risk_score: float | None = Field(default=0.0)
    drying_condition: str = Field(pattern="^(Good|Average|Poor)$")
    selected_model: str = Field(default="best")
    recommendations: list[str] = Field(default_factory=list)
    explainability: dict | None = None
    temperature: float | None = None
    humidity: float | None = None
    pressure: float | None = None
    wind_speed: float | None = None
    cloudiness: float | None = None
    rainfall: float | None = None
    forecast_breakdown: dict | None = None
    internal_location_debug: dict | None = None
    weather_description: str | None = None


class PredictionResponse(PredictionCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
