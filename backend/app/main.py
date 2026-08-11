from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import messages, tasks, digest


scheduler = BackgroundScheduler()


def scheduled_digest_job():
    # Placeholder for the daily digest.
    # Later we can generate and store/send the digest here.
    print("[scheduler] Daily digest job would run here.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    scheduler.add_job(
        scheduled_digest_job,
        "cron",
        hour=7,
        minute=0,
    )

    scheduler.start()

    yield

    scheduler.shutdown()


app = FastAPI(
    title="Smart Inbox & Task Automator",
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(messages.router)
app.include_router(tasks.router)
app.include_router(digest.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "Smart Inbox & Task Automator",
    }