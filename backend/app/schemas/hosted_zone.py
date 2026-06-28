"""Pydantic schemas for Hosted Zone CRUD operations."""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Literal, Optional


class HostedZoneCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: Literal["Public", "Private"] = "Public"
    comment: Optional[str] = Field(None, max_length=256)

    @field_validator("name")
    @classmethod
    def normalize_domain(cls, v: str) -> str:
        """Ensure domain name ends with a dot (FQDN format)."""
        v = v.strip().lower()
        if not v.endswith("."):
            v += "."
        return v


class HostedZoneUpdate(BaseModel):
    comment: Optional[str] = Field(None, max_length=256)
    type: Optional[Literal["Public", "Private"]] = None


class HostedZoneResponse(BaseModel):
    id: str
    name: str
    type: str
    comment: Optional[str]
    record_count: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaginatedZones(BaseModel):
    items: list[HostedZoneResponse]
    total: int
    page: int
    size: int
    pages: int
