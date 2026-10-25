import json
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from app.ml.model_service import predict_rain_and_impact
from auth.dependencies import get_current_user
from database.session import get_db
from models import User
from schemas.prediction import PredictionCreate, PredictionResponse
from services.openweather_service import fetch_live_weather, fetch_weather_forecast
from services.prediction_service import (
    create_prediction_record,
    export_prediction_pdf,
    export_predictions_csv,
    get_prediction_record,
    list_prediction_records,
)
from services.weather_service import create_weather_record

router = APIRouter(prefix="/prediction-history", tags=["Prediction History"])


@router.get("/models-comparison", response_model=dict)
def get_models_comparison(user: User = Depends(get_current_user)):
    """Fetch comparative metrics (Accuracy, Precision, Recall, F1, ROC-AUC) across all trained ML models."""
    from app.ml.model_service import get_model_bundle
    bundle = get_model_bundle()
    return {
        "best_model": bundle.get("model_name"),
        "best_metrics": bundle.get("best_metrics"),
        "all_metrics": bundle.get("metrics", []),
        "feature_names": bundle.get("feature_names", []),
    }


def _format_response(record) -> PredictionResponse:
    recs = json.loads(record.recommendations) if isinstance(record.recommendations, str) else (record.recommendations or [])
    shap = json.loads(record.shap_values_json) if isinstance(record.shap_values_json, str) else (record.shap_values_json or {})
    return PredictionResponse(
        id=record.id,
        weather_history_id=record.weather_history_id,
        city=record.city,
        rain_probability=record.rain_probability,
        flood_risk=record.flood_risk,
        flood_risk_score=record.flood_risk_score,
        drying_condition=record.drying_condition,
        selected_model=record.selected_model or "best",
        recommendations=recs if isinstance(recs, list) else [str(recs)],
        explainability=shap,
        temperature=record.temperature,
        humidity=record.humidity,
        pressure=record.pressure,
        wind_speed=record.wind_speed,
        cloudiness=record.cloudiness,
        rainfall=record.rainfall,
        created_at=record.created_at,
        forecast_breakdown=getattr(record, "forecast_breakdown", None),
        internal_location_debug=getattr(record, "internal_location_debug", None),
        weather_description=record.weather.description if record.weather else getattr(record, "weather_description", None),
    )


