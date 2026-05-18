from services.ai_service import get_ai_decision
import json

def analyze_decision(question: str):

    ai_response = get_ai_decision(question)

    try:
        data = json.loads(ai_response)

        # Add extra system-generated values
        data["decision_score"] = {
            "yes": data["confidence"],
            "no": 100 - data["confidence"]
        }

        return data

    except Exception as e:
        return {
            "error": "Failed to parse AI response",
            "raw": ai_response
        }
