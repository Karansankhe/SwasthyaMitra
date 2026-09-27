from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DistributionPlanRequest(BaseModel):
    location: str = Field(
        ...,
        description="Target location for the distribution planning (e.g., state or region).",
        examples=["India", "Maharashtra, India"]
    )
    time_horizon: str = Field(
        default="long",
        description="Forecast range: short, medium, or long."
    )

class DistributionPlanResponse(BaseModel):
    status: str
    plan: Dict[str, Any]
    meta: Dict[str, Any]

class ReallocateRequest(BaseModel):
    source_phc_id: str = Field(..., description="ID of the PHC sending the resources", examples=["PHC-PUNE-01"])
    target_phc_id: str = Field(..., description="ID of the PHC receiving the resources", examples=["PHC-PUNE-05"])
    item_id: str = Field(..., description="The unique identifier for the medical item", examples=["ITEM-O2-CYL"])
    quantity: int = Field(..., description="Amount of items to reallocate", gt=0, examples=[5])

class ReallocateResponse(BaseModel):
    status: str = Field(..., description="Status of the request", examples=["success"])
    transaction_id: str = Field(..., description="Unique transaction ID for tracking", examples=["txn_1a2b3c4d"])
    message: str = Field(..., description="Detailed message of the action taken", examples=["Successfully initiated reallocation of 5 ITEM-O2-CYL from PHC-PUNE-01 to PHC-PUNE-05."])
