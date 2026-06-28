"""DNS Record business logic service."""

import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.dns_record import DNSRecord
from app.repositories.dns_record import DNSRecordRepository
from app.repositories.hosted_zone import HostedZoneRepository
from app.schemas.dns_record import (
    DNSRecordCreate, DNSRecordUpdate, PaginatedRecords, DNSRecordResponse, BulkDeleteRequest
)


def _get_zone_or_404(db: Session, zone_id: str, user_id: str):
    repo = HostedZoneRepository(db)
    zone = repo.get_by_id_and_user(zone_id, user_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return zone


def list_records(
    db: Session,
    zone_id: str,
    user_id: str,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
    record_type: str | None = None,
) -> PaginatedRecords:
    _get_zone_or_404(db, zone_id, user_id)
    repo = DNSRecordRepository(db)
    skip = (page - 1) * size
    items, total = repo.list_for_zone(zone_id, skip=skip, limit=size, search=search, record_type=record_type)
    pages = (total + size - 1) // size
    return PaginatedRecords(
        items=[DNSRecordResponse.model_validate(r) for r in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


def create_record(db: Session, zone_id: str, user_id: str, data: DNSRecordCreate) -> DNSRecord:
    zone = _get_zone_or_404(db, zone_id, user_id)
    record = DNSRecord(
        zone_id=zone_id,
        name=data.name,
        type=data.type,
        ttl=data.ttl,
        routing_policy=data.routing_policy,
        value=json.dumps(data.value),
        priority=data.priority,
        weight=data.weight,
        comment=data.comment,
    )
    repo = DNSRecordRepository(db)
    record = repo.create(record)

    # Update zone record count
    zone_repo = HostedZoneRepository(db)
    zone_repo.increment_record_count(zone_id, 1)
    repo.commit()
    return record


def get_record(db: Session, zone_id: str, record_id: str, user_id: str) -> DNSRecord:
    _get_zone_or_404(db, zone_id, user_id)
    repo = DNSRecordRepository(db)
    record = repo.get_by_id_and_zone(record_id, zone_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
    return record


def update_record(
    db: Session, zone_id: str, record_id: str, user_id: str, data: DNSRecordUpdate
) -> DNSRecord:
    _get_zone_or_404(db, zone_id, user_id)
    repo = DNSRecordRepository(db)
    record = repo.get_by_id_and_zone(record_id, zone_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
    update_data = data.model_dump(exclude_none=True)
    if "value" in update_data:
        update_data["value"] = json.dumps(update_data["value"])
    update_data["updated_at"] = datetime.now(timezone.utc)
    record = repo.update(record, update_data)
    repo.commit()
    return record


def delete_record(db: Session, zone_id: str, record_id: str, user_id: str) -> None:
    _get_zone_or_404(db, zone_id, user_id)
    repo = DNSRecordRepository(db)
    record = repo.get_by_id_and_zone(record_id, zone_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
    repo.delete(record)
    zone_repo = HostedZoneRepository(db)
    zone_repo.increment_record_count(zone_id, -1)
    repo.commit()


def bulk_delete_records(db: Session, zone_id: str, user_id: str, data: BulkDeleteRequest) -> int:
    _get_zone_or_404(db, zone_id, user_id)
    repo = DNSRecordRepository(db)
    count = repo.bulk_delete(data.ids, zone_id)
    zone_repo = HostedZoneRepository(db)
    zone_repo.increment_record_count(zone_id, -count)
    repo.commit()
    return count
