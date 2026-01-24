from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class CreateTenant(BaseModel):
    name: str

class Tenant(BaseModel):
    id: UUID
    name: str
    created_at: datetime

class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: str

    class Config:
        orm_mode = True

class UserInvite(BaseModel):
    email: str