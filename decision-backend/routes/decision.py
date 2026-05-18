from fastapi import APIRouter
from models.decision_model import DecisionRequest, VisionRequest
from services.decision_service import analyze_decision, analyze_vision

router = APIRouter()

@router.post("/decision")
async def make_decision(data: DecisionRequest):
    result = analyze_decision(
        question=data.question,
        category=data.category,
        urgency=data.urgency,
        mode=data.mode
    )
    return result

@router.post("/vision")
async def make_vision(data: VisionRequest):
    result = analyze_vision(
        question=data.question,
        image=data.image,
        mode=data.mode
    )
    return result