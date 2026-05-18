from typing import Dict, Any

def classify_user_signals(signals: Any) -> Dict[str, Any]:
    # Phase 1: User Type Classifier
    # Heuristic-based classification for demonstration
    user_type = "NEW_USER" if signals.firstVisit else "RETURNING_USER"
    mood = "NEUTRAL"
    abandonment_risk = "LOW"
    recommended_form = "SIMPLE"

    if signals.timeOnPage > 60 and signals.scrollDepth < 30:
        abandonment_risk = "HIGH"
        recommended_form = "MINIMAL"
    elif signals.pagesVisited > 3:
        mood = "INTERESTED"
        recommended_form = "DETAILED"

    return {
        "user_type": user_type,
        "mood": mood,
        "abandonment_risk": abandonment_risk,
        "recommended_form": recommended_form,
        "form_version": recommended_form.lower(),
        "fields": ["overall_rating", "what_did_you_like", "suggestions"],
        "max_fields": 3 if recommended_form == "SIMPLE" else 5
    }

def score_feedback(feedback_request: Any) -> float:
    # Phase 3: Quality Scorer
    # Simple quality score calculation
    
    score = 0.0
    
    # 1. Completion score
    score += (feedback_request.fields_filled / 3.0) * 0.4
    
    # 2. Detail score (length of responses)
    total_length = sum(len(v) for v in feedback_request.responses.values())
    if total_length > 50:
        score += 0.3
    elif total_length > 20:
        score += 0.15
        
    # 3. Sentiment weight
    if feedback_request.sentiment == "POSITIVE":
        score += 0.3
    elif feedback_request.sentiment == "NEGATIVE":
        score += 0.1 # We still value negative feedback if it's detailed
        
    return round(min(score, 1.0), 2)
