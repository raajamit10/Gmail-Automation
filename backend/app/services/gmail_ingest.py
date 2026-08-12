from app.database import SessionLocal
from app.models import Message
from app.services.gmail_service import list_messages, get_message


def get_header(headers, name):
    for header in headers:
        if header["name"].lower() == name.lower():
            return header["value"]

    return None


def fetch_and_store_gmail_messages(max_results=10):
    db = SessionLocal()

    try:
        gmail_messages = list_messages(max_results=max_results)

        added = []

        for item in gmail_messages:
            gmail_id = item["id"]

            # Prevent duplicate Gmail messages
            existing = (
                db.query(Message)
                .filter(Message.external_id == gmail_id)
                .first()
            )

            if existing:
                continue

            # Fetch full Gmail message
            email = get_message(gmail_id)

            headers = email.get("payload", {}).get("headers", [])

            sender = get_header(headers, "From")
            subject = get_header(headers, "Subject")

            # For now use Gmail snippet
            body = email.get("snippet", "")

            message = Message(
                source="gmail",
                external_id=gmail_id,
                sender=sender,
                subject=subject,
                body=body,
            )

            db.add(message)
            db.commit()
            db.refresh(message)

            added.append(message.id)

        return {
            "fetched": len(gmail_messages),
            "added": len(added),
            "message_ids": added,
        }

    except Exception as e:
        db.rollback()

        print("=" * 60)
        print("GMAIL SYNC ERROR")
        print(str(e))
        print("=" * 60)

        raise

    finally:
        db.close()