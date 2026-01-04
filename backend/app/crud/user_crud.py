from typing import Any

from sqlalchemy.orm import Session
from app.models.user import User
import bcrypt

s = bcrypt.gensalt()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, email: str, password: str, name: str) -> User:
    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), s).decode("utf-8")
    db_user = User(email=email, password_hash=hashed_password, name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return None
    return user