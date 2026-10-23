# Repository launch assets

The live demo is the existing [Cloudflare website](https://antidopingplatform.sportsmedicine.tw/drug-search). A second GitHub Pages site is not provisioned: this application needs Pages Functions for its API, and the working public site already supplies the demonstration.

| Asset | Purpose |
| --- | --- |
| [demo.gif](demo.gif) | README preview; under 6 MB |
| [demo.mp4](demo.mp4) | Full 1280×720 recording, under 45 seconds |
| [teaser.mp4](teaser.mp4) | 12-second clip for sharing |
| [social-preview.png](social-preview.png) | 1280×640 GitHub social preview |
| [demo-product.png](demo-product.png) | Static screenshot with readable ingredient detail |
| [share-drafts.md](share-drafts.md) | Unpublished X and Facebook drafts |
| [release-notes.md](release-notes.md) | GitHub release description |
| [verification.md](verification.md) | Scope and verification evidence |

The demo searches public license `衛署藥製字第056706號`, opens the product, selects the oral route, reviews ingredients and conditions, and shows the TADA verification link. It records the real interface; title and closing cards are added for context. It does not demonstrate TUE approval or recommend the medicine. Capture source/version and browser errors are recorded in `demo-capture.json`; media dimensions, duration, and size are in `media-info.json`.

## Re-record

Install the repository dependencies, Playwright Chromium, and ffmpeg. Run from the repository root on a system with Traditional Chinese fonts:

```sh
npm --prefix frontend exec -- playwright install chromium
node docs/launch/capture-demo.mjs
python3 docs/launch/encode-media.py
```

The script uses a fresh headless browser, blocks feedback writes, and saves raw video under `/tmp/antidoping-launch-video`. It visits the public site without credentials and does not submit feedback or send mail. Inspect the rendered image and the video before publishing a replacement.

The social image is rendered from `social-preview.html`. Upload `social-preview.png` in **GitHub repository Settings → General → Social preview**. Generating or committing the file alone does not apply that repository setting. Social posts are drafts for the owner to publish.
