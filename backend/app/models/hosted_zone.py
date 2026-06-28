"""SQLAlchemy ORM model for Hosted Zones."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey, event
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class HostedZone(Base):
    __tablename__ = "hosted_zones"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: f"Z{uuid.uuid4().hex[:12].upper()}"
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String, nullable=False, default="Public")  # Public | Private
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    record_count: Mapped[int] = mapped_column(Integer, default=2)  # SOA + NS by default
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="hosted_zones")
    records = relationship("DNSRecord", back_populates="zone", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<HostedZone id={self.id!r} name={self.name!r}>"
