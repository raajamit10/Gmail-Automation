from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Message, Task, MessageCategory
from app.services.ai_service import process_message


def process_message_task(message_id: int, db: Session):
    try:
        message = db.query(Message).filter(Message.id == message_id).first()

        if not message:
            return

        result = process_message(
            message.sender,
            message.subject,
            message.body,
        )

        message.category = MessageCategory(result.get("category", "fyi"))
        message.summary = result.get("summary")
        message.processed = True

        if result.get("needs_reply") and result.get("draft_reply"):
            message.draft_reply = result["draft_reply"]

        action = result.get("action_item") or {}

        if action.get("has_action"):
            due_date = None

            if action.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(action["due_date"])
                except ValueError:
                    pass

            task = Task(
                message_id=message.id,
                title=action.get("title") or f"Follow up: {message.subject or message.sender}",
                description=message.summary,
                due_date=due_date,
            )

            db.add(task)

        db.commit()

    except Exception as e:
        print("Background task failed:", e)
        db.rollback()

    finally:
        db.close()