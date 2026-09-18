from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SourceResponse(BaseModel):
    id: str
    source_type: str
    reference_code: str
    title: str
    description: Optional[str] = None
    source_date: datetime
    case_id: Optional[str] = None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
