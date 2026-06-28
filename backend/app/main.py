"""FastAPI application factory with full middleware stack and router registration."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables
from app.middleware.logging import logging_middleware
from app.routers import auth, hosted_zones, dns_records

# Configure structured logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("route53")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: setup → yield → teardown."""
    logger.info("🚀 Starting Route53 Clone API v%s", settings.APP_VERSION)
    create_tables()

    # Seed demo user if none exists
    from app.database import SessionLocal
    from sqlalchemy import select
    from app.models.user import User
    from app.services.auth import hash_password

    db = SessionLocal()
    try:
        existing = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
        if not existing:
            demo = User(
                username="admin",
                email="admin@route53.local",
                hashed_password=hash_password("admin123"),
            )
            db.add(demo)
            db.commit()
            logger.info("✅ Demo user created: admin / admin123")
    finally:
        db.close()

    yield
    logger.info("🛑 Shutting down Route53 Clone API")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AWS Route53 clone — FastAPI backend",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware (must be first)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom middleware
app.middleware("http")(logging_middleware)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(hosted_zones.router, prefix="/api/v1")
app.include_router(dns_records.router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
