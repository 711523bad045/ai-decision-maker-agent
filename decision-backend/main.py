from fastapi import FastAPI
from routes.decision import router as decision_router

app = FastAPI()

app.include_router(decision_router)

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}