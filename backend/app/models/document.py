import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db import Base
import enum

class DocumentType(str, enum.Enum):
    pdf = "pdf"
    docx = "docx"
    pptx = "pptx"
    website = "website"
    other = "other"

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String, nullable=True)   # optional for website
    filepath = Column(String, nullable=True)   # optional for website
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(DocumentType), nullable=False, default=DocumentType.other)
    source = Column(String, nullable=True)  # For websites: the URL
    status = Column(String, default="uploaded")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
