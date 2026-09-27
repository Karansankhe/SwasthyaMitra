from fastapi import APIRouter
from app.models.inventory import InventoryStatusResponse
from app.services.inventory import check_inventory_status

router = APIRouter(tags=["Inventory"])

@router.get("/status", response_model=InventoryStatusResponse)
async def get_inventory_status():
    """
    Quick summary of critical stock-outs and current stock levels across districts,
    powered by an agent analyzing the dataset.
    """
    data = check_inventory_status()
    return InventoryStatusResponse(**data)
