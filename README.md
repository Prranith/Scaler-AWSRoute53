# AWS Route53 Clone — Production-Grade Full Stack Application

> A pixel-perfect, production-grade clone of the AWS Route53 DNS management console built for the **Scaler SDE Intern Assignment**.

---

## 🚀 Live Demo

> Deploy link here (see Deliverables section in assignment)
> https://scaler-aws-route53.vercel.app/login

---

## 📸 Features

- ✅ **Authentication** — JWT-based login/register/logout with session revocation (blocklist)
- ✅ **Hosted Zones** — Full CRUD with search, sort, pagination, and export
- ✅ **DNS Records** — Full CRUD for 9 record types (A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA)
- ✅ **Bulk Delete** — Select multiple records and delete in one click
- ✅ **Dark Mode** — Full dark theme toggle, persisted to localStorage
- ✅ **Keyboard Shortcuts** — `N` (new), `Esc` (close), `R` (refresh), `?` (help)
- ✅ **Export** — Export zones as JSON or BIND zone file format
- ✅ **Import** — Import DNS records from BIND zone files
- ✅ **Mocked Pages** — Dashboard, Traffic Policies, Health Checks, Resolver, Profiles
- ✅ **AWS-like UI** — Pixel-perfect design matching Route53 console

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)               │
│  App Router · React Query · Zustand · CSS Design System │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│  Repository Pattern · Service Layer · JWT Auth          │
│  Rate Limiting · CORS · Swagger UI                      │
└────────────────────────┬────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼────────────────────────────────┐
│             DATABASE (SQLite or PostgreSQL)             │
│  Users · Sessions (JWT blocklist) · Zones · Records     │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm 9+
- A Supabase or hosted PostgreSQL database instance (optional, SQLite is used by default)

### Backend Setup

1. **Configure Environment**:
   Inside the `backend/` directory, create a `.env` file to override the default database configuration:
   ```env
   # To use SQLite (default):
   DATABASE_URL=sqlite:///./route53.db
   
   # To use Supabase (PostgreSQL):
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.migdujpoemykdogfrswd.supabase.co:5432/postgres
   ```

2. **Install dependencies**:
   ```bash
   cd route53-clone/backend
   pip install -r requirements.txt
   ```

3. **Database Migration & Seeding**:
   Execute the seeding script to compile schemas, build relational tables in the target database, and seed 44 hosted zones:
   ```bash
   python seed_zones.py
   ```

4. **Start the API server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

- API available at: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Demo credentials are seeded automatically:** `admin` / `admin123` (or register a custom account).

### Frontend Setup

```bash
cd route53-clone/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

- Frontend available at: http://localhost:3000

---

## 🗄 Database Schema

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,          -- UUID
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL, -- bcrypt hash
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);

-- Sessions (JWT revocation blocklist)
CREATE TABLE sessions (
    jti TEXT PRIMARY KEY,          -- JWT ID (unique per token)
    user_id TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hosted Zones
CREATE TABLE hosted_zones (
    id TEXT PRIMARY KEY,           -- AWS-style Z-prefix ID (e.g. Z1A2B3C4D5E6F7)
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,            -- FQDN (e.g. example.com.)
    type TEXT NOT NULL,            -- Public | Private
    comment TEXT,
    record_count INTEGER DEFAULT 2,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- DNS Records
CREATE TABLE dns_records (
    id TEXT PRIMARY KEY,           -- UUID
    zone_id TEXT NOT NULL,
    name TEXT NOT NULL,            -- Record name (e.g. www)
    type TEXT NOT NULL,            -- A, AAAA, CNAME, TXT, MX, NS, PTR, SRV, CAA
    ttl INTEGER DEFAULT 300,
    routing_policy TEXT DEFAULT 'Simple',
    value TEXT NOT NULL,           -- JSON-encoded array of values
    priority INTEGER,              -- MX/SRV priority
    weight INTEGER,                -- Weighted routing
    comment TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES hosted_zones(id) ON DELETE CASCADE
);
```

---

## 🔌 API Overview

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Login, returns JWT |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/logout` | Revoke JWT (server-side) |
| GET | `/api/v1/auth/me` | Get current user |

### Hosted Zones
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/zones?page&size&q` | List zones (paginated, searchable) |
| POST | `/api/v1/zones` | Create hosted zone |
| GET | `/api/v1/zones/{id}` | Get zone details |
| PUT | `/api/v1/zones/{id}` | Update zone |
| DELETE | `/api/v1/zones/{id}` | Delete zone (cascades records) |
| GET | `/api/v1/zones/{id}/export?format=json\|bind` | Export zone |

