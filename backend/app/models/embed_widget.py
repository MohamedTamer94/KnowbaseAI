import uuid
from sqlalchemy import (
    Column,
    Text,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from app.db import Base


class EmbedWidget(Base):
    __tablename__ = "embed_widgets"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    tenant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
    )

    public_token = Column(
        Text,
        unique=True,
        nullable=True,
    )

    allowed_domains = Column(
        ARRAY(Text),
        nullable=True,
    )

    name = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
