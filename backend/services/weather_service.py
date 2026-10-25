from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from models import User, WeatherHistory
from schemas.weather import WeatherCreate


def create_weather_record(db: Session, user: User, payload: WeatherCreate) -> WeatherHistory:
    record = WeatherHistory(user_id=user.id, **payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_weather_records(db: Session, user: User, limit: int = 50) -> list[WeatherHistory]:
    statement = select(WeatherHistory).where(WeatherHistory.user_id == user.id).order_by(desc(WeatherHistory.created_at)).limit(limit)
    return list(db.scalars(statement))


def get_weather_record(db: Session, user: User, record_id: int) -> WeatherHistory:
    record = db.get(WeatherHistory, record_id)
    if record is None or record.user_id != user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Weather history record not found.")
    return record
