# Requirements and rubric matrix

Official criteria and rules: [Devpost rules](https://youcam-api-skin-ai-ecommerce.devpost.com/rules), checked 2026-10-28. Stage 1 is pass/fail; Stage 2 criteria are equally weighted.

| Criterion / requirement | Judge intent / required behavior | Implementation and proof path | Status / gap |
|---|---|---|---|
| Stage 1: theme and required API | Working Skin/Fashion/etc YouCam integration that reasonably fits the track | Real selfie → File API → Skin Analysis task → status/result; `src/server.js`, `src/youcam.js`; run instructions in README | **PLANNED**; live key and real result required |
| Technological Implementation (equal weight) | Thorough, skilled, non-trivial API integration with consumer/eCommerce value | Authenticated backend, signed upload, async task polling, schema validation, persisted response provenance, explicit failures; live request evidence | **PLANNED / BLOCKED** until key/selfie |
| Design (equal weight) | Complete, coherent user journey | Consent, capture/upload, progress/error states, result timeline, return visit, print report; screenshots and browser review | **PLANNED** |
| Potential Impact (equal weight) | Specific real audience/problem addressed by demonstrated function | A person facing a new skin concern gets a dated record of measurements and their own context to support a conversation with a qualified professional | **INFERRED** problem value; user research not yet done |
| Quality of the Idea (equal weight) | Creative, non-obvious API use and genuine problem understanding | Treat one scan as evidence in an incident timeline rather than another generic scorecard/recommender. Competitor overlap disclosed. | **PARTIAL**; differentiation is uncertain and must survive implementation review |
| Functional consistency | App works as described on intended platform | Local browser app with Node backend; clean startup and failure path | **PLANNED** |
| Repo + instructions | Source/assets/setup included; public with license or private shared to event | README and project files; licensing and external publication require participant decision/action | **PLANNED** |
| Description + screenshots | Explain consumer value; include images | `docs/demo-and-pitch.md`, screenshots captured from real app only | **PLANNED** |
| 1–3 minute public demo | End-to-end on target device; explain API; use permitted media | Demo script and genuine run; public YouTube/Vimeo link | **PLANNED**, requires live API key and account |
| Eligibility and originality | Entrant eligible; original and entrant-owned work | New app created in submission period; participant to confirm personal eligibility and registration | Originality **SUPPORTED by workspace inspection**; entrant eligibility **UNKNOWN** |
| Exit interview/blog | Winner cooperation | Participant action if selected | **UNKNOWN / future condition** |

