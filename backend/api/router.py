from fastapi import APIRouter

from api import admin, assistant, auth, predictions, tools, users, weather, prediction_timeline, model_lab

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(weather.router)
api_router.include_router(predictions.router)
api_router.include_router(admin.router)
api_router.include_router(assistant.router)
api_router.include_router(tools.router)
api_router.include_router(prediction_timeline.router)
api_router.include_router(model_lab.router)