@router.post("/live", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def create_from_live_weather(
    city: str | None = Query(default=None, min_length=2, max_length=120),
    lat: float | None = Query(default=None, ge=-90.0, le=90.0),
    lon: float | None = Query(default=None, ge=-180.0, le=180.0),
    model: str = Query(default="best", description="ML model selection (best, random_forest, xgboost, logistic_regression, decision_tree, lightgbm, catboost)"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="Either city name or coordinates (lat and lon) must be provided.")

    target_city = city
    target_lat = lat
    target_lon = lon

    # Geocoding resolution step for city queries to ensure exact coordinate match
    if target_city and (target_lat is None or target_lon is None):
        from services.geocoding_service import geocode_location
        geocoded = await geocode_location(target_city)
        if geocoded:
            best_match = geocoded[0]
            target_city = best_match.name
            target_lat = best_match.lat
            target_lon = best_match.lon

    try:
        weather_obs = await fetch_live_weather(city=target_city, lat=target_lat, lon=target_lon)
        forecast_data = await fetch_weather_forecast(city=target_city, lat=target_lat, lon=target_lon)
    except Exception as exc:
        from sqlalchemy import select, desc
        from models import PredictionHistory
        last_rec = None
        if target_city:
            stmt = select(PredictionHistory).where(PredictionHistory.city.ilike(target_city)).order_by(desc(PredictionHistory.created_at)).limit(1)
            last_rec = db.scalar(stmt)

        if last_rec and last_rec.temperature is not None:
            formatted_time = last_rec.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            msg = (
                f"Weather data unavailable. "
                f"Last successfully retrieved value for {last_rec.city} was "
                f"{last_rec.temperature}°C with {last_rec.rain_probability}% rain probability "
                f"observed at {formatted_time}."
            )
        else:
            msg = "Weather data unavailable."
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=msg
        )
    forecast_list = forecast_data.get("list", [])
    city_timezone_offset = forecast_data.get("city", {}).get("timezone", 0)

    # Validation (Section 14)
    if not weather_obs.city:
        raise HTTPException(status_code=422, detail="City name is missing in weather observation.")
    if target_lat is not None and (target_lat < -90.0 or target_lat > 90.0):
        raise HTTPException(status_code=422, detail="Latitude is invalid.")
    if target_lon is not None and (target_lon < -180.0 or target_lon > 180.0):
        raise HTTPException(status_code=422, detail="Longitude is invalid.")
    if weather_obs.temperature is None:
        raise HTTPException(status_code=422, detail="Temperature data is missing in weather observation.")
    if weather_obs.humidity is None:
        raise HTTPException(status_code=422, detail="Humidity data is missing in weather observation.")
    if weather_obs.wind_speed is None:
        raise HTTPException(status_code=422, detail="Wind speed data is missing in weather observation.")
    if not forecast_list:
        raise HTTPException(status_code=422, detail="Forecast list is empty or missing.")

    # Timezone Local Conversion (Section 11)
    local_tz = timezone(timedelta(seconds=city_timezone_offset))
    local_obs_time = weather_obs.observed_at.astimezone(local_tz)

    weather_record = create_weather_record(db, user, weather_obs)

    obs_dict = {
        "temperature": weather_obs.temperature,
        "humidity": weather_obs.humidity,
        "pressure": weather_obs.pressure,
        "wind_speed": weather_obs.wind_speed,
        "rainfall": weather_obs.rainfall,
        "cloudiness": weather_obs.cloudiness,
    }

    # Calculate today's overall rain chance (maximum pop over the forecast blocks representing today / next 24h)
    real_rain_prob = 0.0
    forecast_breakdown = {}
    
    # 1. Print the complete raw forecast values received from the API (for debug mode, Section 15)
    logger.info("=========================================")
    logger.info("Requested city: %s", city or "N/A")
    logger.info("Resolved city: %s", target_city or "N/A")
    logger.info("Latitude: %s", target_lat)
    logger.info("Longitude: %s", target_lon)
    logger.info("Timezone: UTC%+d (offset: %d s)", city_timezone_offset / 3600, city_timezone_offset)
    logger.info("API source: OpenWeatherMap")
    logger.info("API observation time: %s", local_obs_time.strftime("%Y-%m-%d %H:%M:%S"))
    logger.info("Current temperature: %s °C", weather_obs.temperature)
    logger.info("Humidity: %d%%", weather_obs.humidity)
    logger.info("Wind: %s m/s", weather_obs.wind_speed)
    logger.info("-----------------------------------------")
    
    for i, item in enumerate(forecast_list[:8]):
        dt_unix = item.get("dt")
        dt_local = datetime.fromtimestamp(dt_unix, tz=local_tz)
        temp = item.get("main", {}).get("temp")
        humidity = item.get("main", {}).get("humidity")
        pop_val = item.get("pop", 0.0)
        rain_amount = item.get("rain", {}).get("3h", 0.0)
        condition = item.get("weather", [{}])[0].get("description", "N/A")
        logger.info("Forecast Time: %s | Temp: %s C | Hum: %d%% | Rain Prob: %d%% | Rain Vol: %s mm | Cond: %s",
                    dt_local.strftime("%Y-%m-%d %H:%M:%S"), temp, humidity, pop_val * 100, rain_amount, condition)
    logger.info("=========================================")

    if forecast_list:
        today_intervals = forecast_list[:8]
        pops = [float(item.get("pop", 0.0)) for item in today_intervals]
        if pops:
            real_rain_prob = max(pops) * 100.0
            
        next_3h = float(forecast_list[0].get("pop", 0.0)) * 100.0
        next_6h = max([float(item.get("pop", 0.0)) for item in forecast_list[:2]]) * 100.0
        today_pop = max([float(item.get("pop", 0.0)) for item in forecast_list[:8]]) * 100.0
        tomorrow_pop = max([float(item.get("pop", 0.0)) for item in forecast_list[8:16]]) * 100.0 if len(forecast_list) >= 16 else today_pop
        
        forecast_breakdown = {
            "next_3h": round(next_3h, 1),
            "next_6h": round(next_6h, 1),
            "today": round(today_pop, 1),
            "tomorrow": round(tomorrow_pop, 1),
        }

    prediction_result = predict_rain_and_impact(obs_dict, model_choice=model, real_rain_prob=real_rain_prob)

    record = create_prediction_record(
        db=db,
        user=user,
        city=weather_record.city,
        prediction_result=prediction_result,
        weather_observation=obs_dict,
        weather_history_id=weather_record.id,
    )
    
    # Attach dynamic attributes to return in _format_response
    record.forecast_breakdown = forecast_breakdown
    record.internal_location_debug = {
        "city": target_city,
        "latitude": target_lat,
        "longitude": target_lon,
        "timezone": forecast_data.get("city", {}).get("timezone", "UTC"),
    }
    record.weather_description = weather_record.description
    
    return _format_response(record)


@router.get("", response_model=dict)
def list_records(
    city: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records, total = list_prediction_records(db, user, city_filter=city, limit=limit, offset=offset)
    return {
        "total": total,
        "items": [_format_response(r) for r in records],
    }


@router.get("/export/csv")
def export_csv(
    city: str | None = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    records, _ = list_prediction_records(db, user, city_filter=city, limit=1000, offset=0)
    csv_data = export_predictions_csv(records)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=SkyIntel_Prediction_History.csv"},
    )


@router.get("/{record_id}/pdf")
def export_pdf(
    record_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    record = get_prediction_record(db, user, record_id)
    pdf_bytes = export_prediction_pdf(record)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=SkyIntel_Report_{record.city}_{record.id}.pdf"},
    )


@router.get("/{record_id}", response_model=PredictionResponse)
def get_record(record_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    record = get_prediction_record(db, user, record_id)
    return _format_response(record)
