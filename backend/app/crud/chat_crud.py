from sqlalchemy.orm import Session
from app.models.chat import ChatMessage

def load_recent_messages(db: Session, session_id: int, limit: int = 6):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )

    # reverse to chronological
    return list(reversed(messages))

def load_all_messages(db: Session, session_id: int):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at)
        .all()
    )
    return messages
