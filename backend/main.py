from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Intelligent Adaptive Feedback System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserSignals(BaseModel):
    timeOnPage: int
    deviceType: str
    pagesVisited: int
    scrollDepth: int
    firstVisit: bool

class ClassifyUserRequest(BaseModel):
    signals: UserSignals

class SubmitFeedbackRequest(BaseModel):
    user_type: str
    sentiment: str
    fields_filled: int
    responses: Dict[str, str]
    time_spent: int

@app.post("/api/classify-user")
async def classify_user(request: ClassifyUserRequest):
    # Logic will be implemented in ml_logic.py
    # Placeholder for now
    from ml_logic import classify_user_signals
    return classify_user_signals(request.signals)

@app.post("/api/submit-feedback")
async def submit_feedback(request: SubmitFeedbackRequest):
    # Logic will be implemented in ml_logic.py
    from ml_logic import score_feedback
    from mail_service import send_feedback_email
    
    score = score_feedback(request)
    
    # Send email notification
    await send_feedback_email(request, score)
    
    return {"status": "success", "score": score}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
