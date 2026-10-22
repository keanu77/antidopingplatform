# Release evidence — 2026-10-23

PR: https://github.com/keanu77/antidopingplatform/pull/6

## Reviewed preview

- Code SHA: `c9afa2524fd404b6ff8c69f9b088f9936c9fb36f`.
- Cloudflare immutable preview: https://7b49e7a3.antidoping-platform.pages.dev
- Browser gate: **63/63 passed**, desktop Chromium, Pixel Chromium and iPhone WebKit. Tests include functional journeys, keyboard/ARIA, serious/critical axe checks, responsive overflow, print visibility, 2027 expiry and storage failures.
- Read-only API smoke: **18/18 passed**. Monitoring script confirmed SHA and 517 cases. Its first run incorrectly required zh-TW; corrected to accept the site's valid zh-Hant language. This monitor-only correction does not alter the deployed UI/API payload.
- Direct visual review: [desktop home](screenshots/home-desktop.png), [iPhone coach learning](screenshots/learning-ios.png), [Android quiz](screenshots/quiz-android.png). These are actual preview captures, not design mockups.
- Build budget: initial JS gzip 126,430 bytes; CSS gzip 10,942 bytes. Lab/build measurements only.
- Unit/contracts: frontend119, Express91, Node105; real local D1 migration4; lint and built HTML checks passed. npm audit root/frontend both zero findings at release preparation.

## Production cutover

Pending at this record's commit. Final production SHA, workflow, migration ledger and read-only checks will be appended after they actually complete.

Before migration, read-only production evidence showed complete legacy0002 schema, empty migration ledger, six retained feedback rows with IDs1–6. A D1 Time Travel bookmark was captured privately in `/private/tmp/antidoping-d1-before-0003-bookmark.json`; counts in `/private/tmp/antidoping-d1-before-0003-counts.json`. No feedback contents were exported or published. An available bookmark is not a tested restore.

No real feedback submission or email was sent by this release verification. Natural scheduler execution, inbox delivery, legacy email reconciliation, clinical signoff, field CWV and real-user learning research remain outside verified results.
