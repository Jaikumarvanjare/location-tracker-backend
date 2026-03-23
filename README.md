# Location Tracker — Backend

Fastify · TypeScript · PostgreSQL

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Create the database
```sql
CREATE DATABASE location_tracker;
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. Start dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
src/
├── db/
│   ├── index.ts              # pg Pool — single shared instance
│   ├── migrate.ts            # migration runner (npm run migrate)
│   └── migrations/
│       └── 001_initial.sql   # sessions + locations tables
├── routes/
│   ├── sessions.ts           # POST / GET / PATCH sessions
│   └── locations.ts          # POST single, POST batch, GET locations
├── schemas/
│   └── index.ts              # JSON Schema for Fastify request validation
├── types/
│   └── index.ts              # TypeScript domain types
└── server.ts                 # App bootstrap + plugin registration
```

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/sessions` | Start a new session |
| `GET` | `/api/v1/sessions` | List sessions |
| `GET` | `/api/v1/sessions/:sessionId` | Get one session |
| `PATCH` | `/api/v1/sessions/:sessionId` | End a session |
| `POST` | `/api/v1/sessions/:sessionId/locations` | Send a single location |
| `POST` | `/api/v1/sessions/:sessionId/locations/batch` | Flush offline queue (≤500 pts) |
| `GET` | `/api/v1/sessions/:sessionId/locations` | Get all locations for map |
| `GET` | `/health` | Health check |

See `location-tracker-api.md` for full request/response shapes.

---

## Key Design Decisions

- **Single `pg.Pool`** shared across all routes — no ORM overhead, plain parameterised SQL.
- **`ON CONFLICT DO NOTHING`** on `(session_id, recorded_at)` makes both single and batch inserts idempotent — safe to retry on flaky networks.
- **`207 Multi-Status`** for batch — partial success is handled gracefully; valid points are saved even if some fail validation.
- **`recorded_at` vs `created_at`** — device timestamp used for path ordering; server timestamp for audit. Critical for offline batches.
- **Migration runner** is a simple script rather than a heavy framework — keeps the POC lean.