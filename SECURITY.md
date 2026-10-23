# Security policy

## Report privately

Report a vulnerability through [GitHub private vulnerability reporting](https://github.com/keanu77/antidopingplatform/security/advisories/new). Include the affected commit or URL, steps to reproduce, expected impact, and a minimal proof of concept using synthetic data. Redact credentials and personal information.

Do not put vulnerabilities, secrets, feedback records, patient information, or email payloads in public issues. Ordinary interface bugs and source-backed content corrections can use [issues](https://github.com/keanu77/antidopingplatform/issues). Medical content questions and TUE decisions are not security reports.

## Maintained versions

Security fixes target the current default branch and the latest release. Older snapshots have no separate maintenance commitment. Rule-year validity and clinical review status are independent of software version; an updated application does not make expired medical rules current.

Reports are handled on a best-effort basis; no fixed response time or bug bounty is promised.

## Configuration and sensitive data

The read-only local demo needs no secret. Production feedback uses D1, while email and deployment use separately provisioned credentials. Keep these out of source control, screenshots, public logs, demo recordings, and browser bundles:

- Cloudflare API tokens and deployment credentials.
- Resend API keys and cron authentication secrets.
- Feedback text, contact details, delivery batches, and email payloads.
- MongoDB connection credentials if operating the legacy backend.

A Cloudflare account or database identifier alone is not an authentication secret, but forks must provision their own resources before remote deployment.

## If a credential is exposed

1. Revoke the exposed credential at its provider and issue a replacement with the minimum required scope.
2. Update the deployment secret store and dependent jobs. Follow provider instructions for activation and redeployment.
3. Check access/provider logs and validate authorized behavior without printing the replacement secret.
4. Remove the exposed value from files and logs. Deleting a Git line does not revoke a credential or erase its history; coordinate any history rewrite with maintainers.

For cron or email credentials, coordinate rotation with the configured caller and preserve the existing delivery ledger. Do not trigger a real feedback digest merely to test a rotation. Do not reset D1 or delete feedback as a recovery shortcut. See [feedback operations](docs/feedback-operations.md).

## Safe verification

Use a local clone and synthetic data for write tests. Public-site checks should be read-only and rate-limited. The browser suites block feedback submissions; the API smoke script supports `SKIP_WRITE=1`. Do not scrape private feedback, send real mail, or test destructive database operations.
