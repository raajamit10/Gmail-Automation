from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models import MessageCategory


class MessageCreate(BaseModel):
    source: str = "manual"
    sender: str
    subject: Optional[str] = None
    body: str


class MessageOut(BaseModel):
    id: int
    source: str
    sender: str
    subject: Optional[str]
    body: str
    received_at: datetime
    category: MessageCategory
    summary: Optional[str]
    processed: bool
    draft_reply: Optional[str]
    draft_approved: bool

    class Config:
        from_attributes = True


class TaskOut(BaseModel):
    id: int
    message_id: Optional[int]
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class DraftApprove(BaseModel):
    draft_reply: str
