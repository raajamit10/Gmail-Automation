from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Message
from app.schemas import MessageCreate, MessageOut, DraftApprove
from app.services.background import process_message_task
from app.services.gmail_ingest import fetch_and_store_gmail_messages


router = APIRouter(
    prefix="/messages",
    tags=["messages"],
)


@router.post("/ingest", response_model=MessageOut)
def ingest_message(
    payload: MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Manually add a message.

    AI processing runs in the background so the endpoint
    returns immediately.
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

    background_tasks.add_task(
        process_message_task,
        message.id,
    )

    return message


@router.get("", response_model=list[MessageOut])
def list_messages(
    since_id: int = 0,
    db: Session = Depends(get_db),
):
    """
    Return messages ordered by newest first.
    """

    return (
        db.query(Message)
        .order_by(Message.received_at.desc())
        .all()
    )


@router.get("/{message_id}", response_model=MessageOut)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a single message by ID.
    """

    message = (
        db.query(Message)
        .filter(Message.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    return message


@router.post(
    "/{message_id}/approve-draft",
    response_model=MessageOut,
)
def approve_draft(
    message_id: int,
    payload: DraftApprove,
    db: Session = Depends(get_db),
):
    """
    User edits/approves the AI draft reply.
    Sending the reply is a separate integration step.
    """

    message = (
        db.query(Message)
        .filter(Message.id == message_id)
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    message.draft_reply = payload.draft_reply
    message.draft_approved = True

    db.commit()
    db.refresh(message)

    return message


@router.post("/process-pending")
def process_pending_messages(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Process all messages that have not been processed yet.

    Useful for messages that were created before Gemini
    AI processing was working.
    """

    pending_messages = (
        db.query(Message)
        .filter(Message.processed == False)
        .all()
    )

    if not pending_messages:
        return {
            "message": "No pending messages.",
            "pending": 0,
        }

    for message in pending_messages:
        background_tasks.add_task(
            process_message_task,
            message.id,
        )

    return {
        "message": "Pending messages queued for processing.",
        "pending": len(pending_messages),
        "message_ids": [
            message.id
            for message in pending_messages
        ],
    }


@router.post("/sync-gmail")
def sync_gmail(
    background_tasks: BackgroundTasks,
):
    """
    Fetch new Gmail messages, save them to the database,
    then process newly imported messages with Gemini
    in the background.
    """

    result = fetch_and_store_gmail_messages(
        max_results=10
    )

    for message_id in result.get("message_ids", []):
        background_tasks.add_task(
            process_message_task,
            message_id,
        )

    return result