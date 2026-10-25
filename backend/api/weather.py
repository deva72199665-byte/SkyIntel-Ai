from fastapi import APIRouter, Depends, Query, status, Response
from sqlalchemy.orm import Session
import httpx

from auth.dependencies import get_current_user
from database.session import get_db
from models import User
from schemas.weather import WeatherCreate, WeatherResponse
from services.openweather_service import fetch_live_weather, fetch_weather_forecast
from services.weather_service import create_weather_record, get_weather_record, list_weather_records
from utils.config import get_settings

router = APIRouter(prefix="/weather-history", tags=["Weather History"])


@router.post("", response_model=WeatherResponse, status_code=status.HTTP_201_CREATED)
def create(payload: WeatherCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_weather_record(db, user, payload)


@router.get("/autocomplete", response_model=list[dict])
async def autocomplete_location(q: str = Query(min_length=1, max_length=100)):
    """Search global cities with fuzzy typo tolerance and real-time autocomplete."""
    from services.geocoding_service import geocode_location
    locations = await geocode_location(q)
    return [loc.model_dump() for loc in locations]


@router.get("/live", response_model=WeatherResponse)
async def fetch_and_store_live_weather(
    city: str | None = Query(default=None, min_length=2, max_length=120),
    lat: float | None = Query(default=None, ge=-90.0, le=90.0),
    lon: float | None = Query(default=None, ge=-180.0, le=180.0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from fastapi import HTTPException
    if not city and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="Either city name or coordinates (lat and lon) must be provided.")
    return create_weather_record(db, user, await fetch_live_weather(city=city, lat=lat, lon=lon))


@router.get("/forecast", response_model=dict)
async def get_forecast(
    city: str | None = Query(default=None),
    lat: float | None = Query(default=None),
    lon: float | None = Query(default=None),
    user: User = Depends(get_current_user)
):
    return await fetch_weather_forecast(city=city, lat=lat, lon=lon)


@router.get("/tiles/{layer}/{z}/{x}/{y}.png", tags=["Weather Map Tiles"])
async def get_weather_tile(layer: str, z: int, x: int, y: int):
    settings = get_settings()
    if not settings.openweather_api_key or settings.openweather_api_key == "your_openweathermap_api_key":
        return Response(status_code=204)
        
    url = f"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={settings.openweather_api_key}"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url)
            if resp.status_code == 200:
                return Response(content=resp.content, media_type="image/png")
        except Exception:
            pass
    return Response(status_code=204)


@router.get("", response_model=list[WeatherResponse])
def list_records(limit: int = Query(default=50, ge=1, le=100), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_weather_records(db, user, limit)


@router.get("/{record_id}", response_model=WeatherResponse)
def get_record(record_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_weather_record(db, user, record_id)

