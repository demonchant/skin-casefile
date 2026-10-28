# Claim-to-behavior ledger

| Claim / requirement | Required observable behavior | Code / evidence path | Status |
|---|---|---|---|
| Uses YouCam Skin Analysis | Authenticated File API upload, real v2.1 task, poll, parse actual requested score fields | `src/youcam.js`, `/api/analysis` routes in `src/server.js`; live evidence not yet captured | **IMPLEMENTED / UNVERIFIED**; key missing |
| Consent protects photo submission | Backend rejects without explicit consent; user sees provider/retention and unit cost before submitting | consent controls in `web/index.html`; check in `src/server.js` | **IMPLEMENTED / UNVERIFIED** |
| Image stays out of app storage | Request is buffered in memory and sent to signed upload URL; no file write or browser persistence | `src/server.js`, `src/youcam.js`; privacy copy in app | **IMPLEMENTED / UNVERIFIED**; inspect live run and logs before deployment |
| A case record is created from real measurements | Only terminal provider success and validated scores append an entry; provider failure keeps prior state | `web/app.js`; result parsing `src/youcam.js` | **IMPLEMENTED / UNVERIFIED**; no live success or browser run yet |
| Record persists on this device | Reload restores user-entered notes and actual score fields from localStorage | `web/app.js` `loadRecords`/`saveRecords` | **IMPLEMENTED / UNVERIFIED**; browser run pending |
| Score changes are not called cause or improvement | Display provider values and neutral point deltas; limitation is visible | `web/app.js`; `web/index.html` | **IMPLEMENTED / UNVERIFIED** |
| User can print a shareable record | Browser print view shows title, notes, dates, source values, and neutral limits | `web/app.js` print button; `web/styles.css` print rules | **IMPLEMENTED / UNVERIFIED**; browser print not exercised |
| Missing provider config fails closed | Without key, server returns 503 and app creates no local case | `src/server.js`, `src/server.test.js`, `evidence/local-checks-2026-10-28.md` | **VERIFIED** for local HTTP preflight; browser behavior pending |
| Malformed runtime configuration fails fast | Invalid port, bind host, cookie mode, or multiline/oversized key prevents startup | `validateEnvironment` in `src/server.js`, `src/server.test.js` | **VERIFIED** by deterministic configuration check |
| User can delete a local case | Confirmation then removal from localStorage; failed storage write restores prior list | `web/app.js` delete handler | **IMPLEMENTED / UNVERIFIED**; browser execution pending |
| Submission matches official requirements | Public repo with license, screenshots, text, public 1–3 min video and actual submission | `README.md`, `docs/demo-and-pitch.md` | **PLANNED**; no external submission actions taken |
| Entrant is eligible | Entrant meets age, location, team, conflict, registration rules | Official rules; participant must confirm own facts | **UNKNOWN** |

