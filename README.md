# InfraGuard Lite

InfraGuard Lite is a full-stack monitoring dashboard for APIs and services. It includes a Node.js/Express backend with JWT auth, monitoring jobs, alerting, analytics, and a React/Vite frontend UI.

## 🚀 What this project does

- Monitor API endpoints and service health
- Track uptime, response time, and failure counts
- Generate alerts after configurable failure thresholds
- Display analytics and monitor details in a React dashboard
- Secure user accounts with JWT access and refresh tokens
- Provide API docs via Swagger UI

## 🧩 Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS, React Router
- Auth: JWT access + refresh tokens
- Validation: Zod
- Scheduling: node-cron health checks
- Logging: Winston
- API docs: Swagger UI
- Testing: Jest, Supertest, mongodb-memory-server

## 📁 Repository Structure

```
backend/
  ├── src/
  │   ├── config/        # DB, env validation, logger, Swagger
  │   ├── controllers/   # Request handlers
  │   ├── jobs/          # Health check cron job
  │   ├── middleware/    # Auth, error handling, logging, rate limiting
  │   ├── models/        # Mongoose schemas
  │   ├── repositories/  # Database access layer
  │   ├── routes/        # API routers
  │   ├── services/      # Business logic
  │   ├── tests/         # Unit + integration tests
  │   └── utils/         # Response helpers, validation helpers
  │   ├── app.js         # Express app factory
  │   └── server.js      # Entry point
  └── package.json

frontend/
  ├── public/
  ├── src/
  │   ├── api/           # Axios client and API functions
  │   ├── components/    # UI components
  │   ├── context/       # Auth and theme providers
  │   ├── layouts/       # App layout components
  │   ├── pages/         # Route pages
  │   ├── routes/        # React Router implementation
  │   ├── validators/    # Form validation schemas
  │   ├── App.jsx
  │   └── main.jsx
  └── package.json

README.md
```

## 🛠️ Local Setup

### Backend

1. Open terminal and install dependencies:

```bash
cd backend
npm install
```

2. Create environment file and configure secrets:

```bash
cp .env.example .env
```

Required backend variables:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- Optional: `PORT`, `NODE_ENV`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `HEALTH_CHECK_TIMEOUT_MS`, `CONSECUTIVE_FAILURES_THRESHOLD`

3. Start backend server:

```bash
npm run dev
```

The backend runs at `http://localhost:3000` and Swagger docs are available at `http://localhost:3000/api-docs`.

### Frontend

1. Open a separate terminal and install dependencies:

```bash
cd infraguard-frontend
npm install
```

2. Configure the frontend API base URL in a `.env` file:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

3. Start frontend development server:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

## 🧪 Testing

Backend tests are included in `backend/src/tests`.

```bash
cd backend
npm test
```

Run coverage:

```bash
npm run test:coverage
```

## 🔌 API Overview

Base URL:

```bash
http://localhost:3000/api/v1
```

### Auth

- `POST /auth/register` — Register a new user
- `POST /auth/login` — Login and receive access/refresh tokens
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Logout and invalidate refresh token
- `GET /auth/me` — Get current user profile

### Monitors

- `POST /monitors` — Create a new monitor
- `GET /monitors` — List monitors
- `GET /monitors/:id` — Get monitor details
- `PUT /monitors/:id` — Update monitor
- `DELETE /monitors/:id` — Delete monitor
- `PATCH /monitors/:id/toggle` — Pause or resume monitor

### Analytics

- `GET /analytics` — Global dashboard metrics
- `GET /analytics/:monitorId` — Monitor-specific analytics

### System

- `GET /health` — API health check

## 📦 Response Format

Success example:

```json
{
  "success": true,
  "message": "Monitor created",
  "data": { }
}
```

Error example:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## ⚙️ Environment Variables

### Backend (`backend/.env`)

- `PORT` — Server port (default `3000`)
- `NODE_ENV` — Environment mode (default `development`)
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — Access token secret
- `JWT_REFRESH_SECRET` — Refresh token secret
- `JWT_ACCESS_EXPIRES_IN` — Access token expiry (default `15m`)
- `JWT_REFRESH_EXPIRES_IN` — Refresh token expiry (default `7d`)
- `RATE_LIMIT_WINDOW_MS` — Rate limit window in ms (default `900000`)
- `RATE_LIMIT_MAX` — Max requests per window (default `100`)
- `HEALTH_CHECK_TIMEOUT_MS` — Health check timeout ms (default `10000`)
- `CONSECUTIVE_FAILURES_THRESHOLD` — Failures before alert triggers (default `3`)

### Frontend (`infraguard-frontend/.env`)

- `VITE_API_URL` — Backend API URL, e.g. `http://localhost:3000/api/v1`

## ✅ Features

- JWT-based authentication with refresh token rotation
- Active monitor tracking with health check scheduler
- Alerts for failing monitors after repeated errors
- Analytics dashboards for response times and uptime
- React UI with protected routes and form validation
- Swagger API documentation
- Graceful shutdown and centralized error handling

## 📌 Notes

- Run backend and frontend in separate terminals.
- Ensure your MongoDB URI is accessible from your local machine.
- For production, use secure secrets and HTTPS.

---

Happy deploying your InfraGuard Lite project!

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
