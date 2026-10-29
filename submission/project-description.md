# Skin Casefile — project description

Skin Casefile is a private, dated casebook for people who want to keep a clearer record of a skin concern over time. A concern can be hard to describe later: when it began, how it felt, what changed in a routine, and how an earlier observation compared. Skin Casefile keeps those user-entered details beside dated YouCam Skin Analysis readings so the person can review the timeline and bring a portable summary to a conversation with a qualified professional.

The user creates a concern, adds optional notes, and can choose to submit a selfie for analysis after explicit consent. The server uploads the selected image through YouCam's File API, starts and polls a Skin Analysis task, validates the returned readings, and presents those provider results in the case timeline. Follow-up check-ins add another dated observation. Differences between measurements are arithmetic comparisons; they do not establish improvement, diagnosis, or cause. A print view makes the user's record portable.

Skin Casefile addresses the gap between a one-time skin score and the context people need to remember their own experience. The product helps organize observations; it does not diagnose, prescribe treatment, recommend products, or claim that a routine caused a change.

**YouCam APIs:** YouCam File API and Skin Analysis API. The API key is held by the server. Images are sent to YouCam only after consent and are not retained by the app. Provider processing and retention remain subject to YouCam's terms and privacy policy.

**Data model and limits:** notes and returned measurements stay in browser local storage on the device. There is no Google authentication, cloud sync, or cross-device recovery. A new browser has a real empty state. An unavailable provider or failed scan is shown as a failure; it does not create fake results.

**Demo:** [Watch Skin Casefile on YouTube](https://youtu.be/CITNpW-76z8). The 1:02 video demonstrates the browser product, consented analysis, returned readings, a follow-up timeline, and print summary. The public URL was supplied by the project owner; external playback could not be verified by this environment.

**Live app:** [https://skin-casefile.onrender.com/](https://skin-casefile.onrender.com/). The URL was supplied by the project owner; this environment could not independently verify the deployed site.

**Repository:** https://github.com/demonchant/skin-casefile
**License:** MIT, for the repository's original code.
