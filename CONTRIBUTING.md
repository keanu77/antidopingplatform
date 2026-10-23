# Contributing

Thank you for helping maintain the platform. Start with the [local quick start](README.en.md#run-locally) and [development checks](docs/development.md).

## Changes

- Open an issue for a reproducible interface bug, a focused feature proposal, or a source-backed content correction.
- Work on a separate branch and keep each commit focused. Preserve unrelated local work and historical research evidence.
- State the behavior changed, why it changed, and the checks actually run in the pull request. Include desktop/mobile screenshots for visible changes.
- Use the committed lockfiles. Avoid unrelated dependency upgrades, framework changes, generated catalogs, credentials, or personal data.

## Data and medical content

Provide the primary source URL, publication/version date, the affected record or license number, and the exact field to correct. Distinguish substance identity from its anti-doping status. Preserve all ingredients of a combination product and its route, dose, sport, and year conditions.

Missing information stays unresolved. Do not convert `pending` evidence into professional approval, extend an expired rule year, rewrite frozen validation results, or advertise matching coverage as accuracy.

Public product lookup covers Western medicines only. Herbal/supplement source archives remain available for offline research; supplement education remains public. Restoring retired search routes is outside the current scope.

## Validation and scope

Run checks appropriate to the change, using [the development guide](docs/development.md). Data-worker checks and the final production build must run sequentially because they write generated assets. Source or shared-rule changes need the corresponding data/API tests, not only a successful frontend build.

The Cloudflare deployment workflow runs on application changes to `main`. A fork should configure its own Pages/D1 targets before remote deployment. Local verification is not proof of production deployment or clinical review.

Use [private vulnerability reporting](SECURITY.md) for security issues, not public issues.
