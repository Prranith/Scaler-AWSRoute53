"""Pydantic schemas for DNS Record CRUD operations."""

from pydantic import BaseModel, Field, field_validator, model_validator
from datetime import datetime
from typing import Literal, Optional
import json

RECORD_TYPES = Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]
ROUTING_POLICIES = Literal["Simple", "Weighted", "Latency", "Failover", "Multivalue"]


class DNSRecordCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: RECORD_TYPES
    ttl: int = Field(default=300, ge=0, le=2147483647)
    routing_policy: ROUTING_POLICIES = "Simple"
    value: list[str] = Field(..., min_length=1)  # list of record values
    priority: Optional[int] = Field(None, ge=0, le=65535)
    weight: Optional[int] = Field(None, ge=0, le=255)
    comment: Optional[str] = Field(None, max_length=256)

    @model_validator(mode="after")
    def validate_type_requirements(self):
        if self.type in ("MX", "SRV") and self.priority is None:
            raise ValueError(f"priority is required for {self.type} records")
        if self.type == "CNAME" and len(self.value) > 1:
            raise ValueError("CNAME records can only have one value")
        return self


class DNSRecordUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    ttl: Optional[int] = Field(None, ge=0, le=2147483647)
    routing_policy: Optional[ROUTING_POLICIES] = None
    value: Optional[list[str]] = Field(None, min_length=1)
    priority: Optional[int] = Field(None, ge=0, le=65535)
    weight: Optional[int] = Field(None, ge=0, le=255)
    comment: Optional[str] = Field(None, max_length=256)


class DNSRecordResponse(BaseModel):
    id: str
    zone_id: str
    name: str
    type: str
    ttl: int
    routing_policy: str
    value: list[str]
    priority: Optional[int]
    weight: Optional[int]
    comment: Optional[str]
    created_at: datetime
    updated_at: datetime

    @field_validator("value", mode="before")
    @classmethod
    def parse_value(cls, v):
        """Deserialize JSON-encoded value from DB."""
        if isinstance(v, str):
            return json.loads(v)
        return v

    model_config = {"from_attributes": True}


class PaginatedRecords(BaseModel):
    items: list[DNSRecordResponse]
    total: int
    page: int
    size: int
    pages: int


class BulkDeleteRequest(BaseModel):
    ids: list[str] = Field(..., min_length=1)
