from datetime import datetime

from app.database import SessionLocal
from app.models import Message, Task, MessageCategory
from app.services.ai_service import process_message


def process_message_task(message_id: int):
    """
    Process a message using a fresh database session.
    """

    db = SessionLocal()

    try:
        message = (
            db.query(Message)
            .filter(Message.id == message_id)
            .first()
        )

        if not message:
            print(f"[background] Message {message_id} not found")
            return

        print(f"[background] Processing message {message_id}...")

        result = process_message(
            message.sender,
            message.subject,
            message.body,
        )

        category = result.get("category", "fyi")

        try:
            message.category = MessageCategory(category)
        except ValueError:
            message.category = MessageCategory.FYI

        message.summary = result.get("summary")
        message.processed = True

        if result.get("needs_reply") and result.get("draft_reply"):
            message.draft_reply = result["draft_reply"]

        action = result.get("action_item") or {}

        if action.get("has_action"):
            due_date = None

            if action.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(
                        action["due_date"]
                    )
                except (ValueError, TypeError):
                    due_date = None

            task = Task(
                message_id=message.id,
                title=(
                    action.get("title")
                    or f"Follow up: {message.subject or message.sender}"
                ),
                description=message.summary,
                due_date=due_date,
            )

            db.add(task)

        db.commit()

        print(f"[background] Message {message_id} processed successfully")

    except Exception as e:
        db.rollback()
        print(f"[background] Error processing message {message_id}: {e}")

    finally:
        db.close()