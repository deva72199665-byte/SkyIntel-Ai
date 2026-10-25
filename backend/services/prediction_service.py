import csv
from io import StringIO
import json

from fastapi import HTTPException
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from models import PredictionHistory, User, WeatherHistory
from services.pdf_service import generate_prediction_pdf


def create_prediction_record(
    db: Session,
    user: User,
    city: str,
    prediction_result: dict,
    weather_observation: dict | None = None,
    weather_history_id: int | None = None,
) -> PredictionHistory:
    record = PredictionHistory(
        user_id=user.id,
        weather_history_id=weather_history_id,
        city=city,
        rain_probability=prediction_result["rain_probability"],
        flood_risk=prediction_result["flood_risk"],
        flood_risk_score=prediction_result.get("flood_risk_score", 0.0),
        drying_condition=prediction_result["drying_condition"],
        selected_model=prediction_result.get("selected_model", "best"),
        recommendations=json.dumps(prediction_result.get("recommendations", [])),
        shap_values_json=json.dumps(prediction_result.get("explainability", {})),
        temperature=weather_observation.get("temperature") if weather_observation else None,
        humidity=weather_observation.get("humidity") if weather_observation else None,
        pressure=weather_observation.get("pressure") if weather_observation else None,
        wind_speed=weather_observation.get("wind_speed") if weather_observation else None,
        cloudiness=weather_observation.get("cloudiness") if weather_observation else None,
        rainfall=weather_observation.get("rainfall") if weather_observation else None,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_prediction_records(
    db: Session,
    user: User,
    city_filter: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[PredictionHistory], int]:
    query = select(PredictionHistory).where(PredictionHistory.user_id == user.id)
    if city_filter:
        query = query.where(PredictionHistory.city.ilike(f"%{city_filter.strip()}%"))

    # Count total matching
    total_count = len(list(db.scalars(query)))

    statement = query.order_by(desc(PredictionHistory.created_at)).offset(offset).limit(limit)
    records = list(db.scalars(statement))
    return records, total_count


def get_prediction_record(db: Session, user: User, record_id: int) -> PredictionHistory:
    record = db.get(PredictionHistory, record_id)
    if record is None or record.user_id != user.id:
        raise HTTPException(status_code=404, detail="Prediction history record not found.")
    return record


def export_predictions_csv(records: list[PredictionHistory]) -> str:
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Date", "City", "Rain Probability (%)", "Flood Risk", "Flood Risk Score",
        "Drying Condition", "ML Model", "Temperature (°C)", "Humidity (%)", "Pressure (hPa)", "Wind (m/s)"
    ])

    for r in records:
        writer.writerow([
            r.id,
            r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            r.city,
            r.rain_probability,
            r.flood_risk,
            r.flood_risk_score,
            r.drying_condition,
            r.selected_model,
            r.temperature if r.temperature is not None else "",
            r.humidity if r.humidity is not None else "",
            r.pressure if r.pressure is not None else "",
            r.wind_speed if r.wind_speed is not None else "",
        ])
    return output.getvalue()


def export_prediction_pdf(record: PredictionHistory) -> bytes:
    record_dict = {
        "city": record.city,
        "created_at": record.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "rain_probability": record.rain_probability,
        "selected_model": record.selected_model,
        "flood_risk": record.flood_risk,
        "drying_condition": record.drying_condition,
        "temperature": record.temperature or 25.0,
        "humidity": record.humidity or 50.0,
        "pressure": record.pressure or 1013.0,
        "wind_speed": record.wind_speed or 5.0,
        "recommendations": json.loads(record.recommendations) if record.recommendations else [],
    }
    return generate_prediction_pdf(record_dict)
