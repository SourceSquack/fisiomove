from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.api_v1 import api_router

app = FastAPI(title="FisioMove API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).strip() for origin in settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])  # Simple healthcheck
async def healthcheck():
    return {"status": "ok"}
