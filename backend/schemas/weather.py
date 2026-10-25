from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WeatherCreate(BaseModel):
    city: str = Field(min_length=2, max_length=120)
    country: str | None = Field(default=None, max_length=80)
    temperature: float = Field(ge=-100, le=100)
    humidity: float = Field(ge=0, le=100)
    pressure: float = Field(ge=800, le=1200)
    wind_speed: float = Field(ge=0, le=150)
    rainfall: float = Field(default=0, ge=0, le=2000)
    cloudiness: float = Field(ge=0, le=100)
    description: str = Field(min_length=1, max_length=255)
    observed_at: datetime


class WeatherResponse(WeatherCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
