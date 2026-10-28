# Competitive analysis

Checked 2026-10-28. Public Devpost copy and the public Slept On repository README were inspected. GitHub's individual source-file links and hosted demo were inaccessible through the available browser fetch, so implementation claims below are attributed to the project's own published README, not independently executed here.

## Strongest adjacent projects

| Project | Observed problem/mechanism | Strength and verified scope | Gap / relevance to Skin Casefile |
|---|---|---|---|
| [Slept On](https://devpost.com/software/slept-on), [public repository](https://github.com/Shivang-creator/slept-on) | Longitudinal YouCam skin metrics plus sleep, water, stress, alcohol, and product-change diary; correlation and multiple-testing correction. README describes product change-point tests and lighting controls. | Very close competitor. Its published README has concrete statistical methods, unit cost handling, honest uncertainty, 93 offline tests, and a clear distinction between fixture and live behavior. Its Devpost describes the single-person/self-report limits. These implementation/test statements are **competitor-reported**, not independently run. | Direct overlap: also asks what changed skin and includes product changes. Casefile must not claim a novel tracking concept. It narrows to a one-event record and print/export for a professional conversation; no causal inference or population statistics. Strongest threat. |
| [GlowRead](https://devpost.com/software/glowread) | YouCam scores feed a deterministic AM/PM routine with real products and safety constraints. | Clear purchase decision and product-specific outcome; detailed validation and failure work described on Devpost. | Broad recommendation surface; its page says progress tracking is future work. Casefile avoids prescribing a routine and focuses on recording an unresolved concern. |
| [Skin-Aware Stylist](https://devpost.com/software/skin-aware-stylist) and [Hue.U](https://devpost.com/software/hue-u) | Skin signal/undertone → rank clothes/shades → YouCam try-on. | Clear retail outcome with multiple API calls. | Adjacent eCommerce concepts are crowded; do not pivot into catalog recommendation without a distinct mechanism. |
| [The Honest Mirror](https://devpost.com/software/the-honest-mirror) | Skin score receipts plus apparel try-on and transparent product recommendations. | Strong transparency/receipt framing and try-on before purchase. | “Receipt” language itself is not novel. Casefile must show a case timeline/export, not just raw numbers presented as receipts. |

## Event precedents

Perfect Corp's [official round-two announcement](https://www.perfectcorp.com/business/news/YouCam-API-Hackthon-eCommerce) reports round one drew 1,280 developers and 238 submissions and describes winners: Aloud (voice-first access), ShadeSpan/CASTING (skin-tone inclusive catalog evaluation), KeepMe (user-controlled try-on) and ConfidFit (Shopify VTO). These are organizer-reported descriptions, not a source-code audit. They show accessible interpretation, catalog diversity, consent controls, and trustworthy try-on as established directions.

## Selection implication

There is no evidence that “skin tracking” or “product trial tracking” is unique. The candidate is defensible only if its acute event-to-shareable-record workflow is materially simpler and more useful than a general-purpose diary. The core differentiator to demonstrate is a user-created incident record with dated API source values, product exposure, symptom narrative, and a concise portable summary. If only a score timeline is implemented, the claim fails and the app should be described as a basic tracker or pivoted.