### DNS Records
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/zones/{id}/records?page&size&q&type` | List records |
| POST | `/api/v1/zones/{id}/records` | Create record |
| GET | `/api/v1/zones/{id}/records/{rid}` | Get record |
| PUT | `/api/v1/zones/{id}/records/{rid}` | Update record |
| DELETE | `/api/v1/zones/{id}/records/{rid}` | Delete record |
| POST | `/api/v1/zones/{id}/records/bulk-delete` | Bulk delete |
| POST | `/api/v1/zones/{id}/records/import` | Import BIND file |

---

## 🛠 System Design Decisions

### Backend

**Repository Pattern**
- `BaseRepository[T]` — generic CRUD operations with full type safety
- `HostedZoneRepository` / `DNSRecordRepository` — domain-specific queries
- Decouples data access from business logic for testability

**Service Layer**
- Business logic lives in services (`hosted_zone.py`, `dns_record.py`, `auth.py`)
- Services call repositories; routers call services
- Clear separation of concerns

**JWT + Session Revocation**
- JWT tokens carry `jti` (JWT ID) claim
- On logout, session `jti` is marked `revoked=True` in DB
- Every authenticated request checks if `jti` is revoked → true server-side logout

**Dialect-Agnostic Database Engine**
- Supports **SQLite** (with Write-Ahead Logging WAL mode, foreign keys, and 64MB cache enabled for local environments)
- Supports **PostgreSQL** (configured with automatic URI password encoding and pool pre-ping connection validation for Supabase, Neon, etc.)
- Dynamic dialect parsing prevents database-specific query crashes
- Proper cascade deletes across tables (deleting a hosted zone automatically wipes all related DNS records)

FastAPI Lifespan
- Relational tables are automatically compiled and created on startup if they don't exist
- Demo user is seeded if the users table is empty
- Clean shutdown handling

### Frontend

**React Query (TanStack Query)**
- All server state managed via React Query hooks
- Automatic cache invalidation on mutations
- Stale-while-revalidate for optimal UX
- 30-second stale time for zones, 15-second for records

Zustand
- Auth state with localStorage persistence
- Notification system with auto-dismiss
- Zero-boilerplate compared to Redux

Optimistic UX
- Search with 350ms debounce to reduce API calls
- Instant loading states with spinners
- Error handling with toast notifications

CSS Design System
- CSS custom properties (variables) for theming
- Dark mode via `[data-theme="dark"]` attribute
- AWS color palette: `#0f1523` navy, `#ec7211` orange
- Inter font from Google Fonts

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | Create new zone/record |
| `Esc` | Close modal |
| `R` | Refresh current table |
| `?` | Show keyboard shortcuts |

---

## 📦 Tech Stack

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **React Query** (server state, caching)
- **Zustand** (client state)
- **Axios** (HTTP client with interceptors)
- **Lucide React** (icons)
- **Vanilla CSS** (custom design system)

### Backend
- **FastAPI** (async REST API, OpenAPI docs)
- **SQLAlchemy 2.0** (ORM, typed mapped columns, dialect-agnostic)
- **PostgreSQL / SQLite** (dialect-agnostic configuration, pool pre-ping, WAL mode)
- **python-jose** (JWT tokens)
- **passlib[bcrypt]** (password hashing)
- **pydantic-settings** (12-factor config)
- **Uvicorn** (ASGI server)

---

## 📁 Project Structure

```
route53-clone/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app factory + lifespan
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # SQLAlchemy + WAL mode
│   │   ├── dependencies.py  # DI: get_db, get_current_user
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic request/response
│   │   ├── repositories/    # Data access layer
│   │   ├── services/        # Business logic
│   │   ├── routers/         # HTTP route handlers
│   │   └── utils/           # BIND parser, validators
│   └── requirements.txt
└── frontend/
    ├── app/                  # Next.js App Router pages
    │   ├── (dashboard)/      # Auth-protected pages
    │   │   ├── zones/        # Hosted zones list + detail
    │   │   ├── dashboard/    # Dashboard
    │   │   └── ...           # Mocked feature pages
    │   └── login/            # Login/register page
    ├── components/           # React components
    │   ├── layout/           # Sidebar, TopBar
    │   ├── zones/            # Zone CRUD modals
    │   ├── records/          # Record CRUD modals
    │   └── shared/           # Shared UI components
    ├── hooks/                # React Query hooks
    ├── store/                # Zustand stores
    ├── types/                # TypeScript interfaces
    └── lib/                  # API client, utils
```
