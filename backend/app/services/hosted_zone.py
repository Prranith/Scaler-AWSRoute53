"""Hosted Zone business logic service."""

import json
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord
from app.repositories.hosted_zone import HostedZoneRepository
from app.repositories.dns_record import DNSRecordRepository
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate, PaginatedZones, HostedZoneResponse


def get_zones(
    db: Session,
    user_id: str,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
) -> PaginatedZones:
    repo = HostedZoneRepository(db)
    skip = (page - 1) * size
    items, total = repo.list_for_user(user_id, skip=skip, limit=size, search=search)
    pages = (total + size - 1) // size
    return PaginatedZones(
        items=[HostedZoneResponse.model_validate(z) for z in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


def create_zone(db: Session, user_id: str, data: HostedZoneCreate) -> HostedZone:
    repo = HostedZoneRepository(db)
    if repo.exists_for_user(data.name, user_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Hosted zone '{data.name}' already exists",
        )
    zone = HostedZone(
        user_id=user_id,
        name=data.name,
        type=data.type,
        comment=data.comment,
        record_count=2,  # Default SOA + NS
    )
    zone = repo.create(zone)
    repo.commit()
    return zone


def get_zone(db: Session, zone_id: str, user_id: str) -> HostedZone:
    repo = HostedZoneRepository(db)
    zone = repo.get_by_id_and_user(zone_id, user_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return zone


def update_zone(db: Session, zone_id: str, user_id: str, data: HostedZoneUpdate) -> HostedZone:
    repo = HostedZoneRepository(db)
    zone = repo.get_by_id_and_user(zone_id, user_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    update_data = data.model_dump(exclude_none=True)
    zone = repo.update(zone, update_data)
    repo.commit()
    return zone


def delete_zone(db: Session, zone_id: str, user_id: str) -> None:
    repo = HostedZoneRepository(db)
    zone = repo.get_by_id_and_user(zone_id, user_id)
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    repo.delete(zone)
    repo.commit()


def export_zone_json(db: Session, zone_id: str, user_id: str) -> dict:
    """Export a hosted zone with all its records as JSON."""
    zone = get_zone(db, zone_id, user_id)
    record_repo = DNSRecordRepository(db)
    records = record_repo.list_all_for_zone(zone_id)
    return {
        "zone": {
            "id": zone.id,
            "name": zone.name,
            "type": zone.type,
            "comment": zone.comment,
        },
        "records": [
            {
                "name": r.name,
                "type": r.type,
                "ttl": r.ttl,
                "value": json.loads(r.value),
                "priority": r.priority,
                "comment": r.comment,
            }
            for r in records
        ],
    }


def export_zone_bind(db: Session, zone_id: str, user_id: str) -> str:
    """Export a hosted zone in BIND zone file format."""
    zone = get_zone(db, zone_id, user_id)
    record_repo = DNSRecordRepository(db)
    records = record_repo.list_all_for_zone(zone_id)

    lines = [
        f"; Zone file for {zone.name}",
        f"; Exported from Route53 Clone",
        f"$ORIGIN {zone.name}",
        f"$TTL 300",
        "",
    ]
    for r in records:
        values = json.loads(r.value)
        for v in values:
            if r.type in ("MX",) and r.priority is not None:
                lines.append(f"{r.name}\t{r.ttl}\tIN\t{r.type}\t{r.priority} {v}")
            else:
                lines.append(f"{r.name}\t{r.ttl}\tIN\t{r.type}\t{v}")
    return "\n".join(lines)
