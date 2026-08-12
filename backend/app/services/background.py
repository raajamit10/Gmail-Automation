from datetime import datetime

from app.database import SessionLocal
from app.models import Message, Task, MessageCategory
from app.services.ai_service import process_message


def is_automated_sender(sender: str) -> bool:
    sender = (sender or "").lower()

    automated_patterns = [
        "noreply@",
        "no-reply@",
        "donotreply@",
        "do-not-reply@",
        "mailer-daemon@",
        "notifications@",
        "notification@",
        "newsletter@",
        "updates@",
    ]

    return any(
        pattern in sender
        for pattern in automated_patterns
    )


def process_message_task(message_id: int):
    """
    Process a message using Gemini AI.

    Automated/no-reply emails are marked as processed
    without generating a reply.
    """

    db = SessionLocal()

    try:
        message = (
            db.query(Message)
            .filter(Message.id == message_id)
            .first()
        )

        if not message:
            print(
                f"[background] Message {message_id} not found"
            )
            return

        automated = is_automated_sender(message.sender)

        # ==================================================
        # AUTOMATED / NO-REPLY EMAIL
        # ==================================================

        if automated:
            print(
                f"[background] Automated email detected: "
                f"{message.sender}"
            )

            message.processed = True
            message.category = MessageCategory.FYI
            message.draft_reply = None
            message.draft_approved = False

            # Don't leave the UI in "AI processing..."
            if not message.summary:
                message.summary = (
                    "Automated email from "
                    f"{message.sender}. "
                    "No reply is required."
                )

            db.commit()

            print(
                f"[background] Automated message "
                f"{message_id} marked as processed"
            )

            return

        # ==================================================
        # NORMAL EMAIL → GEMINI
        # ==================================================

        print(
            f"[background] Processing message "
            f"{message_id} with Gemini..."
        )

        result = process_message(
            message.sender,
            message.subject,
            message.body,
        )

        print("[background] Gemini result:")
        print(result)

        # ==================================================
        # CATEGORY
        # ==================================================

        category = result.get("category", "fyi")

        try:
            message.category = MessageCategory(category)
        except (ValueError, TypeError):
            message.category = MessageCategory.FYI

        # ==================================================
        # SUMMARY
        # ==================================================

        message.summary = result.get("summary")

        # ==================================================
        # DRAFT REPLY
        # ==================================================

        if (
            result.get("needs_reply")
            and result.get("draft_reply")
        ):
            message.draft_reply = result["draft_reply"]
            message.draft_approved = False

        else:
            message.draft_reply = None
            message.draft_approved = False

        # ==================================================
        # ACTION ITEM / TASK
        # ==================================================

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

            task_title = (
                action.get("title")
                or (
                    f"Follow up: "
                    f"{message.subject or message.sender}"
                )
            )

            # Prevent duplicate tasks
            existing_task = (
                db.query(Task)
                .filter(
                    Task.message_id == message.id
                )
                .first()
            )

            if not existing_task:
                task = Task(
                    message_id=message.id,
                    title=task_title,
                    description=message.summary,
                    due_date=due_date,
                )

                db.add(task)

                print(
                    f"[background] Created task: "
                    f"{task_title}"
                )

        # ==================================================
        # MARK PROCESSED
        # ==================================================

        message.processed = True

        db.commit()

        print(
            f"[background] Message {message_id} "
            "processed successfully"
        )

    except Exception as e:
        db.rollback()

        print(
            f"[background] Error processing "
            f"message {message_id}: {e}"
        )

    finally:
        db.close()