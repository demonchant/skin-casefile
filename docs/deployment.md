# Local deployment

## Requirements

- Node.js 22.9 or newer (`npm start` uses Node's built-in optional `.env` loader).
- A Perfect Corp YouCam API account and key for live analysis. A key is a user-supplied prerequisite and is not created by this app.
- Docker Engine and Compose are needed only for the containerized browser acceptance suite.

## Run

1. Copy `.env.example` to `.env` and set `YOUCAM_API_KEY` (or export the variables in your shell).
2. Start with `npm start`.
3. Open `http://localhost:3000`.
4. Give explicit upload consent and choose a front-facing JPEG/PNG, under 10MB, with short side at least 480px.
5. Keep the browser open while the asynchronous task is polled. Only a real successful API result creates a scan record.

If the key is absent or invalid, live analysis must show blocked/error state. No demo data or simulated result is provided. Notes already saved in this browser remain available after a failed scan. The local server caps each browser session at 10 scan attempts per 24 hours and two active tasks. This local prototype guard is not sufficient abuse protection for a public multi-user deployment.

## Environment

See `.env.example`. Keys stay in the Node process and must not be placed in static files, browser storage, logs, public screenshots, or deployment build arguments. `HOST` defaults to loopback. Containerized deployment sets it to `0.0.0.0` inside the container. Set `COOKIE_SECURE=true` only behind HTTPS; local HTTP testing keeps it false.

## State and privacy

Scan result values and user-authored context are stored in browser localStorage on that device. The original selfie is transferred to YouCam and not saved by this app. Perfect Corp's API policy says uploaded data is generally retained for 30 days after a completed session; read the linked policy in the app before consenting. Clearing browser storage removes the local case. This prototype has no sync or recovery; do not enter someone else's sensitive information without permission.

## Deployment status

The app starts locally and its missing-key state has been exercised over HTTP. `docker compose config` validates the Compose model. A real YouCam run is **BLOCKED** until an API key and consented image are available. Public hosting, HTTPS, production logging policy, account registration, and submission are **UNKNOWN / PLANNED**. The selected Docker context is `desktop-linux`; `docker info` fails with permission denied on the Docker Desktop engine pipe, so container build and browser execution are **BLOCKED** in this environment.

## Browser acceptance suite

With Docker Engine and Compose available, run the actual application plus Chromium through Compose networking:

```powershell
docker compose -f compose.yaml -f compose.e2e.yaml --profile test up --build --abort-on-container-exit browser-tests
docker compose -f compose.yaml -f compose.e2e.yaml --profile test down
```

The E2E override deliberately blanks the API key, so the browser suite verifies the honest blocked/error path without spending API units or fabricating a successful provider response. Tests cover empty state, privacy disclosure, accessible controls, narrow layout, reduced motion, and missing-key fail-closed behavior. They do not verify live YouCam success. The Playwright package and container image are pinned to 1.64.1. `npm install --package-lock-only` cannot reach the registry (`ENOTCACHED`), the Docker Desktop engine pipe denies access, and headless Chrome/Edge screenshot attempts failed on Windows process permissions. Browser checks and screenshots are **BLOCKED**, not passed.

