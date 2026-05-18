from pydantic import BaseModel

class DecisionRequest(BaseModel):
    question: str