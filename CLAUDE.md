# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

運動禁藥案例平台 — Full-stack MERN application for sports doping case database with educational content, data visualization, and TUE (Therapeutic Use Exemption) information. All UI in Traditional Chinese.

## Architecture

**Unified server pattern**: `server.js` at root serves both Express API (`/api/*`) and React SPA (Vite-built static files from `frontend/dist/`).

- **Backend**: Express + Mongoose, routes in `backend/routes/` (`casesFixed.js`, `statsFixed.js`, `education.js`, `tue.js`)
- **Frontend**: React 19 + Vite + React Router v6 + Tailwind CSS + Chart.js
- **Database**: MongoDB with Mongoose ODM, single collection `cases` with compound indexes
- **API client**: `frontend/src/services/api.js` — contains extensive mock data fallback; uses relative `/api` in production, `localhost:5001` in dev

### Key Data Model

`backend/models/Case.js` — WADA substance categories (S0-S9, M1-M3, P1), punishment details, source links. Text index on athleteName/substance/sport/summary/nationality.

### Frontend Pages

`Home` → `CaseList` (filtering/search/pagination) → `CaseDetail` | `Statistics` (Chart.js) | `Education` (substance guide + quizzes) | `TUE` (guidelines/checklist)

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

## Deployment (Zeabur)

- Multi-stage Dockerfile included
- `zeabur.json` configures build/start commands and health check
- Unified server serves API + static frontend on same port
- MongoDB URI must be set in Zeabur environment variables

## Dev vs Prod API Connection

- **Dev**: Frontend Vite dev server on `:5173`, API on `:5001` (configured in `frontend/src/services/api.js`)
- **Prod**: Both served from same origin on `:8080` via `server.js`, frontend calls `/api/*` relatively

## Data Seeding

60+ seed/import scripts in `backend/` for populating case data. Example: `node backend/add_comprehensive_cases_batch1.js`
