# Development and local verification

The [root README](../README.md) is the shortest path to a working local copy. Use Git and Node.js 22.13.0 or later, with the committed npm lockfiles. Both root and frontend dependencies are required. Python 3 is needed for data tools and Python tests, but not the ordinary website build.

## Current runtime

```sh
npm ci
npm --prefix frontend ci
npm run cf:build
npx --no-install wrangler pages dev frontend/dist --ip 127.0.0.1 --port 8788
```

The local Pages server provides `/api` without a MongoDB connection or Cloudflare login. Source snapshots and ingredient rules are versioned; building does not scrape TADA or fetch new medicine data. First-time package installation and optional browser installation require internet access.

For local feedback storage, run `npm run cf:migrate`. It uses local D1 by default; read [migration operations](d1-migrations.md) before any existing-database or remote action. Do not add `--remote` to test instructions.

`npm run dev` and the root `.env.example` belong to the retained legacy Express/MongoDB workflow and optional mail operations. They are not prerequisites for this quick start. Vite's standalone server and preview do not emulate Pages Functions.

## Checks

```sh
npm --prefix frontend run lint
npm run test:frontend
npm run test:api
npm run test:rules
npm run cf:build
npm run check:budget
npm run check:html
```

For browser journeys:

```sh
npm --prefix frontend exec -- playwright install chromium webkit
npm --prefix frontend run test:browser
```

On Linux, install browser system dependencies with `playwright install --with-deps chromium webkit` using the same npm prefix. Playwright starts a local Pages server on port 8791 and blocks feedback submissions. Build first, and keep that port free. Its report is `frontend/playwright-report/index.html`.

For changes to shared data, migrations, or import logic, also run the relevant suites:

```sh
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/*.test.mjs
npm run test:migrations:local
npm test
```

`npm test` exercises the legacy backend and may download a MongoDB test binary. Node drug-worker tests generate temporary public assets: run them **before** the final `cf:build`, not concurrently. The final build removes archived herbal/supplement assets. This JavaScript project has no separate TypeScript check configured.

With the local Pages server running, read-only API checks are:

```sh
SMOKE_BASE_URL=http://127.0.0.1:8788 SKIP_WRITE=1 npm run smoke
```

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Node engine or Vite startup error | Run `node --version`; use Node 22.13.0 or later and reinstall with the lockfiles |
| Missing Vite, Wrangler, or frontend package | Run both `npm ci` and `npm --prefix frontend ci` from the repository root |
| API returns HTML or fails on port 5173 | Use the built site with `wrangler pages dev` for production parity |
| Feedback returns 503 locally | Initialize local D1 if testing storage; browsing does not require feedback writes |
| Medicine data does not load | Wait for the first index download; inspect network errors and rebuild with `npm run cf:build` |
| Unknown ingredient, unresolved conditions, or expired year | This is an intentional data/rule boundary; do not change it into permission to use |

## Deploying your own copy

Use your own Cloudflare Pages project and, if needed, your own D1 database. Update the account-specific deployment targets and database binding before remote commands. The included workflow and `cf:deploy` target the maintainer's production project, not an automatically provisioned fork. Optional email requires separately configured secrets; see [feedback operations](feedback-operations.md).

Changes to application files on `main` trigger the production workflow. Documentation-only changes are excluded by the workflow's path filters. A Git commit or successful build is not deployment proof: compare the intended SHA with `/version.json`, then run read-only behavior checks.
