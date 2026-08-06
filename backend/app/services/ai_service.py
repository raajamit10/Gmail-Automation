import json
from typing import Optional

from google import genai
from google.genai import types

from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

MODEL = "gemini-flash-latest"

SYSTEM_PROMPT = """
You are an assistant that triages incoming messages (emails/chat).

Return ONLY a valid JSON object.

Do not use markdown.
Do not wrap the JSON in ``` blocks.
Do not explain anything.

{
  "category": "urgent" | "action_needed" | "fyi" | "spam",
  "summary": "one sentence summary",
  "action_item": {
      "has_action": true,
      "title": "task title",
      "due_date": null
  },
  "needs_reply": true,
  "draft_reply": "reply"
}
"""


def fallback_response(summary="AI service unavailable."):
    return {
        "category": "fyi",
        "summary": summary,
        "action_item": {
            "has_action": False,
            "title": None,
            "due_date": None,
        },
        "needs_reply": False,
        "draft_reply": None,
    }


def process_message(sender: str, subject: Optional[str], body: str):

    prompt = f"""
{SYSTEM_PROMPT}

From: {sender}
Subject: {subject or "(no subject)"}

{body}
"""

    # Call Gemini
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        )
    except Exception as e:
        print(f"\nGemini API Error:\n{e}\n")
        return fallback_response()

    # Debug output
    print("=" * 60)
    print("RAW GEMINI RESPONSE:")
    print(response.text)
    print("=" * 60)

    # Extract response text
    try:
        text = response.text.strip()
    except Exception as e:
        print(f"Gemini Response Error: {e}")
        return fallback_response("Received an empty response from AI.")

    # Remove markdown if present
    text = (
        text.replace("```json", "")
        .replace("```", "")
        .strip()
    )

    # Parse JSON
    try:
        return json.loads(text)

    except json.JSONDecodeError as e:
        print("\nJSON Decode Error:")
        print(e)
        print("\nReturned text:")
        print(text)

        return fallback_response("Could not parse AI response.")


def generate_digest(messages: list[dict]):

    if not messages:
        return "No new messages."

    content = "\n".join(
        f"- [{m['category']}] {m['sender']}: {m['summary']}"
        for m in messages
    )

    prompt = f"""
Today's inbox:

{content}

Write a friendly morning digest in 3-5 sentences.
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        return response.text

    except Exception as e:
        print(f"Digest Error: {e}")
        return "Unable to generate today's digest."