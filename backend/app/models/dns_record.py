"""SQLAlchemy ORM model for DNS Records."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_id: Mapped[str] = mapped_column(
        String, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String, nullable=False, index=True)  # A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    ttl: Mapped[int] = mapped_column(Integer, default=300)
    routing_policy: Mapped[str] = mapped_column(String, default="Simple")
    value: Mapped[str] = mapped_column(Text, nullable=False)  # JSON-encoded list of record values
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)   # MX, SRV
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)     # Weighted routing
    comment: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    zone = relationship("HostedZone", back_populates="records")

    def __repr__(self) -> str:
        return f"<DNSRecord id={self.id!r} name={self.name!r} type={self.type!r}>"
