# Skin Casefile

Skin Casefile is a consumer record for a skin concern: it pairs actual YouCam Skin Analysis readings with dates and context the user enters, then presents a timeline and print-ready summary. The goal is to make a concern easier to describe to a qualified professional, not to diagnose it or claim that a product caused a score change.

## Status

**Local prototype implemented; live integration unverified.** `npm test` passes 5/5 checks, and the app was started over HTTP with its missing-key path observed returning 503 `API_KEY_MISSING`. No YouCam API call has been made. A live run is blocked until a legitimate `YOUCAM_API_KEY` and a consented selfie are available. No mock results or sample records are shipped.

## Project records

- [Hackathon analysis](docs/hackathon-analysis.md)
- [Requirements and rubric matrix](docs/rubric-matrix.md)
- [Competitive analysis](docs/competitive-analysis.md)
- [Dependency audit](docs/dependency-audit.md)
- [Deployment](docs/deployment.md)
- [Demo and pitch](docs/demo-and-pitch.md)
- [Workspace forensics](docs/PROJECT_FORENSICS.md)
- [Evidence index](evidence/README.md)
- [Claim-to-behavior ledger](docs/claim-to-behavior.md)
- [Security review](docs/security-review.md)
- [Local evidence](evidence/local-checks-2026-10-28.md)

## Event

YouCam API Skin AI & eCommerce VTO Hackathon. Official submission deadline: **November 2, 2026, 11:45 a.m. Eastern Time**. Submission requires a working YouCam integration, repository, description, screenshots, and a public 1–3 minute demo video. See the [official rules](https://youcam-api-skin-ai-ecommerce.devpost.com/rules).

## Run

```powershell
Copy-Item .env.example .env
# Edit .env and set YOUCAM_API_KEY from the YouCam API console.
npm start
```

Then open http://localhost:3000. Setup is only complete after a real result is received; without a key the app must show an honest blocked state.

## Checks

```powershell
npm test
docker compose -f compose.yaml -f compose.e2e.yaml --profile test up --build --abort-on-container-exit browser-tests
```

`npm test` runs dependency-free parser, environment-validation, and missing-key preflight checks. The containerized Playwright suite requires Docker Compose and a working npm registry connection. It deliberately runs without a YouCam key and does not claim a successful provider result.

## License

No license has been selected. Choose one before making this repository public.
