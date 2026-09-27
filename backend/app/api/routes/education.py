from fastapi import APIRouter, HTTPException
from app.models.education import EducationRequest, EducationResponse
from app.services.education import generate_education_modules

router = APIRouter(tags=["Education"])

@router.post("/generate", response_model=EducationResponse)
async def generate_modules(request: EducationRequest):
    try:
        modules = generate_education_modules(query=request.query, user_role=request.user_role)
        return EducationResponse(modules=modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
