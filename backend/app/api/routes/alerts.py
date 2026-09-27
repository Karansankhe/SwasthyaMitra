from fastapi import APIRouter
from app.models.alerts import AlertTriggerRequest, AlertTriggerResponse
from app.services.alerts import generate_alerts

router = APIRouter(tags=["Alerts"])

@router.post("/trigger", response_model=AlertTriggerResponse)
async def trigger_alerts(req: AlertTriggerRequest):
    """
    Generate automated early warning alerts for impending shortages based on predictive AI forecasts.
    """
    data = generate_alerts(req.region)
    return AlertTriggerResponse(**data)
