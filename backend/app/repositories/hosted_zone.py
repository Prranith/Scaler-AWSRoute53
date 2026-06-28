"""Hosted Zone repository with search and user-scoped queries."""

from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
from app.models.hosted_zone import HostedZone
from app.repositories.base import BaseRepository


class HostedZoneRepository(BaseRepository[HostedZone]):
    def __init__(self, db: Session):
        super().__init__(HostedZone, db)

    def list_for_user(
        self,
        user_id: str,
        *,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
    ) -> tuple[list[HostedZone], int]:
        stmt = select(HostedZone).where(HostedZone.user_id == user_id)
        if search:
            stmt = stmt.where(HostedZone.name.ilike(f"%{search}%"))
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar_one()
        items = self.db.execute(
            stmt.order_by(HostedZone.created_at.desc()).offset(skip).limit(limit)
        ).scalars().all()
        return list(items), total

    def get_by_id_and_user(self, zone_id: str, user_id: str) -> HostedZone | None:
        return self.db.execute(
            select(HostedZone).where(
                HostedZone.id == zone_id, HostedZone.user_id == user_id
            )
        ).scalar_one_or_none()

    def exists_for_user(self, name: str, user_id: str) -> bool:
        return self.db.execute(
            select(func.count()).where(
                HostedZone.name == name, HostedZone.user_id == user_id
            )
        ).scalar_one() > 0

    def increment_record_count(self, zone_id: str, delta: int = 1) -> None:
        zone = self.db.get(HostedZone, zone_id)
        if zone:
            zone.record_count = max(0, zone.record_count + delta)
            self.db.flush()
