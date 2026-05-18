from pydantic import BaseModel
from typing import Optional

class DecisionRequest(BaseModel):
    question: str
    category: Optional[str] = "General Strategy"
    urgency: Optional[str] = "Normal"
    mode: Optional[str] = "ceo"

class VisionRequest(BaseModel):
    image: Optional[str] = None
    question: str
    mode: Optional[str] = "jarvis"