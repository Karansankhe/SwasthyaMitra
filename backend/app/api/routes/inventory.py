from fastapi import APIRouter
from app.models.inventory import InventoryStatusResponse

router = APIRouter(tags=["Inventory"])

@router.get("/status", response_model=InventoryStatusResponse)
async def get_inventory_status():
    """
    Quick summary of critical stock-outs and current stock levels across districts.
    """
    return InventoryStatusResponse(
        status="success",
        critical_stockouts=12,
        districts_impacted=3,
        data=[
            {"district": "Pune", "item": "Paracetamol 500mg", "status": "Critical", "stock_left": 50},
            {"district": "Mumbai", "item": "O2 Cylinders", "status": "Low", "stock_left": 12},
        ]
    )
