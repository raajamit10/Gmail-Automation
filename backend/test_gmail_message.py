from app.services.gmail_service import (
    list_messages,
    get_message,
    extract_message_data,
)


messages = list_messages(1)

if not messages:
    print("No Gmail messages found.")
    exit()

message_id = messages[0]["id"]

print("Gmail ID:")
print(message_id)

raw_message = get_message(message_id)

data = extract_message_data(raw_message)

print("\n========== EMAIL ==========")
print("Sender:", data["sender"])
print("Subject:", data["subject"])
print("Body:")
print(data["body"])
print("===========================")