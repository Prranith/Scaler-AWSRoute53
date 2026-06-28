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
    from urllib.parse import urlparse, quote_plus, urlunparse, unquote

    def format_db_url(url: str) -> str:
        parsed = urlparse(url)
        if not parsed.password:
            return url
        # Decode first to prevent double-encoding, then safely quote special characters
        decoded_password = unquote(parsed.password)
        encoded_password = quote_plus(decoded_password)
        
        username = parsed.username or "postgres"
        port_str = f":{parsed.port}" if parsed.port else ""
        hostname = parsed.hostname or ""
        
        netloc = f"{username}:{encoded_password}@{hostname}{port_str}"
        new_parts = list(parsed)
        new_parts[1] = netloc
        
        scheme = parsed.scheme
        if scheme == "postgres":
            scheme = "postgresql"
        new_parts[0] = scheme
        
        # Strip pgbouncer query parameter since psycopg2 doesn't support it
        if parsed.query:
            from urllib.parse import parse_qsl, urlencode
            query_params = parse_qsl(parsed.query)
            filtered_params = [(k, v) for k, v in query_params if k.lower() != "pgbouncer"]
            new_parts[4] = urlencode(filtered_params)
        
        return urlunparse(new_parts)

    db_url = format_db_url(settings.DATABASE_URL)

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
