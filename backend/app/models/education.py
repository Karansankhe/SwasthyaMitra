from pydantic import BaseModel, Field
from typing import List, Optional

class SimulationQuestion(BaseModel):
    id: str
    question_text: str
    options: List[str]
    correct_option_index: int
    explanation: Optional[str] = None

class EducationModule(BaseModel):
    module_id: str
    title: str
    description: str
    target_audience: str
    questions: List[SimulationQuestion]

class EducationRequest(BaseModel):
    query: str = Field(..., examples=["Create a training module for cholera outbreak prevention", "What are the safety protocols during floods?"])
    user_role: str = Field(default="staff", examples=["healthcare worker", "volunteer", "administrator"])
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "Create a training module for cholera outbreak prevention",
                    "user_role": "healthcare worker"
                }
            ]
        }
    }

class EducationResponse(BaseModel):
    modules: List[EducationModule]
