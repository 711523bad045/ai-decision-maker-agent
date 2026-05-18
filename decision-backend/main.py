from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.decision import router as decision_router

app = FastAPI(title="DecisionOS AI Backend", version="1.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decision_router)

@app.get("/")
def home():
    return {"message": "DecisionOS Backend is live and ready to orchestrate AI agents! 🚀"}