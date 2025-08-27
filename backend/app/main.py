from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings
from app.routers.api_v1 import api_router
from app.db.session import engine
from app.db.base import Base
import app.models  # noqa: F401 ensure models are imported

app = FastAPI(title="FisioMove API", version="1.0.0")

# Configure limiter (default in-memory). For production, configure RedisStorage.
# Example: Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379")
limiter = Limiter(key_func=get_remote_address)
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
