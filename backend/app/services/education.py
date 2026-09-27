import json
from typing import List
from app.models.education import EducationModule, SimulationQuestion
import google.generativeai as genai
from app.core.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

def generate_education_modules(query: str, user_role: str) -> List[EducationModule]:
    prompt = f"""
    You are an AI for a federated health platform in India.
    Generate an educational module for a {user_role} based on the following situation or topic: "{query}".
    Include 2 interactive simulation questions to test their knowledge.
    
    Output strictly valid JSON matching this schema:
    [
      {{
        "module_id": "string",
        "title": "string",
        "description": "string",
        "target_audience": "string",
        "questions": [
          {{
            "id": "string",
            "question_text": "string",
            "options": ["string"],
            "correct_option_index": 0,
            "explanation": "string"
          }}
        ]
      }}
    ]
    Do not include markdown blocks like ```json ... ```, just output the raw JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        data_text = response.text.strip()
        if data_text.startswith("```json"):
            data_text = data_text[7:]
        if data_text.endswith("```"):
            data_text = data_text[:-3]
            
        data = json.loads(data_text.strip())
        modules = [EducationModule(**mod) for mod in data]
        return modules
    except Exception as e:
        print(f"Failed to generate modules: {e}")
        # Return a fallback module
        return [
            EducationModule(
                module_id="fallback-001",
                title="Handling Medical Supply Shortages",
                description="A quick guide on what to do during stock-outs.",
                target_audience=user_role,
                questions=[
                    SimulationQuestion(
                        id="q1",
                        question_text="What is the first step when a critical medicine stock-out is detected?",
                        options=["Ignore it", "Report to nodal officer and check nearby PHCs", "Ask patients to buy outside"],
                        correct_option_index=1,
                        explanation="Early reporting ensures cross-district distribution can be triggered."
                    )
                ]
            )
        ]
