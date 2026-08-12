from pathlib import Path
import base64

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build


BASE_DIR = Path(__file__).resolve().parents[2]

CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]


def get_gmail_service():
    creds = None

    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(
            str(TOKEN_FILE),
            SCOPES,
        )

    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())

    if not creds or not creds.valid:
        flow = InstalledAppFlow.from_client_secrets_file(
            str(CREDENTIALS_FILE),
            SCOPES,
        )

        creds = flow.run_local_server(port=0)

        TOKEN_FILE.write_text(
            creds.to_json(),
            encoding="utf-8",
        )

    return build(
        "gmail",
        "v1",
        credentials=creds,
    )


def list_messages(max_results=10):
    service = get_gmail_service()

    result = (
        service.users()
        .messages()
        .list(
            userId="me",
            maxResults=max_results,
        )
        .execute()
    )

    return result.get("messages", [])


def get_message(message_id: str):
    service = get_gmail_service()

    return (
        service.users()
        .messages()
        .get(
            userId="me",
            id=message_id,
            format="full",
        )
        .execute()
    )


def _decode_body(data: str) -> str:
    """Decode Gmail's base64url encoded body."""
    if not data:
        return ""

    decoded = base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))

    return decoded.decode("utf-8", errors="replace")


def extract_message_data(message: dict) -> dict:
    """
    Convert Gmail API response into the format
    our Message model expects.
    """

    payload = message.get("payload", {})
    headers = payload.get("headers", [])

    sender = ""
    subject = ""

    for header in headers:
        name = header.get("name", "").lower()

        if name == "from":
            sender = header.get("value", "")

        elif name == "subject":
            subject = header.get("value", "")

    body = ""

    # Simple email
    if payload.get("body", {}).get("data"):
        body = _decode_body(
            payload["body"]["data"]
        )

    # Multipart email
    else:
        parts = payload.get("parts", [])

        for part in parts:
            mime_type = part.get("mimeType", "")
            data = part.get("body", {}).get("data")

            if data and mime_type == "text/plain":
                body = _decode_body(data)
                break

        # If no text/plain was found, try nested parts
        if not body:
            for part in parts:
                for nested in part.get("parts", []):
                    mime_type = nested.get("mimeType", "")
                    data = nested.get("body", {}).get("data")

                    if data and mime_type == "text/plain":
                        body = _decode_body(data)
                        break

                if body:
                    break

    return {
        "external_id": message.get("id"),
        "sender": sender,
        "subject": subject,
        "body": body,
        "thread_id": message.get("threadId"),
    }