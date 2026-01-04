from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

class CreateTenant(BaseModel):
    name: str

class Tenant(BaseModel):
    id: UUID
    name: str
    created_at: datetime