## ✉️ MailMind

### AI-Powered Gmail Inbox Automator

MailMind is an AI-powered inbox automation project that connects Gmail with Google Gemini to understand incoming emails, summarize important information, identify action items, create tasks, and generate reply drafts when a response is actually needed.

The goal is simple:

> **Turn emails into useful actions instead of letting important messages get lost in an inbox.**

---

## ✨ Features

### 📩 Gmail Integration

Connects to a Gmail account using the Gmail API and Google OAuth 2.0 to fetch real emails.

### 🧠 AI Email Triage

Uses the Google Gemini API to analyze incoming messages and classify them into:

* 🔴 **Urgent**
* 🟡 **Action Needed**
* 🔵 **FYI**
* ⚪ **Spam**

### ✨ AI Summaries

Generates concise summaries so important information can be understood quickly without reading every email in full.

### ✅ Automatic Task Extraction

When an email contains an actionable request, MailMind extracts the action item and automatically creates a task.

### ✍️ AI Draft Replies

When a response is genuinely required, Gemini generates a suggested reply that can be reviewed, edited, and approved.

### 🤖 Automated Email Handling

MailMind identifies common automated/no-reply senders and avoids generating unnecessary replies for those messages.

### 🔎 Inbox Search & Filtering

Search messages by sender, subject, or summary and filter them by category.

### 📊 Dashboard

A React-based dashboard displays:

* Inbox messages
* AI classifications
* AI summaries
* Tasks
* Draft replies
* Gmail sync status
* Processing state

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* TanStack Query
* Axios

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* APScheduler

### AI

* Google Gemini API

### Integration

* Gmail API
* Google OAuth 2.0

---

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │      Gmail      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Gmail API     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   FastAPI       │
                    │    Backend      │
                    └────────┬────────┘
                             │
                    ┌────────┴─────────┐
                    ▼                  ▼
             ┌─────────────┐    ┌─────────────┐
             │   SQLite    │    │   Gemini    │
             │  Database   │    │     AI      │
             └─────────────┘    └──────┬──────┘
                                       │
                              ┌────────┴─────────┐
                              ▼                  ▼
                         ┌─────────┐       ┌──────────┐
                         │  Tasks  │       │  Drafts  │
                         └─────────┘       └──────────┘
                              │                  │
                              └────────┬─────────┘
                                       ▼
                              ┌─────────────────┐
                              │ React Dashboard │
                              └─────────────────┘
```

---

## 📂 Project Structure

```text
MailMind/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── messages.py
│   │   │   ├── tasks.py
│   │   │   └── digest.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── background.py
│   │   │   ├── gmail_service.py
│   │   │   └── gmail_ingest.py
│   │   │
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   ├── credentials.json
│   ├── token.json
│   ├── requirements.txt
│   └── test_gemini.py
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   │
│   │   ├── components/
│   │   │   ├── IngestForm.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── StatsCards.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/raajamit10/Gmail-Automation
cd YOUR_REPOSITORY
```

---

# Backend Setup

### 2. Create a virtual environment

```bash
cd backend
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

If the Gmail libraries are not already included:

```bash
pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

---

### 4. Configure environment variables

Create:

```text
backend/.env
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key
```

---

## 🔐 Gmail OAuth Setup

To use Gmail integration:

1. Create a Google Cloud project.
2. Enable the Gmail API.
3. Configure Google OAuth.
4. Create a **Desktop application** OAuth client.
5. Download the OAuth credentials.
6. Save them as:

```text
backend/credentials.json
```

7. Add your Google account as a test user if the OAuth app is in testing mode.

On first authentication, MailMind will create:

```text
backend/token.json
```

### ⚠️ Never commit these files

Add them to `.gitignore`:

```gitignore
credentials.json
token.json
.env
.env.local
```

---

## ▶️ Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

### 5. Install dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 How It Works

### Gmail Sync

Click:

```text
↻ Sync Gmail
```

MailMind:

```text
Gmail
 ↓
Gmail API
 ↓
New email detected
 ↓
Saved to database
 ↓
AI processing
```

---

### AI Processing

For normal emails:

```text
Email
 ↓
Gemini
 ↓
Category
 ↓
Summary
 ↓
Action detection
 ↓
Task creation
 ↓
Reply draft if required
```

For automated/no-reply messages:

```text
Automated Email
 ↓
Detected
 ↓
Marked as processed
 ↓
No unnecessary reply
```

---

## 📡 API Endpoints

### Messages

```text
POST /messages/ingest
```

Manually add a message.

```text
GET /messages
```

Retrieve messages.

```text
GET /messages/{message_id}
```

Retrieve a specific message.

```text
POST /messages/process-pending
```

Process previously unprocessed messages.

```text
POST /messages/sync-gmail
```

Fetch recent Gmail messages.

```text
POST /messages/{message_id}/approve-draft
```

Approve and save an AI-generated reply.

---

### Tasks

```text
GET /tasks
```

Retrieve tasks.

```text
PATCH /tasks/{task_id}
```

Update task status.

---

## 🧪 Example AI Workflow

### Incoming email

```text
From: manager@company.com
Subject: Project Deadline

Please prepare the final presentation and send
the updated report by tonight.
```

### MailMind output

```json
{
  "category": "action_needed",
  "summary": "The manager asked for the final presentation and updated report to be sent tonight.",
  "action_item": {
    "has_action": true,
    "title": "Prepare presentation and send updated report",
    "due_date": null
  },
  "needs_reply": true,
  "draft_reply": "Hi, I’ll prepare the presentation and send the updated report tonight."
}
```

---

## 🎯 Project Goals

MailMind was built to explore how AI can be integrated into a real application workflow rather than simply generating responses from prompts.

The project focuses on:

* AI-powered automation
* API integration
* Backend architecture
* OAuth authentication
* Background processing
* Database persistence
* Modern frontend development
* Human review before AI-generated replies are approved

---

## 🔮 Future Improvements

Potential future improvements include:

* Gmail reply sending
* Better email body and HTML parsing
* More advanced email prioritization
* Calendar integration
* Slack integration
* Smarter notification handling
* Improved AI memory/context
* Production deployment
* Multi-user authentication

---

## 👨‍💻 Built By

**Amit Raj**

B.Tech Computer Science & Engineering

Interested in:

**Software Development • AI • Automation • Full-Stack Development**

---

## 📌 Note

MailMind is currently a **learning project/prototype** built to explore AI-powered email automation and API-driven application development.

---

⭐ If you find the project interesting, feel free to explore the repository and share feedback.
