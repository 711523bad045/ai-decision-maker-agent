from fastapi import APIRouter
from models.decision_model import DecisionRequest
from services.decision_service import analyze_decision

router = APIRouter()

@router.post("/decision")
async def make_decision(data: DecisionRequest):
    result = analyze_decision(data.question)
    return result