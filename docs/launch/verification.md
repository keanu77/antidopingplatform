# Repo launch verification · 2026-10-23

The release packages the existing deployed application. It changes documentation and demonstration media, not application behavior, rule logic, source snapshots, feedback records, or production secrets.

## Clean installation

A new isolated OrbStack Ubuntu 24.04 ARM64 machine was created for this run. It did not share host files or credentials. The ordinary user cloned the public repository at `ed606f9806e76dfa33a8c4e861fcabede4fb858d` and followed the root/frontend npm install, build, and Pages startup steps. Node `v22.23.4` was downloaded from the official Node 22 distribution and checked against its published SHA-256; npm was `10.9.9`.

| Check | Result |
| --- | --- |
| Public clone, root `npm ci`, frontend `npm ci` | Exit 0; 12 s, 20 s, 2 s respectively |
| `npm run cf:build` | Exit 0; 7 s |
| Frontend lint | Passed |
| Frontend tests | 175 passed |
| Pages API contracts | 22 passed |
| Education/rule tests | 13 passed |
| Build budget and meaningful HTML | Passed |
| Local Pages `/api/health` | HTTP 200 |
| Read-only local smoke | 18/18 passed before initializing D1 |
| Optional local D1 migrations | All three migrations applied successfully afterward |

No Cloudflare account, API credential, `.env`, or MongoDB was configured. The root code and lockfiles tested are unchanged by this documentation release. The Mac launch worktree also completed a clean dependency installation and production build. The existing optional medicine/evidence chunks still produce Vite's large-chunk advisory; the established asset budget passed. No warning threshold was raised.

The VM `antidoping-launch-20261023` was stopped after evidence export and retained. Full step logs, timings, preparation scripts, and the exported archive are kept locally under `artifacts/drugs/repo-launch-20261023/`; the small result manifest is included here as [ubuntu-result.json](ubuntu-result.json). Stopping is not deleting the VM.

## Demo and repository scope

- A fresh Chromium session recorded the public site at code SHA `ca699133454a2c493e34ee216a572a35169853da`. The real lookup used license `衛署藥製字第056706號`; page errors were empty and feedback writes were blocked. The interface's unresolved and restriction messages were preserved.
- [Capture metadata](demo-capture.json) records the product, public site, actual version, and retained TADA link. [Media metadata](media-info.json) records a 26.7-second 1280×720 H.264 video, a 12-second teaser, an approximately 0.83 MB GIF, and a 1280×640 social image. The ingredient screenshot and social image were visually inspected. Chromium and WebKit both played the H.264 file to completion and loaded the GIF/social image; results are in [media-playback.json](media-playback.json).
- Chinese and English READMEs describe the same scope and quick-start commands. All 76 local Markdown links in the launch scope resolved before publication; two older broken research links were corrected. Historical review prose and its limitations were retained with explicit links to current maintenance guidance. No marketing claim uses patient counts, users, matching coverage as accuracy, or clinical approval.
- GitHub homepage and description now point readers to the current Western-medicine and educational scope. Twelve topics describe the current stack and use cases. Private vulnerability reporting was enabled and read back as `enabled: true`.
- The repository already declared MIT in `package.json` and README; the license file formalizes that declaration. Source documents and imported data remain under their original terms.

The 1280×640 social preview is prepared for the owner's GitHub Settings upload. X and Facebook texts are unpublished drafts. No posts, emails, actual feedback writes, or new clinical approvals were produced. The live demo remains the existing Cloudflare deployment; no duplicate GitHub Pages deployment was created.
