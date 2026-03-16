# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

運動禁藥案例平台 — Full-stack MERN application for sports doping case database with educational content, data visualization, and TUE (Therapeutic Use Exemption) information. All UI in Traditional Chinese.

## Architecture

**Unified server pattern**: `server.js` at root serves both Express API (`/api/*`) and React SPA (Vite-built static files from `frontend/dist/`). Single process, single port.

- **Backend**: Express + MongoDB native driver (routes use `MongoClient` directly, not Mongoose models), routes in `backend/routes/` (`casesFixed.js`, `statsFixed.js`, `education.js`, `tue.js`)
- **Frontend**: React 19 + Vite + React Router v6 + Tailwind CSS + Chart.js
- **Database**: MongoDB, single collection `cases` with compound indexes. Mongoose schema in `backend/models/Case.js` but routes query via native driver.
- **API client**: `frontend/src/services/api.js` — auto-switches base URL by environment; falls back to `frontend/src/services/mockData.js` (196KB, 100+ cases) when backend unavailable
- **Static data**: Education/TUE content served from JSON files in `backend/data/` (wada-categories.json, quizzes.json, medical-specialties.json), not from database

### Key Data Model

`backend/models/Case.js` — WADA substance categories (S0-S9, M1-M3, P1), punishment details (banDuration, resultsCancelled, medalStripped), source links. Text index on athleteName/substance/sport/summary/nationality. Compound indexes on (sport, year), (nationality, year), (substanceCategory, year).

### Frontend Pages

- `Home` — stats cards + recent cases
- `CaseList` — multi-condition filtering (sport/nationality/year/substance/punishment) + text search + pagination
- `CaseDetail` — single case view
- `Statistics` — Chart.js visualizations (sport/substance/ban distribution, yearly trends)
- `Education` — WADA substance guide + interactive quizzes with instant feedback
- `TUE` — 6 disease guides + drug checker + application checklist

Statistics, Education, TUE are lazy-loaded via `React.lazy()`.

### API Routes

| Route | Source | Notes |
|-------|--------|-------|
| `/api/cases` | `casesFixed.js` | Filtering, pagination, text search via regex |
| `/api/cases/filters` | `casesFixed.js` | Distinct values for filter dropdowns |
| `/api/stats/*` | `statsFixed.js` | MongoDB aggregation pipelines (yearly-trends, sport/substance/country/ban distributions) |
| `/api/education/*` | `education.js` | Reads from JSON files, quiz answers via POST |
| `/api/tue/*` | `tue.js` | Static TUE content + POST `/tue/check` drug eligibility checker (30+ drugs) |

## Commands

```bash
npm run install:all          # Install root + backend + frontend deps
npm run dev                  # Backend dev server (nodemon, port 8080)
npm run dev:frontend         # Vite dev server (port 5173)
npm run build                # Build frontend (cd frontend && npm install && npm run build)
npm start                    # Production server (node server.js, port 8080)
cd frontend && npm run lint  # ESLint
```

## Environment Variables

Required: `MONGODB_URI` (MongoDB connection string)
Optional: `PORT` (default 8080), `JWT_SECRET`, `CORS_ORIGIN`

## Dev vs Prod API Connection

- **Dev**: Frontend Vite dev server on `:5173`, API on `:5001` (configured in `frontend/src/services/api.js`)
- **Prod**: Both served from same origin on `:8080` via `server.js`, frontend calls `/api/*` relatively

## Deployment (Zeabur)

- Multi-stage Dockerfile included (frontend-build → backend-deps → production)
- `zeabur.json` configures build/start commands and health check on `/`
- Unified server serves API + static frontend on same port
- MongoDB URI must be set in Zeabur environment variables
- Runs as non-root user (uid 1001) in Docker

## Data Seeding

40+ seed/import scripts in `backend/` for populating case data. Example: `node backend/add_comprehensive_cases_batch1.js`. Scripts organized by era (1980s, 1990s EPO, 2000s BALCO) and sport (MLB, NBA, weightlifting).

## Gotchas

- Routes use MongoDB native `MongoClient` (from `server.js` connection), not Mongoose model methods — don't use `Case.find()` in route handlers
- `statsFixed.js` has complex `$addFields`/`$switch`/`$regexMatch` pipelines for ban duration categorization
- `api.js` silently falls back to mock data on error — check browser network tab to confirm real API is being hit
- Middleware order in `server.js`: helmet → CORS → rate limit (200 req/15min on `/api/*`) → JSON parser → routes → static files → SPA catch-all
