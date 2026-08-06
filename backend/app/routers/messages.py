from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Message
from app.schemas import MessageCreate, MessageOut, DraftApprove
from app.services.background import process_message_task

router = APIRouter(prefix="/messages", tags=["messages"])


@router.post("/ingest", response_model=MessageOut)
def ingest_message(payload: MessageCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Manually add a message (stand-in for Gmail/Slack webhook until that's wired up).
    Kicks off AI processing in the background so this endpoint returns fast.
    """
    message = Message(
        source=payload.source,
        sender=payload.sender,
        subject=payload.subject,
        body=payload.body,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    background_tasks.add_task(process_message_task, message.id, db)

    return message


@router.get("", response_model=list[MessageOut])
def list_messages(since_id: int = 0, db: Session = Depends(get_db)):
    """
    Frontend polls this with since_id to get anything new/updated.
    Simple approach: just return everything with id > since_id,
    OR everything (frontend re-fetches all periodically) - keeping it simple here.
    """
    return db.query(Message).order_by(Message.received_at.desc()).all()


@router.get("/{message_id}", response_model=MessageOut)
def get_message(message_id: int, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message


@router.post("/{message_id}/approve-draft", response_model=MessageOut)
def approve_draft(message_id: int, payload: DraftApprove, db: Session = Depends(get_db)):
    """User edits/approves the AI draft reply. (Sending it is a separate integration step.)"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    message.draft_reply = payload.draft_reply
    message.draft_approved = True
    db.commit()
    db.refresh(message)
    return message
