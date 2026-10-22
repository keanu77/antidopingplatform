# Feedback delivery and release operations

Production is Cloudflare Pages project `antidoping-platform`; D1 binding `FEEDBACK_DB` points to `antidoping-feedback` (`7a941144-246f-4316-966a-b76f02fc9bf6`). Do not publish feedback rows, secrets, contact details or email payloads in logs or review artifacts.

## Request and local retention

The browser reuses a random request ID for retries of the same payload. D1 enforces uniqueness; matching retries succeed without another insert, a changed payload with the same ID returns 409. Older clients without an ID still work but cannot promise deduplication. Rate limiting remains active for new submissions.

Offline feedback expires after seven days, is capped at 20 records and can be cleared from the feedback bar. The queue re-reads current storage after each request so it neither overwrites concurrent additions nor sends not-yet-started entries after clearing. An already in-flight request cannot be recalled. Browser-generated page snapshots exclude URL query/hash. The user should not include medical information; old feedback may contain personal information and must remain access-controlled.

D1 feedback is not automatically deleted by this change. Choosing a server retention period and privacy owner remains an operator policy task. Do not silently delete legacy evidence or claim a retention policy that has not been implemented.

## Cursor, uncertainty and retry

Migration 0003 adds nullable `request_id`, its unique index and the singleton `feedback_delivery` state. It seeds both `legacy_through_id` and `cursor_id` at the highest existing feedback ID. Rows at or below this cutoff are **legacy with unconfirmed delivery**, retained and not automatically re-sent. The former time-window endpoint has no historical delivery ledger; a successful migration cannot reconstruct it. Record the migration/deploy cutover times, and reconcile any old scheduler invocation during that interval before claiming end-to-end duplicate prevention across the cutover.

New rows are selected by ID above the acknowledged cursor, not a 24-hour time window. Each invocation sends at most 100 records, additionally capped at 750,000 UTF-8 bytes of saved JSON to fit D1. A backlog may require several ordinary scheduler invocations. The complete message, recipient, sender and idempotency key are saved before contacting the provider, so a retry cannot change the message or pick up new rows. A 60-second lease prevents concurrent senders; sending uses a renewed lease and a 15-second provider timeout. Only a confirmed provider message ID advances the cursor. Provider acceptance is not proof of inbox delivery.

[Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys) expire after 24 hours. This implementation stops uncertain retries at 23 hours. It returns `reconciliationRequired` rather than generating a new key and risking duplicate email. Do not reset `first_attempt_at`, clear `pending_json`, lower the cursor or issue a new key to bypass this stop.

For reconciliation, an authorized operator compares the preserved batch key/time/provider records. If accepted, confirm the original recipient/content and record the provider ID before advancing exactly to that batch's `endId` in one conditional transaction. If definitive non-acceptance is established, document that evidence and use a separately reviewed recovery operation. If uncertain, keep the batch blocked. This release intentionally provides no unaudited force-resend button.

`GET /api/cron/feedback-status` requires the existing cron secret, returns `no-store` metadata only (cursor, legacy count, unsent count, pending/lease/last success and reconciliation flag), and does not send email. Keep the secret in the established secret store. `/api/cron/feedback-digest` is a real send operation, not a health check. Public monitoring and browser suites never invoke it.

## Schema cutover

1. Run `npm run cf:migrate:status -- --remote`; compare the actual schema and ledger with the intended target. Save a D1 Time Travel bookmark (`wrangler d1 time-travel info antidoping-feedback --json`) privately and note the time. Do not assume a restore has been tested.
2. For the verified legacy 0002 schema with an empty ledger, run `npm run cf:migrate:baseline -- --remote --through=0002`. The helper compares actual SQL before recording history; it does not alter feedback. Unknown schemas stop.
3. After code, synthetic migration tests and preview pass, apply `npm run cf:migrate -- --remote` once, then re-run status and confirm all three names. Compare aggregate row count/ID range only; do not expose row contents. The additive schema remains compatible with the previous code.
4. Publish the reviewed code promptly and verify `/version.json`, public journeys and authenticated read-only status when credentials are available. Record any scheduler/cutover uncertainty. Do not test with real feedback or a real email.

## Release, monitoring and rollback

PR/main workflows run lint, frontend + legacy backend + Pages contract tests, local migration tests, production build, gzip budgets and desktop Chromium / mobile Chromium / mobile WebKit journeys. Reports are retained 14 days. Playwright checks keyboard tabs, query retry, source links, meaningful case HTML/404, role learning and quiz behavior; axe catches automated serious/critical failures. These checks do not certify full WCAG conformity or replace assistive-technology/user testing.

The read-only monitoring workflow runs every six hours and can be manually dispatched; it checks the live revision format, Pages API and primary pages. GitHub workflow failures use repository notification settings. A successful manual run does not establish that natural scheduled runs have occurred. Drug rule expiry should trigger maintenance; do not weaken checks to hide an outdated rule version.

The build enforces initial gzip JS <= 200 KB, initial CSS <= 40 KB and each JS chunk <= 300 KB. Browser navigation timings are lab diagnostics without a network/CPU-throttled field population; they are not Core Web Vitals. No medication terms or patient data are sent to analytics by these additions.

If a regression occurs, redeploy a reviewed known-good Pages artifact and verify its SHA plus read-only smoke. Leave additive D1 columns/tables and the ledger intact. Reverting to the old digest implementation loses new delivery semantics: pause/reconcile that sender before relying on it. A destructive D1 restore is a separate action because it can erase feedback received after the bookmark; prefer a forward correction. Never delete migration history to force reapplication.
