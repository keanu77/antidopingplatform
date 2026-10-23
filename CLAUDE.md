# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

運動禁藥教育平台，選手、教練與醫療人員並重；介面使用繁體中文。

## Architecture: production first

- **Production**: Cloudflare Pages Direct Upload project `antidoping-platform`; Pages Functions in `functions/api/[[path]].js`. Case / educational JSON is bundled at build; production reads do not use MongoDB. `FEEDBACK_DB` D1 stores feedback and its delivery cursor.
- **Frontend**: React 19, Vite 7, React Router 7, Tailwind 4, Chart.js. Tailwind 4 requires modern browsers (Safari 16.4+, Chrome 111+, Firefox 128+); CI exercises Chromium and WebKit, not every supported browser.
- **Content**: `data/cases.json` is the 517-case corpus. `backend/data/substances.json` is the drug source of truth. `backend/data/content-registry.json` and `shared/content-evidence.mjs` govern source validity / annual expiry. Six drugs and 69 legacy questions remain pending verification. Do not infer permission from absent evidence or auto-activate 2027.
- **Learning**: 16 frontend quiz questions; `/learning` serves three equal roles. Local progress is anonymous, versioned, expiring and clearable. Never store personal health information or medication searches in learning progress / URLs.
- **SEO**: `frontend/src/data/routeMeta.js` is shared by runtime and prerender. The build writes meaningful HTML for all case pages and a real 404; do not restore an unconditional SPA 200 fallback.
- **Feedback**: migration 0003 adds request deduplication and durable, immutable digest batches. See `docs/feedback-operations.md` before migration or delivery reconciliation. Browser tests block feedback writes; never trigger a real digest as a smoke test.
- **API client**: production `/api`; local Vite can use the legacy Express endpoint. For release parity use `wrangler pages dev frontend/dist` from the repository root.

### Legacy Express / MongoDB runtime

`server.js` retains a unified Express server for legacy use and integration tests. `casesFixed.js` and `statsFixed.js` share the native MongoClient in `backend/db.js`, separate from server.js's Mongoose lifecycle connection. DB name comes from `MONGODB_DB_NAME` (default `sports-doping-db`). These handlers are not the production Pages Functions implementation. Verify both contracts when shared data changes.

### Key Data Model

`backend/models/Case.js` — WADA substance categories (S0-S9, M1-M3, P1), punishment details (banDuration, resultsCancelled, medalStripped), source links. Text index on athleteName/substance/sport/summary/nationality. Compound indexes on (sport, year), (nationality, year), (substanceCategory, year).

### Frontend Pages

Routes are defined in `frontend/src/App.jsx`. Only `Home`, `CaseList`, `CaseDetail` are eagerly imported; **all others are `React.lazy()`-loaded**.

- `Home` (`/`) — stats cards + recent cases
- `CaseList` (`/cases`) — multi-condition filtering (sport/nationality/year/substance/punishment) + text search + pagination
- `CaseDetail` (`/cases/:id`) — single case view
- `Statistics` (`/statistics`) — Chart.js visualizations (sport/substance/ban distribution, yearly trends)
- `Education` (`/education`) — WADA substance guide + interactive quizzes
- `TUE` (`/tue`) — thin tab shell; tabs are `components/tue/{Basic,Application,Diseases,Tools}Tab.jsx`. Tools tab: drug checker (calls `/api/tue/check`) and multi-step decision tool with lecture scenarios (route × in/out-of-competition × sport, powered by pure-function engine `frontend/src/utils/tueDecision.js`)
- `DrugSearch` (`/drug-search`) — independent TFDA product search. `data/drugs/catalog.json.gz` is the checked snapshot; `scripts/prepare-drug-assets.mjs` generates versioned static assets on frontend predev/prebuild. Search runs in a Web Worker, details load by shard with SHA-256 verification. Product assessments reuse `tueDecision.js` plus `backend/data/drug-ingredient-rules.json` and the existing substances JSON. Unknown ingredients always remain unresolved; the 66k catalog is NOT a fully classified antidoping database. SQLite exports in `artifacts/drugs/` are local portability artifacts, not the production D1 database. See `docs/research/2026-10-23-drug-system/README.md`.
- Product search is Western medicines only. `/herbal-search` and `/supplement-search` are retired and must return 404; navigation, SEO and production assets exclude them. Historical NHI/TFDA catalogs remain in `data/products/{herbal,supplements}` for offline verification, generated only with `prepare-drug-assets.mjs --include-archived-catalogs`; the default build removes generated `frontend/public/product-data`. Supplement education content remains published. Do not restore these search features without a new user request.
- Western product details retain the bottom `前往 TADA 核對商品` link; per-ingredient TADA references, audit metadata and derivation prose are not displayed. Preserve raw provenance and clinical-review flags in source data, and do not relabel pending records as professionally approved.
- Terminology: use 運動禁藥管制／防制 (not 反禁藥); S1 合成代謝劑, S5 利尿劑與掩蔽劑, S9 糖皮質激素. `scripts/rebuild-dataset.mjs` `unifyCategory` normalizes case-category spellings.
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
| `/api/tue/*` | `tue.js` | `GET /tue/substances` (structured drug list from `substances.json`) + POST `/tue/check` drug eligibility checker (50 drugs, alias-aware, returns structured `prohibition`/`routes`/`tueEligible` fields) |
| `/api/health` | `server.js` | Health check (used by zeabur.json) |

