from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.api_v1 import api_router
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 ensure models are imported

app = FastAPI(title="FisioMove API", version="1.0.0")
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

# Configuración de CORS más explícita
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).strip() for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token",
        "Cache-Control",
        "Pragma",
        "User-Agent",
        "DNT",
        "If-Modified-Since"
    ],
    expose_headers=["*"],
)

# Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])  # Simple healthcheck
async def healthcheck():
    return {"status": "ok"}

@app.options("/api/v1/auth/login", tags=["cors"])  # Explicit OPTIONS handler for testing
async def options_login():
    return {"status": "ok"}

@app.get("/cors-test", tags=["cors"])  # Simple CORS test endpoint
async def cors_test():
    return {"message": "CORS is working", "status": "ok"}
