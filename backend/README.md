# InfraGuard Lite

> Production-style API monitoring & analytics backend — built to demonstrate clean architecture, scalable backend patterns, and deployment-ready engineering.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (access + refresh tokens with DB rotation) |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Winston (file rotation + colorized console) |
| Scheduling | node-cron |
| Docs | Swagger UI (`/api-docs`) |
| Testing | Jest + Supertest + mongodb-memory-server |
| Deployment | Render |

---

## Architecture

```
Client Request
      │
      ▼
  Express App (app.js)
      │
      ├── Middleware: Helmet, CORS, JSON parser
      ├── Middleware: Request Logger (UUID tracing)
      ├── Middleware: Rate Limiter
      │
      ├── /api/v1/auth      → Auth Routes → Auth Controller → Auth Service
      ├── /api/v1/monitors  → Monitor Routes → Monitor Controller → Monitor Service
      ├── /api/v1/analytics → Analytics Routes → Analytics Controller → Analytics Service
      │
      ├── Middleware: 404 handler
      └── Middleware: Centralized Error Handler
            │
            ▼
      MongoDB Atlas (via Repositories)
            │
            ├── User, Monitor, MonitoringResult, Alert collections
            │
      Background: node-cron Health Check Job (every 5 min)
            └── Checks all active monitors → saves results → triggers alerts
```

---

## Folder Structure

```
src/
├── config/           # DB, logger, env validation, Swagger
├── controllers/      # Thin route handlers
├── jobs/             # Cron jobs (health check)
├── middleware/        # Auth, error, logging, rate limiting
├── models/           # Mongoose schemas
├── repositories/     # DB access layer
├── routes/           # Express routers with Swagger JSDoc
├── services/         # Business logic
├── tests/            # Unit + integration tests
│   ├── unit/
│   └── integration/
├── utils/            # asyncHandler, response, constants, validate
├── app.js            # Express app factory
└── server.js         # Entry point
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd infraguard-lite
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT secrets
```

### 3. Run in development

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 4. View API docs

Open `http://localhost:3000/api-docs` in your browser.

### 5. Run tests

```bash
npm test                # All tests
npm run test:coverage   # With coverage report
```

---

## API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Endpoints

#### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login, receive tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout, invalidate refresh token |
| GET | `/auth/me` | ✅ | Get current user |

#### Monitors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/monitors` | ✅ | Create monitor |
| GET | `/monitors` | ✅ | List monitors (paginated) |
| GET | `/monitors/:id` | ✅ | Get single monitor |
| PUT | `/monitors/:id` | ✅ | Update monitor |
| DELETE | `/monitors/:id` | ✅ | Delete monitor |
| PATCH | `/monitors/:id/toggle` | ✅ | Pause/resume monitor |

#### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics` | ✅ | Global dashboard stats |
| GET | `/analytics/:monitorId` | ✅ | Per-monitor stats |

#### System
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | API health check |

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Monitor created",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email address" }]
}
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `MONGO_URI` | **Yes** | — | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | — | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | **Yes** | — | Refresh token signing secret (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `HEALTH_CHECK_TIMEOUT_MS` | No | `10000` | Health check HTTP timeout |
| `CONSECUTIVE_FAILURES_THRESHOLD` | No | `3` | Failures before alert is triggered |

---

## Deployment (Render)

1. Push to GitHub
2. Connect repo on [render.com](https://render.com)
3. Render auto-detects `render.yaml`
4. Set `MONGO_URI` manually in the Render dashboard environment settings
5. Deploy — Render builds, starts, and health-checks the service

---

## Key Design Decisions

- **Repository pattern** — All DB access is isolated in `/repositories`. Services never call Mongoose directly.
- **Service layer** — All business logic lives in `/services`. Controllers are intentionally thin.
- **Token rotation** — Refresh tokens are stored in the DB and rotated on every use. Logout physically invalidates the token.
- **Error centralization** — All errors (Zod, Mongoose, JWT, app) flow through a single error middleware with environment-aware detail exposure.
- **Fail-fast env validation** — Server refuses to start if required env vars are missing.
- **TTL indexes** — MonitoringResult documents auto-delete after 30 days — no manual cleanup needed.
- **Concurrency limiting** — Health check cron processes monitors in batches of 10 using `Promise.allSettled` so one failing check never blocks others.
