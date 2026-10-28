# Local verification — 2026-10-28

Environment: Windows PowerShell workspace, Node v24.18.0, npm available. No `.env` or `YOUCAM_API_KEY` was present. No personal photo was used.

## Observed checks

| Command / action | Result | What it proves |
|---|---|---|
| `npm test` | **PASS**, 5 tests, 5 passed, 0 failed | Deterministic config validation, parser contract behavior, and server-side missing-key preflight. Parser tests use isolated score-shape fixtures; they are not live API records. |
| `node --check src/server.js`; `node --check src/youcam.js`; `node --check web/app.js` | **PASS**, exit 0 | JavaScript syntax is valid for these source files. |
| `npm start`, then GET `/` | **PASS**, HTTP 200 `text/html` | Local app starts and serves the web page. |
| GET `/favicon.svg` | **PASS**, HTTP 200 `image/svg+xml` | Local static asset is served. |
| GET `/api/status` | **PASS**, HTTP 200, `{"configured":false,"provider":"YouCam Skin Analysis v2.1"}` | Missing credential is reported honestly. |
| Consent-bearing POST `/api/analysis` with no key | **PASS**, HTTP 503, code `API_KEY_MISSING` | The app fails closed before contacting YouCam; no case is created. The supplied tiny JPEG signature was not uploaded to YouCam. |
| `docker compose -f compose.yaml -f compose.e2e.yaml --profile test config` | **PASS**, exit 0 | Compose configuration parses and the E2E override blanks `YOUCAM_API_KEY`. No image build or container ran. |

## Blocked checks

- Live YouCam upload/task/result: **BLOCKED**, no API key and no consented selfie were supplied. Zero provider requests have been made.
- `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`: **BLOCKED**, npm returned `ENOTCACHED` because the pinned Playwright package was not available in the local cache and registry access is unavailable.
- `npm run test:e2e`: **BLOCKED**, `playwright` is not installed (`not recognized as a command`).
- Docker engine: current context is `desktop-linux`. `docker info --format ...` failed with `permission denied` on `npipe:////./pipe/dockerDesktopLinuxEngine`. No context switch or daemon restart was attempted.
- Headless Chrome/Edge screenshot attempt: **BLOCKED**. The browser process emitted Windows access-denied errors while starting Crashpad/Mojo and wrote no screenshot. No screenshot artifact was kept.
- Interactive browser/device inspection, print dialog, hosted deployment, public repository, demo video, and Devpost submission: **NOT RUN**.

No result in this file establishes YouCam output quality, successful live integration, user impact, clinical usefulness, or submission completion.
