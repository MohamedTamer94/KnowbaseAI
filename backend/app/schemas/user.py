from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    created_at: datetime
    name: str

    model_config = {
        "from_attributes": True  # instead of orm_mode
    }

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"