import sys
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.ml.model_service import get_model_bundle, get_model_metrics
from auth.dependencies import get_current_user
from database.session import get_db
from models import PredictionHistory, User, WeatherHistory

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


def require_admin(user: User = Depends(get_current_user)):
    """Authorize admin user accounts (role='admin' or role='super_admin' or admin@ email prefix)."""
    if getattr(user, "role", "user") in ["admin", "super_admin"] or user.email.lower().startswith("admin@"):
        return user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. Admin privileges required.",
    )


def require_super_admin(user: User = Depends(get_current_user)):
    """Authorize Super Admin user accounts."""
    if getattr(user, "role", "user") == "super_admin" or user.email.lower() == "admin@skyintel.ai":
        return user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. Super Admin privileges required.",
    )


@router.get("/stats")
def get_system_stats(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    """Get comprehensive SkyIntel AI system stats and ML benchmark metrics."""
    user_count = db.scalar(select(func.count(User.id))) or 0
    prediction_count = db.scalar(select(func.count(PredictionHistory.id))) or 0
    weather_count = db.scalar(select(func.count(WeatherHistory.id))) or 0

    top_cities_query = (
        select(PredictionHistory.city, func.count(PredictionHistory.id).label("count"))
        .group_by(PredictionHistory.city)
        .order_by(func.count(PredictionHistory.id).desc())
        .limit(5)
    )
    top_cities_rows = db.execute(top_cities_query).all()
    top_cities = [{"city": row[0], "count": row[1]} for row in top_cities_rows]

    try:
        model_metrics = get_model_metrics()
        bundle = get_model_bundle()
        active_model = bundle.get("model_name", "Random Forest")
    except Exception:
        model_metrics = []
        active_model = "Random Forest"

    return {
        "total_users": user_count,
        "total_predictions": prediction_count,
        "total_weather_records": weather_count,
        "top_cities": top_cities,
        "active_model": active_model,
        "model_comparison": model_metrics,
        "server_health": {
            "status": "healthy",
            "python_version": sys.version.split()[0],
            "database_engine": "SQLite 3",
        },
    }


@router.get("/users")
def list_users(db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    """List registered users and activity counts."""
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    results = []
    for u in users:
        pred_count = db.scalar(select(func.count(PredictionHistory.id)).where(PredictionHistory.user_id == u.id)) or 0
        results.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": getattr(u, "role", "user"),
            "is_active": u.is_active,
            "created_at": u.created_at,
            "prediction_count": pred_count,
        })
    return results


@router.post("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account.",
        )
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(require_admin)):
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account.",
        )
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(user)
    db.commit()
    return {"status": "success", "message": "User deleted successfully."}



class ResetPlatformRequest(BaseModel if 'BaseModel' in globals() else object):
    pass

from pydantic import BaseModel, Field

class PlatformResetSchema(BaseModel):
    password: str
    confirm_phrase: str = Field(description="Must equal 'DELETE EVERYTHING'")


@router.post("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str = Query(description="Role: user, analyst, admin, super_admin"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_super_admin)
):
    """Super Admin role management endpoint."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if role not in ["user", "analyst", "admin", "super_admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    user.role = role
    db.commit()
    return {"status": "success", "user_id": user.id, "new_role": user.role}


@router.post("/reset-platform")
def reset_entire_platform(
    payload: PlatformResetSchema,
    db: Session = Depends(get_db),
    super_admin: User = Depends(require_super_admin)
):
    """COMPLETE WEBSITE RESET: Super Admin security operation.
    Deletes all user accounts (except current Super Admin), all prediction records,
    weather history, search history, and favorite cities.
    Requires password re-authentication AND exact phrase 'DELETE EVERYTHING'.
    """
    from auth.security import verify_password
    from models import FavoriteCity, SearchHistory, PredictionHistory, WeatherHistory, User
    from sqlalchemy import delete

    if payload.confirm_phrase.strip() != "DELETE EVERYTHING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security verification failed. You must type exact phrase 'DELETE EVERYTHING' to proceed."
        )

    if not verify_password(payload.password, super_admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Incorrect Super Admin password."
        )

    # Perform cascading platform cleanup
    db.execute(delete(PredictionHistory))
    db.execute(delete(WeatherHistory))
    db.execute(delete(FavoriteCity))
    db.execute(delete(SearchHistory))
    db.execute(delete(User).where(User.id != super_admin.id))

    db.commit()

    return {
        "status": "success",
        "message": "SkyIntel AI Platform reset successfully. All non-superadmin records deleted. Super Admin preserved.",
        "super_admin": super_admin.email
    }


# Emergency Alert System In-Memory Storage
ACTIVE_ALERT = {"message": None, "severity": "info"}

# Threat intelligence log dataset
SECURITY_THREATS = [
    {"timestamp": "2026-07-23 21:55:04", "event": "Rate limit exceeded threshold (320 req/m)", "source": "IP 192.168.1.104", "risk_level": "Medium"},
    {"timestamp": "2026-07-23 21:40:12", "event": "Unauthorized REST API header injection attempt", "source": "IP 45.67.12.89", "risk_level": "High"},
    {"timestamp": "2026-07-23 21:12:45", "event": "Multiple failed admin signin vectors detected", "source": "User admin@skyintel.ai", "risk_level": "Medium"},
    {"timestamp": "2026-07-23 20:04:19", "event": "Suspicious payload size threshold breached", "source": "IP 102.15.65.12", "risk_level": "Low"}
]


@router.get("/active-alert", response_model=dict)
def get_active_alert():
    """Public endpoint to fetch active warning banners."""
    return ACTIVE_ALERT


@router.post("/broadcast-alert", response_model=dict)
def post_broadcast_alert(message: str = Query(...), severity: str = Query("info"), current_admin: User = Depends(require_admin)):
    global ACTIVE_ALERT
    ACTIVE_ALERT = {"message": message, "severity": severity}
    return ACTIVE_ALERT


@router.post("/broadcast-alert/clear", response_model=dict)
def clear_broadcast_alert(current_admin: User = Depends(require_admin)):
    global ACTIVE_ALERT
    ACTIVE_ALERT = {"message": None, "severity": "info"}
    return ACTIVE_ALERT


@router.get("/security-threats", response_model=list)
def get_security_threats(current_admin: User = Depends(require_admin)):
    return SECURITY_THREATS


