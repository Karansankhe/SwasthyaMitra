from pydantic import BaseModel
from typing import List, Dict, Any

class AlertTriggerRequest(BaseModel):
    region: str
    threshold_level: str

class AlertTriggerResponse(BaseModel):
    status: str
    alerts_generated: int
    message: str
