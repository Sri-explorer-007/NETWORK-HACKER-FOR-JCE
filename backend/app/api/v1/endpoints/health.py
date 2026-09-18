from fastapi import APIRouter
from app.schemas.health import HealthCheckResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthCheckResponse,
    summary="Health Check Endpoint",
    description="Returns the health status and service identifier.",
)
async def health_check() -> HealthCheckResponse:
    return HealthCheckResponse(status="ok", service="network-hunter-api")
