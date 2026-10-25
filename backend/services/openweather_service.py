import logging
import random
from datetime import datetime, timezone

import httpx
from fastapi import HTTPException, status

from schemas.weather import WeatherCreate
from utils.config import get_settings

logger = logging.getLogger(__name__)

OPENWEATHER_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"


def generate_mock_weather(city: str) -> WeatherCreate:
    """Generate realistic mock weather data as a fallback when the external API is offline or unconfigured."""
    logger.info("Generating mock weather data for city: %s", city)
    
    temperature = round(random.uniform(15.0, 35.0), 1)
    humidity = round(random.uniform(40.0, 95.0), 1)
    pressure = round(random.uniform(1000.0, 1020.0), 1)
    wind_speed = round(random.uniform(1.0, 12.0), 1)
    cloudiness = round(random.uniform(0.0, 100.0), 1)
    
    # 30% chance of rain
    if random.random() < 0.3:
        rainfall = round(random.uniform(0.5, 12.0), 1)
    else:
        rainfall = 0.0

    # Align humidity and cloudiness to match rainy conditions
    if rainfall > 0.0:
        humidity = max(humidity, 75.0)
        cloudiness = max(cloudiness, 70.0)
        
    if rainfall > 5.0:
        description = "Heavy Intensity Rain"
    elif rainfall > 0.0:
        description = "Light Rain"
    elif cloudiness > 80:
        description = "Overcast Clouds"
    elif cloudiness > 50:
        description = "Broken Clouds"
    elif cloudiness > 20:
        description = "Few Clouds"
    else:
        description = "Clear Sky"

    return WeatherCreate(
        city=city.title(),
        country="Mock",
        temperature=temperature,
        humidity=humidity,
        pressure=pressure,
        wind_speed=wind_speed,
        rainfall=rainfall,
        cloudiness=cloudiness,
        description=description,
        observed_at=datetime.now(timezone.utc),
    )


async def fetch_live_weather(city: str | None = None, lat: float | None = None, lon: float | None = None) -> WeatherCreate:
    """Fetch and normalize OpenWeatherMap current conditions using metric units.
    Supports lookup by city name OR latitude/longitude coordinates.
    Uses multi-tier geocoding resolution for fuzzy matching and typo recovery.
    Raises HTTPException if OpenWeatherMap is unconfigured or offline.
    """
    from services.geocoding_service import geocode_location
    settings = get_settings()

    target_city = city
    target_lat = lat
    target_lon = lon

    # Geocoding resolution step for city queries
    if target_city and (target_lat is None or target_lon is None):
        geocoded = await geocode_location(target_city)
        if geocoded:
            best_match = geocoded[0]
            target_city = best_match.name
            target_lat = best_match.lat
            target_lon = best_match.lon

    # Raise error if API key is unconfigured or placeholder
    if not settings.openweather_api_key or settings.openweather_api_key == "your_openweathermap_api_key":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenWeatherMap API key not configured or using placeholder."
        )

    try:
        params = {"units": "metric", "appid": settings.openweather_api_key}
        if target_lat is not None and target_lon is not None:
            params["lat"] = target_lat
            params["lon"] = target_lon
        elif target_city:
            params["q"] = target_city
        else:
            raise HTTPException(status_code=400, detail="Either city or coordinates (lat/lon) must be provided.")

        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(OPENWEATHER_CURRENT_URL, params=params)

        if response.status_code == 404 and target_city:
            # Final fallback to offline fuzzy dataset if 404 returned
            offline = await geocode_location(target_city)
            if offline:
                params_off = {"units": "metric", "appid": settings.openweather_api_key, "lat": offline[0].lat, "lon": offline[0].lon}
                async with httpx.AsyncClient(timeout=12) as client:
                    response = await client.get(OPENWEATHER_CURRENT_URL, params=params_off)

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"OpenWeatherMap returned status {response.status_code}."
            )

        data = response.json()
        rain = data.get("rain", {})
        rainfall = float(rain.get("1h", rain.get("3h", 0.0)))
        return WeatherCreate(
            city=target_city.title() if target_city else (data["name"] if data.get("name") else "My Location"),
            country=data.get("sys", {}).get("country"),
            temperature=round(data["main"]["temp"], 1),
            humidity=data["main"]["humidity"],
            pressure=data["main"]["pressure"],
            wind_speed=data.get("wind", {}).get("speed", 0.0),
            rainfall=rainfall,
            cloudiness=data.get("clouds", {}).get("all", 0.0),
            description=data["weather"][0]["description"].title(),
            observed_at=datetime.fromtimestamp(data["dt"], tz=timezone.utc),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error fetching from OpenWeatherMap: {str(exc)}"
        )


def generate_mock_forecast(city: str | None) -> dict:
    """Generate realistic mock 5-day forecast timeline data."""
    import random
    from datetime import datetime, timedelta
    city_name = city if city else "My Location"
    
    list_data = []
    base_time = datetime.now()
    
    for i in range(24):
        forecast_time = base_time + timedelta(hours=i*3)
        temp = round(random.uniform(20.0, 32.0), 1)
        humidity = random.randint(40, 95)
        wind_speed = round(random.uniform(2.0, 10.0), 1)
        rain_prob = random.choice([0.0, 0.0, random.uniform(0.1, 8.0)])
        
        list_data.append({
            "dt": int(forecast_time.timestamp()),
            "main": {
                "temp": temp,
                "humidity": humidity,
                "pressure": 1010
            },
            "weather": [{
                "main": "Rain" if rain_prob > 0 else "Clouds" if humidity > 70 else "Clear",
                "description": "light rain" if rain_prob > 0 else "broken clouds" if humidity > 70 else "clear sky",
                "icon": "10d" if rain_prob > 0 else "03d" if humidity > 70 else "01d"
            }],
            "wind": {
                "speed": wind_speed,
                "deg": random.randint(0, 360)
            },
            "rain": {"3h": rain_prob} if rain_prob > 0 else {},
            "dt_txt": forecast_time.strftime("%Y-%m-%d %H:%M:%S")
        })
        
    return {
        "city": {"name": city_name, "country": "Mock"},
        "list": list_data
    }


async def fetch_weather_forecast(city: str | None = None, lat: float | None = None, lon: float | None = None) -> dict:
    """Fetch 5-day / 3-hour forecast from OpenWeatherMap.
    Raises HTTPException if OpenWeatherMap is unconfigured, unauthorized, or offline.
    """
    settings = get_settings()
    if not settings.openweather_api_key or settings.openweather_api_key == "your_openweathermap_api_key":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenWeatherMap API key not configured or using placeholder."
        )
        
    try:
        params = {"units": "metric", "appid": settings.openweather_api_key}
        if lat is not None and lon is not None:
            params["lat"] = lat
            params["lon"] = lon
        elif city:
            params["q"] = city
        else:
            raise HTTPException(status_code=400, detail="Either city or coordinates are required.")
            
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get("https://api.openweathermap.org/data/2.5/forecast", params=params)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"OpenWeatherMap returned status {response.status_code}."
            )
            
        return response.json()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error fetching weather forecast: {str(exc)}"
        )



