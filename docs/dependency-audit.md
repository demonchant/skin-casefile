# Dependency and integration audit

## YouCam Skin Analysis

| Item | Finding |
|---|---|
| Provider / docs | Perfect Corp YouCam API; [Skin Analysis v2.1](https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1), [File API](https://docs.perfectcorp.com/reference/file/paths/~1s2s~1v2.0~1file/post), [quick start](https://docs.perfectcorp.com/develop/quick_start_guide); checked 2026-10-28. |
| Authentication | Official guide says `Authorization: Bearer <API_KEY>`. Secret belongs server-side only. |
| Endpoint flow | POST `/s2s/v2.0/file` with file metadata → PUT binary to returned signed URL/headers → POST `/s2s/v2.1/task/skin-analysis` with `src_file_id`, homogeneous SD/HD `dst_actions`, `format: json` → GET task status until success/error. API host in official docs: `https://yce-api-01.makeupar.com`. |
| Planned inputs | SD `acne`, `redness`, `moisture`, `oiliness`; front-facing JPEG/PNG, under 10MB, short side at least 480px. Official docs price 1–4 SD concerns at 9 units on success. The app discloses this before consent; exact account billing remains to be observed. |
| Output contract | Async task ID then status/result. JSON format can expose result output with type, `ui_score`, `raw_score`, and mask URLs; parse only fields observed/documented. Preserve raw returned scores and source timestamp. Never infer score polarity until confirmed from official docs/observed response. |
| Failure behavior | Missing key, rejected photo, 4xx/429/5xx, task error/timeout, upload failure, invalid schema all remain errors. No fixture fallback or fabricated score. Retry only a user-initiated safe action; task call may consume units on success. |
| Privacy | Selfie uploaded to provider with explicit consent. The official [YouCam API Privacy Policy](https://www.perfectcorp.com/de/perfectbeauty/youcam/privacy-policy-api) and API terms §12.4 say uploaded client data is generally retained for 30 days after a completed session. The app discloses this and does not save the photo. Do not retain request logs with image or key. Review applicable local privacy law before public launch. |
| Live evidence | **BLOCKED:** no `YOUCAM_API_KEY` or consented selfie was supplied. No API request has been made. Endpoints/payload are **IMPLEMENTED / UNVERIFIED** only after code exists. |

## Runtime and third parties

Initial product uses Node built-ins and browser APIs only. Local environment observed Node v24.18.0; supported minimum is 22.9 for `--env-file-if-exists`. No external product catalog, LLM, analytics, auth provider, cloud database, or third-party image source is planned. Browser localStorage is local device state, not an account backup. Browser print-to-PDF is the export path; no PDF generation service is used.

`@playwright/test` is pinned to 1.64.1 as a development dependency and paired with the official `mcr.microsoft.com/playwright:v1.64.1-noble` image. npm registry access was unavailable, so a lockfile could not be generated and no package audit was run. This does not affect the dependency-free runtime but leaves browser-test dependency resolution unverified.

