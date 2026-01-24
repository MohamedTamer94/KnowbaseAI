import os
from datetime import timedelta, datetime
from typing import Optional
from jose import jwt
from jose.exceptions import JWTError
from app.config import JWT_SECRET_KEY

ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = JWT_SECRET_KEY
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expires = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expires})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_access_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None