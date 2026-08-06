# Smart Inbox & Task Automator

AI-powered assistant that triages incoming messages, auto-generates tasks from
action items, drafts replies, and gives you a live-updating dashboard.

## Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Claude API (`anthropic` SDK), APScheduler
- **Frontend**: React + Vite, TanStack Query (polling for "live" updates), Tailwind CSS

## Project structure
```
inbox-automator/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app + scheduler
│   │   ├── config.py          # env var loading
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # Message, Task tables
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── messages.py    # ingest, list, approve-draft
│   │   │   ├── tasks.py       # list, update, delete
│   │   │   └── digest.py      # AI-generated digest
│   │   └── services/
│   │       ├── ai_service.py     # Claude API calls
│   │       └── background.py     # runs after ingest, in the background
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── api/client.js
    │   └── components/
    │       ├── MessageList.jsx
    │       ├── TaskList.jsx
    │       └── IngestForm.jsx
    ├── package.json
    └── vite.config.js
```

## Setup

### 1. Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your ANTHROPIC_API_KEY (get one at console.anthropic.com)
uvicorn app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000`. Interactive API docs at `http://localhost:8000/docs`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

## Try it out
1. Open `http://localhost:5173`
2. Use the "Simulate an incoming message" form to submit a fake email
   (e.g. sender: `boss@company.com`, body: `"Can you send me the Q3 report by Friday?"`)
3. Watch it appear in the Inbox, get categorized, summarized, and — if there's
   an action item — automatically spawn a task in the Tasks panel.
4. Check `GET /digest` (via the docs UI or curl) to see an AI-written summary
   of everything processed so far.

## What's stubbed vs. real
- ✅ Real: AI classification/summarization/drafting via Claude API, task
  auto-creation, background processing, polling-based live updates.
- 🔧 Stubbed (intentionally, to keep week 1 scoped): actual Gmail/Slack OAuth
  ingestion — right now you feed messages in manually via the form or
  `POST /messages/ingest`. Wiring up Gmail is the natural "week 2" extension
  (see `google-auth` deps commented out in `requirements.txt`).
- 🔧 Stubbed: sending the approved draft reply for real — `approve-draft`
  saves it, but doesn't call Gmail's send API yet.

## Extending it later
- Swap manual ingestion for a Gmail API poller or webhook
- Add Slack OAuth + Events API for Slack ingestion
- Replace polling with WebSockets for true real-time updates
- Move background processing to Celery + Redis if you outgrow `BackgroundTasks`
- Add auth so multiple users can each have their own inbox
