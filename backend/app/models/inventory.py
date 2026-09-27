from pydantic import BaseModel, Field
from typing import List, Dict, Any

class InventoryStatusResponse(BaseModel):
    status: str = Field(..., description="Status of the response", examples=["success"])
    critical_stockouts: int = Field(..., description="Total number of critical stockouts detected", examples=[12])
    districts_impacted: int = Field(..., description="Number of districts facing critical shortages", examples=[3])
    data: List[Dict[str, Any]] = Field(..., description="Detailed list of impacted inventory items by district", examples=[[
        {"district": "Pune", "item": "Paracetamol 500mg", "status": "Critical", "stock_left": 50},
        {"district": "Mumbai", "item": "O2 Cylinders", "status": "Low", "stock_left": 12}
    ]])
