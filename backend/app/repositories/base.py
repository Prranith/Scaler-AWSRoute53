"""Generic base repository implementing the Repository Pattern."""

from typing import Generic, TypeVar, Type, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic CRUD repository. Extend for model-specific queries."""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def get(self, id: Any) -> Optional[ModelType]:
        return self.db.get(self.model, id)

    def list(
        self,
        *,
        skip: int = 0,
        limit: int = 20,
        filters: dict[str, Any] | None = None,
    ) -> tuple[list[ModelType], int]:
        stmt = select(self.model)
        if filters:
            for attr, val in filters.items():
                stmt = stmt.where(getattr(self.model, attr) == val)
        total = self.db.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
        items = self.db.execute(stmt.offset(skip).limit(limit)).scalars().all()
        return list(items), total

    def create(self, obj: ModelType) -> ModelType:
        self.db.add(obj)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelType, data: dict[str, Any]) -> ModelType:
        for key, val in data.items():
            setattr(obj, key, val)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        self.db.delete(obj)
        self.db.flush()

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()
