from services.ai_service import get_ai_decision
import json

def analyze_decision(question: str):

    ai_response = get_ai_decision(question)

    try:
        return json.loads(ai_response)
    except:
        return {
            "recommendation": "ERROR",
            "confidence": 0,
            "risk": "Unknown",
            "reason": ai_response
        }