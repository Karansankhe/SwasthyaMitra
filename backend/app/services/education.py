import json
from typing import List
from app.models.education import EducationModule, SimulationQuestion
from app.core.config import get_settings
from agno.agent import Agent
from agno.models.google import Gemini

settings = get_settings()

def generate_education_modules(query: str, user_role: str) -> List[EducationModule]:
    gemini = Gemini(id="gemini-3.1-flash-lite", api_key=settings.GEMINI_API_KEY)
    
    education_agent = Agent(
        name="Education Module Generator",
        role="Generate educational modules and interactive simulations for health workers.",
        model=gemini,
        instructions=[
            f"Target Audience/User Role: {user_role}",
            f"Topic: {query}",
            "",
            "Your tasks:",
            "1. Generate an educational module for the specified role based on the topic.",
            "2. Include 2 interactive simulation questions to test knowledge.",
            "3. Output strictly valid JSON matching this schema, without markdown blocks like ```json:",
            """
            [
              {
                "module_id": "string",
                "title": "string",
                "description": "string",
                "target_audience": "string",
                "questions": [
                  {
                    "id": "string",
                    "question_text": "string",
                    "options": ["string"],
                    "correct_option_index": 0,
                    "explanation": "string"
                  }
                ]
              }
            ]
            """
        ],
        markdown=False
    )
    
    try:
        response = education_agent.run("Generate module.")
        data_text = response.content.strip()
        if data_text.startswith("```json"):
            data_text = data_text[7:]
        if data_text.endswith("```"):
            data_text = data_text[:-3]
            
        data = json.loads(data_text.strip())
        modules = [EducationModule(**mod) for mod in data]
        return modules
    except Exception as e:
        print(f"Failed to generate modules: {e}")
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
