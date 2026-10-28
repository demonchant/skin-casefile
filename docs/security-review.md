# Security and operations review

Scope: local, single-user web prototype as implemented 2026-10-28. Public multi-user deployment is not currently safe or verified.

| Threat / boundary | Current control | Status / remaining risk |
|---|---|---|
| API key exposed in browser | Key read only by Node provider client; `/api/status` reports presence only; static assets do not include it. `.env` ignored. | **Implemented; code inspected.** No build bundle exists. Protect host environment and deployment logs. |
| Malformed environment configuration | Startup validates port, bind host, cookie mode, and API-key header safety | `validateEnvironment` in `src/server.js` | **Verified** by deterministic configuration check. |
| Unconsented photo upload | Both UI checkbox and server `x-user-consent` guard; upload starts only after consent; vendor retention and unit use disclosed. | **Implemented / unverified in browser.** Browser test is blocked. Consent needs review for any launch jurisdiction. |
| Oversized or mislabeled image | Server cap 10 MiB; MIME allowlist and JPEG/PNG signature check; browser checks dimensions and type. | **Implemented.** Server limit was not separately fuzz-tested. A caller can bypass browser dimension check; YouCam still validates input. |
| Cross-site requests | No CORS headers; custom consent header and `SameSite=Strict`, `HttpOnly` session cookie; task IDs are bound to a random session. | **Code-reviewed.** Not penetration-tested. `Secure` cookie must be enabled behind HTTPS. |
| Credit abuse | Per-browser-session cap of 10 attempts per 24 hours and two active tasks. | **Limited local guard only.** Sessions/limits are in memory, can be recreated, and are not a global spend cap. Do not expose this no-login server publicly. |
| Untrusted upload URL / SSRF | Upload URL comes from authenticated YouCam File API response; HTTPS is required; client cannot submit a URL. | **Implemented.** Provider upload host is not domain-allowlisted; verify actual provider host during live spike. |
| Task disclosure | Random provider task ID map is transient and bound to session cookie. Expired tasks are removed after 24h. | **Implemented / unverified.** Restarting Node loses active task access; user can start a new scan. |
| Sensitive notes/results | Browser localStorage only; individual case delete and browser clear are disclosed. No analytics or database. | **Implemented / unverified.** Shared-device users can see local records; no account isolation or sync. |
| Provider logs and photo retention | Application does not write image or key to disk/logs. YouCam API policy generally retains data for 30 days after completion. | **Policy linked in product.** Vendor behavior not observed; re-check current terms before public launch. |
| Runtime/dependency supply chain | Runtime uses Node built-ins; `@playwright/test` dev dependency is pinned to 1.64.1. | **Partial.** Network block prevented lockfile generation/install/audit. No runtime npm dependencies. |
| Container permissions | Compose app drops capabilities, read-only root filesystem, tmpfs `/tmp`, no-new-privileges, loopback-only published port. | **Config parses; not built/run** because Docker Desktop engine pipe denies access. |

Before any public deployment, add user authentication or single-user access controls, global unit budget/credit preflight, HTTPS and secure cookies, origin/CSRF checks, persistent and isolated state, observable vendor-host validation, current privacy/legal review, dependency lock/audit, and live provider verification. These are deployment blockers, not claims that current local prototype has them.
