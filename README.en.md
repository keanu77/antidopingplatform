# Anti-Doping Education Platform

A Traditional Chinese toolkit for athletes, coaches, and healthcare professionals: look up medicines licensed in Taiwan, explore anti-doping cases, and practice medication and therapeutic use exemption (TUE) scenarios.

**[Live website](https://antidopingplatform.sportsmedicine.tw/) · [Medicine lookup](https://antidopingplatform.sportsmedicine.tw/drug-search) · [繁體中文](README.md)**

[![Medicine lookup demo: search a product, inspect ingredients, and check use conditions](docs/launch/demo.gif)](https://antidopingplatform.sportsmedicine.tw/drug-search)

No sign-up is required. The site is for education and preliminary checks. Missing results or unresolved conditions do not establish permission to use a medicine. Results do not replace formal medication verification or TUE approval. The website interface is in Traditional Chinese; this README provides English setup and project documentation.

## What you can do

| Entry point | Task |
| --- | --- |
| [Medicine lookup](https://antidopingplatform.sportsmedicine.tw/drug-search) | Search by Chinese or English product name, ingredient, or license number; inspect the full composition and select route, sport, and date to review in-competition and out-of-competition conditions |
| [Case search](https://antidopingplatform.sportsmedicine.tw/cases) | Filter cases by sport, year, substance, and other fields; read context and sources |
| [TUE tools](https://antidopingplatform.sportsmedicine.tw/tue?tab=tools) | Practice identifying medication and therapeutic use exemption scenarios that need further verification |
| [Role-based learning](https://antidopingplatform.sportsmedicine.tw/learning) | Use task lists and quizzes for athletes, coaches, and healthcare professionals |
| [Source center](https://antidopingplatform.sportsmedicine.tw/sources) | Inspect educational sources, versions, and pending verification status |

**Product lookup covers Western medicines only.** Herbal medicine and supplement search have been retired. [Supplement safety education](https://antidopingplatform.sportsmedicine.tw/education?tab=supplements) remains available. Historical herbal and food snapshots are retained for offline research and are excluded from ordinary production builds.

### Try one product

Enter `衛署藥製字第056706號` in medicine lookup, open the product, inspect all ingredients, and then select the actual conditions of use. A TADA product-verification link remains at the bottom. The demo uses public product records, with no patient information or personal medication history.

## Run locally

Requirements: Git, **Node.js 22.13.0 or later**, and npm. Initial installation requires internet access. Wrangler is pinned in the project dependencies. This quick start needs no Cloudflare account, API key, `.env` file, or MongoDB server.

```sh
git clone https://github.com/keanu77/antidopingplatform.git
cd antidopingplatform
npm ci
npm --prefix frontend ci
npm run cf:build
npx --no-install wrangler pages dev frontend/dist --ip 127.0.0.1 --port 8788
```

Open **http://127.0.0.1:8788**. This serves both the frontend and Pages Functions API. The medicine search index loads on first use. Run `npm run cf:build` again after frontend edits; stop the server with `Ctrl+C`.

These steps were exercised in a fresh Ubuntu 24.04 environment; see [installation verification](docs/launch/verification.md) for the environment and scope.

To test feedback storage locally, first run `npm run cf:migrate` in another terminal. It creates or updates local D1 only by default. Reading content, looking up medicines, and using educational tools do not need that step. Use synthetic feedback without patient information.

Vite alone does not serve the production API. `npm run dev` starts the retained Express/MongoDB implementation. See the [development guide](docs/development.md) for verification commands and troubleshooting.

## Architecture and data locations

```text
frontend/                 React 19, Vite, Tailwind; in-browser medicine search
functions/                Cloudflare Pages Functions API
data/cases.json           Educational cases
data/drugs/               TFDA medicine snapshot and source manifest
backend/data/             Shared educational content, ingredient rules, evidence
shared/                   Source validity and rule-year checks
scripts/                  Import, build, update, and verification tools
docs/                     Maintenance guides and historical review records
```

Production runs on Cloudflare Pages and Pages Functions. Case, education, and TUE read data are bundled at build time; medicine assets are generated from versioned snapshots. **D1 stores feedback and delivery state, not the medicine catalog.** Express/MongoDB remains for legacy use and integration tests.

Monthly medicine updates produce candidate snapshots, diffs, and quality reports for review before a separate release. The cadence can be quarterly. WADA rules require annual review; refreshing product data does not extend rule validity. See [medicine data maintenance](docs/drug-maintenance.md).

## Sources and scope

Medicine products and compositions come from TFDA open data. Rules retain provenance and review status. This independently built tool is not TADA's original database or an official approval service. Ingredient-name matching coverage is not classification accuracy.

Cases include violations, contamination, legitimate TUE use, and reversals; case counts are not counts of violations or affected athletes. Existing evidence is preserved in the [case review history](docs/data-review-history.md) and [medicine research records](docs/research/2026-10-23-drug-system/README.md).

Project code retains its existing [MIT license](LICENSE.md). Third-party data, rule documents, quoted material, and brands remain subject to their original terms. See [data sources and licensing scope](docs/data-sources.md).

## Contribute and maintain

- Feature requests, interface bugs, and source-backed data corrections: [open an issue](https://github.com/keanu77/antidopingplatform/issues/new) and read [CONTRIBUTING.md](CONTRIBUTING.md).
- Vulnerabilities or exposed credentials: [report privately](https://github.com/keanu77/antidopingplatform/security/advisories/new) and read [SECURITY.md](SECURITY.md).
- [Changelog](CHANGELOG.md), [feedback and release operations](docs/feedback-operations.md), and [current search-scope verification](docs/research/2026-10-23-drug-system/western-only.md).

The deployment workflow checks the version, build, API, and desktop/mobile browser journeys. These engineering checks do not establish clinical approval or real-user research results.
