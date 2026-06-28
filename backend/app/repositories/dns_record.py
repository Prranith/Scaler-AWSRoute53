"""DNS Record repository with zone-scoped queries and search."""

from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.models.dns_record import DNSRecord
from app.repositories.base import BaseRepository


class DNSRecordRepository(BaseRepository[DNSRecord]):
    def __init__(self, db: Session):
        super().__init__(DNSRecord, db)

    def list_for_zone(
        self,
        zone_id: str,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        record_type: str | None = None,
    ) -> tuple[list[DNSRecord], int]:
        conditions = [DNSRecord.zone_id == zone_id]
        if search:
            conditions.append(DNSRecord.name.ilike(f"%{search}%"))
        if record_type:
            conditions.append(DNSRecord.type == record_type.upper())

        stmt = select(DNSRecord).where(and_(*conditions))
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        items = self.db.execute(
            stmt.order_by(DNSRecord.name, DNSRecord.type).offset(skip).limit(limit)
        ).scalars().all()
        return list(items), total

    def get_by_id_and_zone(self, record_id: str, zone_id: str) -> DNSRecord | None:
        return self.db.execute(
            select(DNSRecord).where(
                DNSRecord.id == record_id, DNSRecord.zone_id == zone_id
            )
        ).scalar_one_or_none()

    def bulk_delete(self, record_ids: list[str], zone_id: str) -> int:
        """Delete multiple records and return count deleted."""
        records = self.db.execute(
            select(DNSRecord).where(
                DNSRecord.id.in_(record_ids), DNSRecord.zone_id == zone_id
            )
        ).scalars().all()
        count = len(records)
        for r in records:
            self.db.delete(r)
        self.db.flush()
        return count

    def count_for_zone(self, zone_id: str) -> int:
        return self.db.execute(
            select(func.count()).where(DNSRecord.zone_id == zone_id)
        ).scalar_one()

    def list_all_for_zone(self, zone_id: str) -> list[DNSRecord]:
        return self.db.execute(
            select(DNSRecord).where(DNSRecord.zone_id == zone_id)
        ).scalars().all()
