import json
import os
import glob
from app.core.config import get_settings
from agno.agent import Agent
from agno.models.google import Gemini

settings = get_settings()

def load_dataset_context() -> str:
    dataset_dir = r"d:\Users\Desktop\codeforcom\dataset"
    if not os.path.exists(dataset_dir):
        return "No dataset directory found."
    
    csv_files = glob.glob(os.path.join(dataset_dir, "*.csv"))
    context = ""
    for file in csv_files:
        try:
            with open(file, "r", encoding="utf-8") as f:
                content = f.read()
                filename = os.path.basename(file)
                context += f"\n--- Dataset: {filename} ---\n{content[:5000]}...\n" # Truncate to avoid context limit
        except Exception as e:
            context += f"\nError reading {file}: {e}\n"
    
    return context

def check_inventory_status() -> dict:
    gemini = Gemini(id="gemini-3.1-flash-lite", api_key=settings.GEMINI_API_KEY)
    dataset_context = load_dataset_context()

    inventory_agent = Agent(
        name="Inventory Analyzer Agent",
        role="Analyze current dataset context to determine inventory status and critical stock-outs.",
        model=gemini,
        instructions=[
            "AVAILABLE DATASETS:",
            dataset_context,
            "",
            "Your tasks:",
            "1. Review the dataset to identify current stock levels across all districts.",
            "2. Identify any items that are at 'Critical' or 'Low' status.",
            "3. Count the total number of critical stockouts and impacted districts.",
            "4. Output the result strictly in JSON format matching the schema.",
            "",
            "OUTPUT SCHEMA:",
            """
            {
              "status": "success",
              "critical_stockouts": 0,
              "districts_impacted": 0,
              "data": [
                {
                  "district": "String",
                  "item": "String",
                  "status": "String",
                  "stock_left": 0
                }
              ]
            }
            """
        ],
        markdown=False
    )
    
    try:
        response = inventory_agent.run("Analyze inventory status.")
        data = json.loads(response.content)
        return data
    except Exception as e:
        print(f"Inventory Agent Error: {e}")
        # Fallback
        return {
            "status": "success",
            "critical_stockouts": 0,
            "districts_impacted": 0,
            "data": []
        }
