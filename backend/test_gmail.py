from app.services.gmail_service import get_gmail_service


service = get_gmail_service()

result = service.users().messages().list(
    userId="me",
    maxResults=10,
).execute()

messages = result.get("messages", [])

print(f"Found {len(messages)} Gmail messages.")

for message in messages:
    print(message["id"])