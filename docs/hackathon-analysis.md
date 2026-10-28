# Hackathon analysis

**Research checked:** 2026-10-28. Status labels below distinguish official facts from inference and unknowns.

## Event and eligibility

- **OFFICIAL:** YouCam API Skin AI & eCommerce VTO Hackathon, hosted by Perfect Mobile Corp. The official rules set registration and submission close at **2026-11-02 11:45 a.m. EST**; judging runs Nov 3–20 and winners are expected around Nov 24. The close is 16:45 UTC / 17:45 in Lagos (WAT). The rules explicitly say EST, and Devpost's event card gives the same 16:45 UTC deadline. Confirm the site clock before submitting.
- **OFFICIAL:** Individuals of the local age of majority may enter, along with eligible teams and organizations. The excluded jurisdictions list does not name Nigeria. This does not establish the participant's age, citizenship/residency, or conflict-of-interest status.
- **UNKNOWN:** Devpost registration, participant age, API account/redeem code, special-award eligibility, and whether the participant has a conflict covered by the rules. Participant must verify these in their own account.
- **OFFICIAL:** Project must be a working web or mobile app with at least one Perfect Corp YouCam API and consumer/eCommerce value. The code repository must be public with relevant licensing or shared privately with contact_event@PerfectCorp.com. Submission needs description, screenshots, and a public 1–3 minute demo video explaining the API and showing the app on its intended device. No unlicensed third-party marks or copyrighted material in the video. Winner must do an exit interview and agree to blog inclusion.
- **OFFICIAL:** Work created for entry must be original and entrant-owned. Any preexisting project must be significantly updated during the submission period (which began Sep 29). Workspace inspection found only two hackathon process documents and no preexisting app. This build is starting Oct 28, within the submission period.
- **OFFICIAL:** Stage 1 is pass/fail for theme fit and reasonable API use. Stage 2 has four equally weighted criteria: Technological Implementation, Design, Potential Impact, Quality of the Idea. Rules prevail over marketing copy.

## Requirements, risks, and plan

| Requirement / risk | Evidence and consequence | Plan / state |
|---|---|---|
| Real YouCam integration | Required by rule; official REST docs describe File API upload, task creation, polling, and output. No API key is present in the workspace. | Implement server-side authenticated flow; live call **BLOCKED** until a legitimate API key and consented selfie are available. Never return fake success. |
| Product value | A bare score screen is weak against the brief's demand for clear value beyond an API call. | Build a private skin-event record: dated YouCam readings plus user-entered product/timing/symptom context, visible before/after comparison, and a print-ready summary a user can discuss with a qualified professional. No causal or medical conclusion. |
| Originality | New-app rule; empty app workspace on start. | New implementation, with commit/history and project-forensics record. |
| Submission access | Judges need a free working URL or local/test instructions. | Local reproducible web app first; hosting/public repo/video remain **PLANNED** and require account/user action. |
| Personal image handling | Selfies are sensitive; YouCam privacy terms apply. | Consent before upload, key kept server-side, no app-side photo persistence, API workflow errors surfaced honestly. User event notes and returned scores stay local in browser storage. Verify vendor retention against current terms before launch. |
| Time remaining | Deadline is Nov 2; about five days from research date. | Limit scope to one complete Skin AI journey and case summary. Drop retailer catalog, diagnosis, medication advice, and VTO. |

## Candidate comparison and selection

Scores are an **INFERRED INTERNAL ASSESSMENT**, not organizer scoring. Each dimension is 1–5. Weights mirror the four equally weighted official criteria, with real consumer problem detail inside impact and idea. Feasibility is a separate gate (not a hidden fifth judging criterion). Initial scores are estimates before implementation, so planned work earns no verified credit.

| Candidate | Tech (25%) | Design (25%) | Impact (25%) | Idea (25%) | Feasibility gate | Evidence-based rationale |
|---|---:|---:|---:|---:|---|---|
| A. **Skin Casefile**: turn a concerning change into a dated, shareable record with YouCam scores and a user-entered product/event timeline | 3 | 4 | 4 | 4 | Pass with API key; no catalog dependency | API is the measurement source; timeline and export make a repeatable consumer workflow. More differentiated than routine recommendation, but longitudinal competitors exist. |
| B. Skin-aware apparel/beauty basket: score skin/color, rank a catalog, and render try-ons | 4 | 4 | 3 | 2 | Conditional on VTO key and usable catalog assets | Strong API depth but crowded: prior ShadeSpan/CASTING and current Skin-Aware Stylist, Hue.U, Undertone already combine profile/ranking/VTO. |
| C. Shelf ingredient/active checker: read a user's product labels and compare products with their routine | 2 | 3 | 3 | 3 | Fail for this timebox without licensed, complete product/INCI data and validated safety policy | Real consumer pain, but catalog completeness and medical interpretation risks dominate; YouCam is peripheral unless connected to actual readings. |

