from services.ai_service import get_ai_decision, get_vision_decision
import json

def analyze_decision(question: str, category: str = "General Strategy", urgency: str = "Normal", mode: str = "ceo"):
    ai_response = get_ai_decision(question, category, urgency, mode)
    try:
        return json.loads(ai_response)
    except Exception as e:
        return {
            "recommendation": "SYSTEM SYNTHESIS ERROR",
            "type": "caution",
            "confidence": 75,
            "risk_level": "Medium",
            "career_upside": 50,
            "financial_risk": 50,
            "emotional_risk": 50,
            "regret_probability": 50,
            "summary": f"Could not parse AI response: {str(e)}",
            "pros": ["Data pipeline active"],
            "cons": ["Parsing format mismatch"],
            "parallel_universe": [
                {
                    "type": "Safe Path",
                    "title": "Diagnostic Mode",
                    "emotional_outcome": "Calm checking",
                    "career_outcome": "Maintenance",
                    "financial_outcome": "Stable",
                    "story": "System undergoes self-healing routines."
                }
            ],
            "future_self_message": "I'm you, 5 years from now. Diagnostics and error handling are part of the journey.",
            "bias_detection": [
                { "bias": "Syntax Bias", "description": "JSON parsing anomalies encountered during generation.", "severity": "Medium" }
            ],
            "stress_test": [
                "Can the payload be re-transmitted?",
                "Is the network latency optimal?"
            ],
            "do_nothing_path": {
                "result": "Pending retry.",
                "future": "System remains in standby."
            },
            "battle_mode": {
                "agent_yes": "Agent Alpha: Retry request.",
                "agent_no": "Agent Beta: Check logs.",
                "judge_verdict": "Judge: Inspect payload."
            },
            "agent_logs": ["[Context Agent] Error in payload formatting..."]
        }


def analyze_vision(question: str, image: str = None, mode: str = "jarvis"):
    ai_response = get_vision_decision(question, image, mode)
    try:
        return json.loads(ai_response)
    except Exception as e:
        return {
            "product_name": "Unknown Visual Object",
            "category": "Diagnostics / Telemetry",
            "price_estimate": "$0 - $0",
            "confidence": 60,
            "recommendation": "SYSTEM TELEMETRY FAULT",
            "type": "caution",
            "summary": f"Could not parse vision telemetry: {str(e)}",
            "advantages": ["Webcam stream connected"],
            "disadvantages": ["Frame recognition latency"],
            "risk_scores": {
                "value_score": 50,
                "regret_probability": 50,
                "financial_risk": 50,
                "usefulness_score": 50
            },
            "internet_reasoning": {
                "sentiment": "Diagnostic mode active",
                "alternatives": "Retry frame capture",
                "market_trend": "Offline telemetry"
            },
            "voice_script": "I encountered a visual telemetry fault. Please hold the product steady in the camera frame and speak your query again.",
            "agent_logs": [
                "[Vision Agent] Error parsing frame buffer..."
            ]
        }