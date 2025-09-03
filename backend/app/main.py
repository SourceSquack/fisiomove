from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Rate limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.middleware import SlowAPIMiddleware
from app.limiter import limiter
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.routers.api_v1 import api_router
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 ensure models are imported

app = FastAPI(title="FisioMove API", version="1.0.0")

# Limiter is configured in app.limiter to avoid circular imports and centralize
# the storage configuration. For production, update the limiter to use
# storage_uri="redis://..." (e.g. via environment variable).
app.state.limiter = limiter
app.add_exception_handler(429, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).strip() for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
async def healthcheck():
    return {"status": "ok"}