**Selection:** A, provisionally. It is the smallest credible path to user value within the deadline and makes the API central to a dated report. This is not a claim of guaranteed novelty or competition success. Candidate B scores higher on raw API breadth; selection changes if a distinctive usable catalog is supplied and the live API is verified early. Candidate A itself overlaps with Slept On's logging of product changes and skin trends. The differentiator is a focused event record and clinician-conversation export, not statistical correlation or routine advice. If implementation becomes a generic journal with no clear user decision, narrow further or pivot.

**Sensitivity:** With all four official criteria equally weighted, A leads B 3.75 vs 3.25 and C 2.75. If Idea is double-weighted while the other three stay equal, A and B both score 3.8; the ranking is no longer decisive. This confirms originality is the central uncertainty, not a proven advantage. A remains the provisional choice because B's crowded field/catalog dependency and C's safety/data issues are evidenced, but an early competitor/API review could invalidate it.

## Hardest promise and acceptance path

- **Hardest promise:** A user can create a trustworthy, useful account of a skin concern over time without the app implying diagnosis or product causation.
- **User trigger:** User notices a change, wants to record it before buying/starting another product, then returns for a comparable follow-up.
- **Required behavior:** consent → selfie upload through official YouCam File API → real Skin Analysis task → poll to terminal state → validate returned scores → persist a timestamped record locally → show actual comparison and provenance → print/export a plain summary.
- **Independent check:** reload and confirm record remains; compare displayed values with stored result response; print view preserves source, dates, and limitation language. No success state on API errors.
- **Abnormal case:** missing key, bad image, vendor error, timeout, or malformed result remains an explicit error/blocked state; existing notes are not overwritten.
- **Limits:** Same angle/light/time are user-controlled but cannot be guaranteed. Score differences are not proof of product effect, and the app is not medical advice.

## Architecture and phases

Browser app → same-origin Node backend → YouCam File API presigned upload → YouCam Skin Analysis v2.1 task and status API → validated score object → browser localStorage. No user account, database, third-party LLM, or retailer catalog is needed for this first path. The server never serves the API key. The browser stores only returned metrics and user-authored notes; the selfie is not persisted by this app after upload.

AI contract: YouCam returns scores/measurement outputs; the product does not make a diagnostic or treatment decision. A deterministic parser accepts only documented fields, preserves source values, and omits unknown fields. The printable note uses neutral labels and user-entered observations.

1. Research and select concept — **PARTIAL**; official sources and public entrants inspected; remaining eligibility/API account unknowns.
2. End-to-end integration + honest failures — **IMPLEMENTED / UNVERIFIED**; local HTTP failure behavior verified; live API blocked on key.
3. Persist/reload/compare/print — **IMPLEMENTED / UNVERIFIED**; browser execution is blocked by Docker engine permissions and unavailable Playwright package.
4. Security, local checks, browser/real API verification — **PARTIAL**; server preflight and parser checks pass; browser and live provider verification blocked.
5. Deploy, screenshots, video, repo visibility, submission receipt — **PLANNED**; cannot claim submitted absent actual receipt.

## Sources

- Official Devpost event/rules, checked 2026-10-28: https://youcam-api-skin-ai-ecommerce.devpost.com/rules
- Official event overview and criteria: https://youcam-api-skin-ai-ecommerce.devpost.com/
- Official Skin Analysis v2.1 API: https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1
- Official File API: https://docs.perfectcorp.com/reference/file/paths/~1s2s~1v2.0~1file/post
- Official quick start: https://docs.perfectcorp.com/develop/quick_start_guide
- Official YouCam API Privacy Policy, checked 2026-10-28: https://www.perfectcorp.com/de/perfectbeauty/youcam/privacy-policy-api
- Official YouCam API Terms, updated September 2026: https://www.perfectcorp.com/perfectbeauty/youcam/terms-of-service-api
- Official Perfect Corp announcement and prior round winners: https://www.perfectcorp.com/business/news/YouCam-API-Hackthon-eCommerce
- Relevant current entrants and repository inspected: https://devpost.com/software/slept-on and https://github.com/Shivang-creator/slept-on
- Other current entrant pages: https://devpost.com/software/glowread ; https://devpost.com/software/skin-aware-stylist ; https://devpost.com/software/hue-u ; https://devpost.com/software/the-honest-mirror

