from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Message
from app.services.ai_service import generate_digest

router = APIRouter(prefix="/digest", tags=["digest"])


@router.get("")
def get_digest(hours: int = 24, db: Session = Depends(get_db)):
    """Generate a digest of processed messages from the last N hours."""
    since = datetime.utcnow() - timedelta(hours=hours)
    messages = (
        db.query(Message)
        .filter(Message.processed == True, Message.received_at >= since)  # noqa: E712
        .all()
    )

    payload = [
        {
            "sender": m.sender,
            "subject": m.subject,
            "summary": m.summary or "",
            "category": m.category.value,
        }
        for m in messages
    ]

    text = generate_digest(payload)
    return {"digest": text, "message_count": len(payload)}
