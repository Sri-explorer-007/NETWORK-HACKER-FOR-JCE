from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    status: str = "ok"
    service: str = "network-hunter-api"
