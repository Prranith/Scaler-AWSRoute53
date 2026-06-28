"""Hosted Zones router with full CRUD, search, pagination, export."""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.hosted_zone import (
    HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse, PaginatedZones
)
from app.services import hosted_zone as zone_service

router = APIRouter(prefix="/zones", tags=["Hosted Zones"])


@router.get("", response_model=PaginatedZones)
def list_zones(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search by domain name"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all hosted zones for the current user with pagination and search."""
    return zone_service.get_zones(db, current_user.id, page=page, size=size, search=q)


@router.post("", response_model=HostedZoneResponse, status_code=201)
def create_zone(
    data: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new hosted zone."""
    zone = zone_service.create_zone(db, current_user.id, data)
    return HostedZoneResponse.model_validate(zone)


@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a specific hosted zone by ID."""
    zone = zone_service.get_zone(db, zone_id, current_user.id)
    return HostedZoneResponse.model_validate(zone)


@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_zone(
    zone_id: str,
    data: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a hosted zone's comment or type."""
    zone = zone_service.update_zone(db, zone_id, current_user.id, data)
    return HostedZoneResponse.model_validate(zone)


@router.delete("/{zone_id}", status_code=204)
def delete_zone(
    zone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a hosted zone and all its DNS records."""
    zone_service.delete_zone(db, zone_id, current_user.id)


@router.get("/{zone_id}/export")
def export_zone(
    zone_id: str,
    format: str = Query("json", description="Export format: json or bind"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export a hosted zone as JSON or BIND zone file."""
    if format == "bind":
        content = zone_service.export_zone_bind(db, zone_id, current_user.id)
        return PlainTextResponse(content, media_type="text/plain")
    else:
        data = zone_service.export_zone_json(db, zone_id, current_user.id)
        return JSONResponse(data)
