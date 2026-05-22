from pydantic import BaseModel, Field


class ServiceStatus(BaseModel):
    service: str = Field(min_length=1)
    status: str = Field(pattern="^(ok|degraded|unavailable)$")
    project: str = "technofest2026"
