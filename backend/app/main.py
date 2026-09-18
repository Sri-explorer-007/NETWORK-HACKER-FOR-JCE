from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.schemas.health import HealthCheckResponse
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Evidence-first, time-aware network intelligence platform API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure CORS Middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Root Health Check (GET /health)
@app.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health Check",
    tags=["Health"],
)
async def root_health() -> HealthCheckResponse:
    """Returns the service health status."""
    return HealthCheckResponse(status="ok", service="network-hunter-api")

# Include API Router under /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
