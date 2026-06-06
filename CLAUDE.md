# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

運動禁藥案例平台 — Full-stack MERN application for sports doping case database with educational content, data visualization, and TUE (Therapeutic Use Exemption) information. All UI in Traditional Chinese.

## Architecture

**Unified server pattern**: `server.js` at root serves both Express API (`/api/*`) and React SPA (Vite-built static files from `frontend/dist/`). Single process, single port.

- **Backend**: Express + MongoDB native driver. Mounted routes in `backend/routes/` are `casesFixed.js`, `statsFixed.js`, `education.js`, `tue.js` (see server.js:72-75). Data routes each open their **own** `MongoClient.connect()` at module load and hardcode db name `"sports-doping-db"` — they do **not** reuse server.js's Mongoose connection.
- **Frontend**: React 19 + Vite + React Router v6 + Tailwind CSS v3 + Chart.js
- **Database**: MongoDB, single collection `cases`. `server.js` opens a separate Mongoose connection (for lifecycle/auto-reconnect + registering `backend/models/Case.js` so its indexes get built), but request handlers query through the route-level `MongoClient`, never `Case.find()`.
- **API client**: `frontend/src/services/api.js` — `import.meta.env.PROD ? "/api" : "http://localhost:${VITE_API_PORT||8080}/api"`. Contains a `mockData.js` (196KB) fallback path gated on `api === null`, but `API_BASE_URL` is always truthy, so the mock path is currently dead code (never executes).
- **Static content**: `education.js` serves WADA categories/quizzes/specialties from JSON in `backend/data/` (wada-categories.json, quizzes.json, medical-specialties.json). `tue.js` content is **hardcoded inline in the route file** (~430-line `tueContent` object), not in `backend/data/`.

### Key Data Model

`backend/models/Case.js` — WADA substance categories (S0-S9, M1-M3, P1), punishment details (banDuration, resultsCancelled, medalStripped), source links. Text index on athleteName/substance/sport/summary/nationality. Compound indexes on (sport, year), (nationality, year), (substanceCategory, year).

### Frontend Pages

Routes are defined in `frontend/src/App.jsx`. Only `Home`, `CaseList`, `CaseDetail` are eagerly imported; **all others are `React.lazy()`-loaded**.

- `Home` (`/`) — stats cards + recent cases
- `CaseList` (`/cases`) — multi-condition filtering (sport/nationality/year/substance/punishment) + text search + pagination
- `CaseDetail` (`/cases/:id`) — single case view
- `Statistics` (`/statistics`) — Chart.js visualizations (sport/substance/ban distribution, yearly trends)
- `Education` (`/education`) — WADA substance guide + interactive quizzes
- `TUE` (`/tue`) — 67KB page: disease guides + drug checker + application checklist
- `ProhibitedList` (`/prohibited-list`) — reads local `frontend/src/data/prohibitedList.js` (not the API)
- `Quiz` (`/quiz`) — reads local `frontend/src/data/quiz.js` (not the API)
- `TestingProcess` (`/testing-process`), `News` (`/news`), `Resources` (`/resources`) — mostly static content pages
- `NotFound` (`*`) — 404 catch-all

Shared: `components/Layout.jsx` (nav/footer wrapper), `components/ErrorBoundary.jsx` (wraps the whole `Router`). Client utils in `frontend/src/utils/` (`cache.js`, `debounce.js`).

### API Routes

| Route | Source | Notes |
|-------|--------|-------|
| `/api/cases` | `casesFixed.js` | Filtering, pagination, text search via regex |
| `/api/cases/filters` | `casesFixed.js` | Distinct values for filter dropdowns |
| `/api/stats/*` | `statsFixed.js` | MongoDB aggregation pipelines (yearly-trends, sport/substance/country/ban distributions) |
| `/api/education/*` | `education.js` | Reads from JSON files, quiz answers via POST |
| `/api/tue/*` | `tue.js` | Inline TUE content + POST `/tue/check` drug eligibility checker (30+ drugs) |
| `/api/health` | `server.js` | Health check (used by zeabur.json) |

## Commands

```bash
npm run install:all          # Install root + backend + frontend deps
npm run dev                  # Backend dev server (nodemon, port 8080)
npm run dev:frontend         # Vite dev server (port 5173)
npm run build                # Build frontend (cd frontend && npm install && npm run build)
npm start                    # Production server (node server.js, port 8080)
cd frontend && npm run lint  # ESLint (only lint/test tooling in the repo — there are no unit/E2E tests)
```

## Environment Variables

Required: `MONGODB_URI` (MongoDB connection string)
Optional: `PORT` (default 8080), `JWT_SECRET`, `CORS_ORIGIN`

## Dev vs Prod API Connection

- **Dev**: Vite dev server on `:5173`; `api.js` calls `http://localhost:8080/api` (override with `VITE_API_PORT`). So run `npm run dev` (backend on 8080) alongside `npm run dev:frontend` for a full local stack.
- **Prod**: Both served from same origin on `:8080` via `server.js`; frontend calls `/api/*` relatively (`import.meta.env.PROD` branch).

## Deployment (Zeabur)

- Multi-stage Dockerfile included (frontend-build → backend-deps → production)
- `zeabur.json` configures build/start commands and health check on `/api/health`
- Unified server serves API + static frontend on same port
- MongoDB URI must be set in Zeabur environment variables
- Runs as non-root user (uid 1001) in Docker

## Data Seeding

40+ seed/import scripts in `backend/` for populating case data. Example: `node backend/add_comprehensive_cases_batch1.js`. Scripts organized by era (1980s, 1990s EPO, 2000s BALCO) and sport (MLB, NBA, weightlifting).

## Gotchas

- **Edit the `*Fixed.js` route files, not the originals.** `backend/routes/cases.js` and `stats.js` still exist but are **not mounted** — `server.js` wires up `casesFixed.js` and `statsFixed.js`. Editing `cases.js`/`stats.js` has zero effect. (`backend/server.js` is likewise a stale unused entry point — the real server is the root `server.js`.)
- Data routes use the native `MongoClient` they open themselves, not Mongoose models — don't call `Case.find()` in handlers. Each guards with `if (!db) return 500` since the connection is async at module load.
- `statsFixed.js` has complex `$addFields`/`$switch`/`$regexMatch` pipelines for ban duration categorization.
- `api.js`'s `mockData.js` fallback is dead under the current config (`api` is never null). If the page shows data with no successful `/api/*` calls, the cause is something else — don't assume the mock path.
- `server.js` sets a custom helmet CSP allowing `frame-ancestors` for `*.blogspot.com`/`*.blogger.com` and `frameguard: false` — this is intentional, to let the site be embedded in Blogger iframes. Don't revert it.
- Middleware order in `server.js`: helmet → compression → CORS → rate limit (200 req/15min on `/api/*`) → JSON parser → routes → static files → SPA catch-all.
- CORS in production defaults to `false` (blocks all cross-origin) unless `CORS_ORIGIN` is set (comma-separated list).
