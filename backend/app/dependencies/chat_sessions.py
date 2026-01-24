from sqlalchemy.orm import Session
from app.models.chat import ChatSession

def get_or_create_session(db: Session, tenant_id: str, user_id: str | None, session_id: int | None):
    if session_id:
        session = db.query(ChatSession).filter_by(id=session_id).first()
        if session:
            return session

    session = ChatSession(
        tenant_id=tenant_id,
        user_id=user_id
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session_by_id(db: Session, session_id: int):
    return db.query(ChatSession).filter_by(id=session_id).first()