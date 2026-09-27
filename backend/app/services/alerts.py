import json
from app.core.config import get_settings
from agno.agent import Agent
from agno.models.google import Gemini

settings = get_settings()

def generate_alerts(region: str) -> dict:
    gemini = Gemini(id="gemini-3.1-flash-lite", api_key=settings.GEMINI_API_KEY)

    alert_agent = Agent(
        name="Alert Generator Agent",
        role="Generate early warning alerts for impending shortages based on region context.",
        model=gemini,
        instructions=[
            f"Target Region: {region}",
            "Your tasks:",
            "1. Generate 3 plausible predictive alerts for health resource shortages or disease outbreaks in this region.",
            "2. Format the output strictly as JSON matching the schema.",
            "",
            "OUTPUT SCHEMA:",
            """
            {
              "status": "success",
              "alerts_generated": 3,
              "message": "String describing the generation",
              "alerts": [
                {
                  "type": "String",
                  "severity": "High/Medium/Low",
                  "description": "String"
                }
              ]
            }
            """
        ],
        markdown=False
    )
    
    try:
        response = alert_agent.run(f"Generate alerts for {region}.")
        data = json.loads(response.content)
        return data
    except Exception as e:
        print(f"Alert Agent Error: {e}")
        return {
            "status": "success",
            "alerts_generated": 1,
            "message": "Failed to parse agent response or rate limit hit.",
            "alerts": [{"type": "System", "severity": "Low", "description": "Default fallback alert"}]
        }
