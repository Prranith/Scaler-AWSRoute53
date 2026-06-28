"""SQLAlchemy database engine, session factory, and base declarative model."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings


is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    # WAL mode and thread checks for SQLite
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        """Enable WAL mode and foreign keys for every new connection."""
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
        cursor.close()
else:
    # Standard PostgreSQL configuration (Supabase, Neon, etc.)
    # Handle auto-converting "postgres://" to "postgresql://" (Render/Heroku standard format)
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    engine = create_engine(
        db_url,
        echo=settings.DEBUG,
        pool_pre_ping=True,  # Test connections before querying to prevent drops
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """Dependency-injected database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables on startup."""
    from app.models import user, hosted_zone, dns_record  # noqa: F401
    Base.metadata.create_all(bind=engine)