## Commands

```bash
npm run install:all          # Install root + backend + frontend deps
npm run dev                  # Legacy backend with Node watch, port 8080
npm run dev:frontend         # Vite dev server (port 5173)
npm run build                # Build frontend (cd frontend && npm install && npm run build)
npm start                    # Production server (node server.js, port 8080)
cd frontend && npm run lint  # ESLint (frontend)
npm test                     # Backend integration tests (vitest + mongodb-memory-server)
cd frontend && npm test      # Frontend utils unit tests (vitest)
npm run knip                 # Dead-code / unused-deps scan
npm run check:budget         # Initial JS/CSS gzip budget after build
npm --prefix frontend run test:browser # Read-only Chromium/WebKit journeys
```

## Environment Variables

For the current Pages read-only local quick start, no account, secret, `.env`, or MongoDB is required. Use the root README and `wrangler pages dev` after a build. Local feedback needs local D1 migrations.

Legacy Express only: required `MONGODB_URI`; optional `PORT` (default 8080), `JWT_SECRET`, `CORS_ORIGIN`. The root `.env.example` mixes legacy and optional mail settings; do not copy it as a prerequisite for the Pages demo. Production mail configuration is documented in `docs/feedback-operations.md`.

## Dev vs Prod API Connection

- **Dev**: Vite dev server on `:5173`; `api.js` calls `http://localhost:8080/api` (override with `VITE_API_PORT`). So run `npm run dev` (backend on 8080) alongside `npm run dev:frontend` for a full local stack.
- **Production**: Cloudflare Pages serves static HTML/assets and same-origin Pages Functions. Express port 8080 applies only to the legacy deployment.

## Deployment (Cloudflare Pages — production)

- Production is Cloudflare Pages project `antidoping-platform` (Direct Upload) + Pages Functions in `functions/` (static data bundled at build; D1 only for feedback). See `wrangler.toml`.
- **Push to `main` auto-deploys** via `.github/workflows/deploy.yml`: lint → all tests / local migration → `cf:build` → asset budget / Chromium+WebKit browser gates (GIT_SHA stamped into `version.json`) → `wrangler pages deploy` → waits until live `version.json` sha == commit → read-only smoke. Docs/`*.md`-only pushes are skipped; rerun manually with `workflow_dispatch`.
- Secrets in GitHub: `CLOUDFLARE_API_TOKEN` (Pages: Edit), `CLOUDFLARE_ACCOUNT_ID`. Manual fallback: `npm run cf:deploy`.

## Legacy Deployment (Zeabur, pre-2026-09-19)

- Multi-stage Dockerfile included (frontend-build → backend-deps → production)
- `zeabur.json` configures build/start commands and health check on `/api/health`
- Unified server serves API + static frontend on same port
- MongoDB URI must be set in Zeabur environment variables
- Runs as non-root user (uid 1001) in Docker

## Data Seeding

40+ seed/import scripts in `backend/` for populating case data. Example: `node backend/add_comprehensive_cases_batch1.js`. Scripts organized by era (1980s, 1990s EPO, 2000s BALCO) and sport (MLB, NBA, weightlifting).

## Gotchas

- **The mounted data routes are `casesFixed.js` / `statsFixed.js`** (wired in the root `server.js`). The old `backend/routes/cases.js`, `stats.js`, the stale `backend/server.js` entry point, and `frontend/src/services/mockData.js` were all **deleted in 7eab93e** — the real server is the root `server.js`; no unused route/mock duplicates remain.
- Data routes query through the shared native `MongoClient` in `backend/db.js` (`getDb()`), not Mongoose models — don't call `Case.find()` in handlers. `db.js` connects once at module load; each handler still guards with `if (!getDb()) return 500` since the connection is async. **`server.js`'s separate Mongoose connection stays** — it registers `Case.js` so indexes get built; don't remove it.
- `statsFixed.js` has complex `$addFields`/`$switch`/`$regexMatch` pipelines for ban duration categorization.
- The prod frontend build strips `console.log`/`info`/`debug` via terser `pure_funcs` (vite.config.js) but keeps `console.error`/`warn` for diagnostics; backend route files no longer print debug connection logs.
- `server.js` sets a custom helmet CSP allowing `frame-ancestors` for `*.blogspot.com`/`*.blogger.com` and `frameguard: false` — this is intentional, to let the site be embedded in Blogger iframes. Don't revert it.
- Middleware order in `server.js`: helmet → compression → CORS → rate limit (200 req/15min on `/api/*`) → JSON parser → routes → static files → SPA catch-all.
- CORS in production defaults to `false` (blocks all cross-origin) unless `CORS_ORIGIN` is set (comma-separated list).
