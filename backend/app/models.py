import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class MessageCategory(str, enum.Enum):
    URGENT = "urgent"
    ACTION_NEEDED = "action_needed"
    FYI = "fyi"
    SPAM = "spam"
    UNCLASSIFIED = "unclassified"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, default="gmail")  # gmail | slack | manual
    external_id = Column(String, unique=True, index=True, nullable=True)
    sender = Column(String)
    subject = Column(String, nullable=True)
    body = Column(Text)
    received_at = Column(DateTime, default=datetime.utcnow)

    category = Column(Enum(MessageCategory), default=MessageCategory.UNCLASSIFIED)
    summary = Column(Text, nullable=True)
    processed = Column(Boolean, default=False)

    draft_reply = Column(Text, nullable=True)
    draft_approved = Column(Boolean, default=False)

    tasks = relationship("Task", back_populates="message")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    message = relationship("Message", back_populates="tasks")
