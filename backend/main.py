from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import uuid
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

# Mock In-memory Database
users_db = {} # email -> user_data
feedback_history = {} # user_id -> feedback_list

class UserSignals(BaseModel):
    timeOnPage: int
    deviceType: str
    pagesVisited: int
    scrollDepth: int
    firstVisit: bool

class ClassifyUserRequest(BaseModel):
    signals: UserSignals
    user_id: Optional[str] = None

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SubmitFeedbackRequest(BaseModel):
    user_id: str
    user_type: str
    sentiment: str
    fields_filled: int
    responses: Dict[str, str]
    time_spent: int

@app.post("/api/signup")
async def signup(request: SignupRequest):
    if request.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    user_data = {
        "user_id": user_id,
        "email": request.email,
        "password": request.password,
        "full_name": request.full_name,
        "visit_count": 1
    }
    users_db[request.email] = user_data
    feedback_history[user_id] = []
    
    return {"status": "success", "user": user_data}

@app.post("/api/login")
async def login(request: LoginRequest):
    user = users_db.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user["visit_count"] += 1
    return {"status": "success", "user": user}

@app.post("/api/classify-user")
async def classify_user(request: ClassifyUserRequest):
    from ml_logic import classify_user_signals
    
    # Simple personalization: Adjust fields based on history if user_id is provided
    history = feedback_history.get(request.user_id, []) if request.user_id else []
    
    config = classify_user_signals(request.signals)
    
    # Learning logic: if user has submitted feedback before or is a frequent visitor, ask different questions
    user_record = None
    if request.user_id:
        # Find user by id in users_db (values)
        user_record = next((u for u in users_db.values() if u["user_id"] == request.user_id), None)

    if len(history) > 0 or (user_record and user_record.get("visit_count", 0) > 1):
        config["form_version"] = "advanced"
        config["fields"] = ["performance_rating", "missing_features", "long_term_goals", "referral_likelihood"]
        config["max_fields"] = 4
    
    return config

@app.post("/api/submit-feedback")
async def submit_feedback(request: SubmitFeedbackRequest):
    from ml_logic import score_feedback
    from mail_service import send_feedback_email
    
    score = score_feedback(request)
    
    # Save to history
    if request.user_id in feedback_history:
        feedback_history[request.user_id].append({
            "responses": request.responses,
            "score": score,
            "sentiment": request.sentiment
        })
    
    # Send email notification
    await send_feedback_email(request, score)
    
    return {"status": "success", "score": score}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
