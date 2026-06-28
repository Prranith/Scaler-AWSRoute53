"""DNS Records router with full CRUD, bulk delete, BIND import."""

from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.dns_record import (
    DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse,
    PaginatedRecords, BulkDeleteRequest
)
from app.services import dns_record as record_service
from app.utils.bind_parser import parse_bind_zone

router = APIRouter(prefix="/zones/{zone_id}/records", tags=["DNS Records"])


@router.get("", response_model=PaginatedRecords)
def list_records(
    zone_id: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search by record name"),
    type: Optional[str] = Query(None, description="Filter by record type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List DNS records for a zone with pagination, search, and type filter."""
    return record_service.list_records(db, zone_id, current_user.id, page=page, size=size, search=q, record_type=type)


@router.post("", response_model=DNSRecordResponse, status_code=201)
def create_record(
    zone_id: str,
    data: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new DNS record in the specified zone."""
    record = record_service.create_record(db, zone_id, current_user.id, data)
    return DNSRecordResponse.model_validate(record)


@router.get("/{record_id}", response_model=DNSRecordResponse)
def get_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific DNS record."""
    record = record_service.get_record(db, zone_id, record_id, current_user.id)
    return DNSRecordResponse.model_validate(record)


@router.put("/{record_id}", response_model=DNSRecordResponse)
def update_record(
    zone_id: str,
    record_id: str,
    data: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a DNS record."""
    record = record_service.update_record(db, zone_id, record_id, current_user.id, data)
    return DNSRecordResponse.model_validate(record)


@router.delete("/{record_id}", status_code=204)
def delete_record(
    zone_id: str,
    record_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a single DNS record."""
    record_service.delete_record(db, zone_id, record_id, current_user.id)


@router.post("/bulk-delete", status_code=200)
def bulk_delete_records(
    zone_id: str,
    data: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Bulk delete multiple DNS records."""
    count = record_service.bulk_delete_records(db, zone_id, current_user.id, data)
    return {"deleted": count}


@router.post("/import", status_code=201)
async def import_bind(
    zone_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Import DNS records from a BIND zone file."""
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")

    records = parse_bind_zone(text)
    created = 0
    for rec in records:
        try:
            schema = DNSRecordCreate(**rec)
            record_service.create_record(db, zone_id, current_user.id, schema)
            created += 1
        except Exception:
            pass  # Skip invalid records

    return {"imported": created, "total_parsed": len(records)}
