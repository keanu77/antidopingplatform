# Release evidence — 2026-10-23

PR: https://github.com/keanu77/antidopingplatform/pull/6

## Production — verified

- Public site: https://antidopingplatform.sportsmedicine.tw
- Released SHA: `af8a47f2ff3f6319f65648997d6cb322a251ff64`. The live version, public health, S5 data, primary HTML pages and 517 cases match; [read-only result](production-check.json), checked 2026-10-22 18:13 UTC / 2026-10-23 02:13 Asia/Taipei.
- Immutable Cloudflare deployment: https://f473c1d9.antidoping-platform.pages.dev
- [Production workflow 39826544387](https://github.com/keanu77/antidopingplatform/actions/runs/39826544387), attempt 2: **success**, including tests, build, budget, HTML, 63 browser checks, deploy, live SHA and read-only smoke. [CI browser/build artifact](https://github.com/keanu77/antidopingplatform/actions/runs/39826544387/artifacts/12447298651), subject to 14-day artifact retention.
- Separate full browser run **against the public production domain**: **63/63 passed**, 21 each in desktop Chromium, Pixel Chromium and iPhone WebKit. Includes role tasks, quiz completion/retry, sources, keyboard/ARIA, serious/critical axe checks, overflow, print visibility, expiry, storage failures and metadata. This does not certify all WCAG requirements or physical-device coverage.
- Separate production read-only API smoke: **18/18 passed**. Browser tests intercept `/api/feedback`; API smoke uses `SKIP_WRITE=1` and only exercises non-writing validation/honeypot paths. No real feedback or email was sent.
- Direct production visual review: [desktop home](screenshots/production-home-desktop.png), [Android coach learning](screenshots/production-learning-android.png). These are actual public-site captures. [Structured validation record](production-validation.json).
- [Manual read-only monitor 39829286781](https://github.com/keanu77/antidopingplatform/actions/runs/39829286781): **success**, SHA `af8a47f`, 517 cases and 18/18 smoke. The six-hour schedule is configured; its natural execution has not been observed.
- Deployment attempt 1 was cancelled before deployment after Ubuntu's Azure package mirror stalled browser dependencies for over eight minutes. The same SHA passed the full workflow on retry; no test gate was skipped.

## Production D1 cutover

Before migration, read-only production evidence showed complete legacy 0002 schema, an empty migration ledger and six retained feedback rows with IDs 1–6. A D1 Time Travel bookmark was captured privately in `/private/tmp/antidoping-d1-before-0003-bookmark.json`; counts in `/private/tmp/antidoping-d1-before-0003-counts.json`. No feedback contents were exported or published. An available bookmark is not a tested restore.

The verified legacy schema was baselined as 0001/0002 before applying additive 0003. The production ledger now contains `0001_feedback.sql`, `0002_feedback_fields.sql` and `0003_feedback_delivery.sql`. Post-deploy metadata confirms all six rows remain, no new feedback arrived during cutover, `legacy_through_id=6`, `cursor_id=6`, no pending batch and no claimed provider success. See [privacy-safe D1 result](production-d1.json).

Historical feedback delivery remains unconfirmed and is not automatically replayed. Required Pages secret names were confirmed without reading values. Authenticated production status, real digest sending and inbox delivery were not tested. Operational recovery and reconciliation: [feedback-operations.md](../../feedback-operations.md).

## Reviewed preview and implementation checks

- Preview code SHA: `c9afa2524fd404b6ff8c69f9b088f9936c9fb36f`.
- Cloudflare preview: https://7b49e7a3.antidoping-platform.pages.dev
- Preview browser gate **63/63**, read-only API smoke **18/18**, live SHA and 517 cases passed. The monitoring script initially required zh-TW; b716755 corrected it to accept valid zh-Hant and saved evidence, without changing UI/API payloads.
- Preview visual review: [desktop home](screenshots/home-desktop.png), [iPhone coach learning](screenshots/learning-ios.png), [Android quiz](screenshots/quiz-android.png).
- Latest PR CI [39824324851, attempt 2](https://github.com/keanu77/antidopingplatform/actions/runs/39824324851): success. Its first attempt was also cancelled for the slow Ubuntu package mirror; the unchanged commit passed on retry.
- Frontend 119, Express 91, Node contracts 105 and real local D1 migration 4 tests passed; lint, build and built HTML checks passed for 15 static routes and 517 cases.
- Initial JS gzip 126,430 bytes; CSS gzip 10,942 bytes. Build/lab measurements only. npm audit root/frontend/legacy backend all zero findings at release preparation on 2026-10-23.
- B/C/D independent spec and quality reviews passed. Scope and limitations: [implementation.md](implementation.md).

## Workspace isolation and remaining evidence

The original checkout contains separate, concurrent TFDA drug-search work. Its fast-forward was aborted before any merge or dependency installation; those edits and untracked materials were preserved. This release and its records use `/private/tmp/antidoping-next-20261023`. Do not reset or overwrite the original checkout to synchronize this release. Its local main remained `5495d6d` when checked; remote main contains this release. Documentation-only commits do not deploy, so the live SHA should match the latest successful deployment, not every later documentation commit.

Six drug ingredients and 69 legacy questions still require source completion; their unresolved status is visible and definitive answers are withheld. 2027 rules are published but not activated. Named professional signoff, conflicts disclosures, real three-role user/learning research, field CWV, natural monitoring/digest execution, inbox delivery and historical email reconciliation remain unverified. See the [measurement plan](measurement-plan.md); automated tests are not substitutes for those results.
