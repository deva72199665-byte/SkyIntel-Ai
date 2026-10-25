import logging
import os
import sys
import time
from contextlib import asynccontextmanager

# Add the backend directory to sys.path to allow correct module resolution on Vercel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import FileResponse

from api.router import api_router
from database.base import Base
from database.session import engine
import models
from utils.config import get_settings
from utils.errors import unhandled_exception_handler, validation_exception_handler
from utils.logging import configure_logging

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting %s in %s mode", settings.app_name, settings.environment)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as exc:
        logger.warning("Database schema initialization warning: %s", exc)
    yield
    logger.info("Stopping %s", settings.app_name)


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.trusted_hosts)


@app.middleware("http")
async def request_logging(request: Request, call_next):
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    logger.info("%s %s -> %s in %.3fs", request.method, request.url.path, response.status_code, time.perf_counter() - started)
    return response


app.include_router(api_router)


@app.get("/api/health", tags=["System"])
def health_check() -> dict[str, str]:
    return {"status": "healthy", "service": settings.app_name}


# Serve frontend static assets & SPA fallback
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    if catchall.startswith("api") or catchall.startswith("docs") or catchall.startswith("openapi.json"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not Found")
    
    file_path = os.path.join(frontend_dir, catchall)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse("Frontend assets not found. Please build the frontend first.", status_code=404)

