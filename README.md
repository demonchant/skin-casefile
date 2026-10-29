# Skin Casefile

**A private timeline for a skin concern—bringing real YouCam Skin Analysis readings together with the dates, notes, and routine context that make them easier to understand.**

Skin changes often happen between appointments and product purchases. A person may remember that something changed without remembering when, what else changed in their routine, or how a previous measurement compared. Skin Casefile turns that scattered memory into a dated, user-controlled record that can support a clearer conversation with a qualified professional.

It is not a diagnostic tool, treatment recommender, product review system, or proof that a routine caused a change. It presents returned measurements and user-entered context without making those conclusions for the user.

## The product

- **Landing page (`/`)** explains the consumer problem, the product's role, privacy boundaries, and the YouCam integration.
- **Casebook (`/dashboard`)** lets a user open a concern, write their own note, optionally record a product or routine change, and add a consented selfie for a real scan.
- **Follow-up timeline** places later measurements, dates, and notes beside the original entry. Score deltas are arithmetic comparisons only, not claims of improvement or cause.
- **Portable summary** prints the selected case so the user can bring their own record to a professional discussion.
- **Honest empty and failure states**: no example records or invented results are shipped. An unsuccessful API call does not create a scan entry.

## Why this approach

Skin analysis products commonly present a score or recommendation in the moment. Skin Casefile focuses on what happens around that moment: preserving the user's own timeline and adding the optional provider reading as one observation among several. This makes the YouCam integration useful to a specific task—comparing dated observations—while keeping interpretation with the user and their clinician. The project makes no unsupported claim that no competing product offers similar tracking.

## Real integration

The Node server authenticates with `YOUCAM_API_KEY` and calls Perfect Corp's YouCam Skin Analysis REST API. The browser sends a selected image only after explicit consent. The server requests an upload URL through the YouCam File API, uploads the image to that signed destination, creates an asynchronous skin-analysis task, polls for completion, validates returned measurements, and returns provider-sourced values to the browser. The original photo is not stored by this app. Case notes and returned measurements are saved in browser storage on that device.

The API key stays in the server environment; it is never sent to browser code. A separate `YOUCAM_API_SECRET_KEY` is not currently used: YouCam's documented API flow authenticates with the API key as a Bearer token. Review YouCam's current API terms and privacy policy before sending an image. Provider retention is subject to YouCam's policy, not controlled by this app.

**Verification status:** the real integration code and credential configuration are present. A valid API key is now configured locally, but a live analysis result has not yet been observed in this workspace. A scan requires a user-selected selfie and explicit consent; until an actual result is returned, live integration remains **implemented / unverified**. Automated local checks do not establish provider success.

## Run locally

Requirements: Node.js 22.9 or later and a YouCam API account/key for live analysis.

1. Copy `.env.example` to `.env` if needed, then set `YOUCAM_API_KEY` to your API key. Never paste credentials into GitHub, source files, screenshots, or chat.
2. Start the server:

   ```powershell
   npm start
   ```

3. Open `http://localhost:3000` for the landing page or `http://localhost:3000/dashboard` for the casebook.
4. To run the tests:

   ```powershell
   npm test
   ```

The dashboard shows a real empty state on a new browser. Live scans use YouCam API units. The photo is sent to YouCam only after the user checks the consent box and submits the form.

## Deploy a public demo URL

`render.yaml` defines a Render Node web service for this app. Connect the public GitHub repository to Render and create a Blueprint from the repository. Render will prompt for `YOUCAM_API_KEY`; enter it in Render's secret field and never commit it. The app binds to Render's assigned `PORT`, uses HTTPS-secure cookies, and exposes `/api/status` as its health check. The Render dashboard displays the generated public `onrender.com` URL after the first deploy succeeds.

The free web-service plan is suitable for a hackathon demo, not production: Render may spin it down after 15 minutes without traffic and the next request can take about a minute to wake it. The app keeps case records in each visitor's browser, so it does not depend on a server disk. In-flight analysis task ownership is kept in server memory, so a service restart can interrupt a scan; the user can retry. See [Render's free service limits](https://render.com/docs/free).

## Privacy and limitations

- Case records live in that browser's local storage. There is no account sync, cloud backup, or cross-device recovery.
- Skin Casefile does not retain the selected selfie. The image is sent to YouCam for the requested analysis under YouCam's terms.
- Anyone with access to the same unlocked browser profile may be able to view its locally stored case notes and scores.
- Each browser receives a separate random, HttpOnly server-session cookie. Google sign-in is not currently part of the app: it would identify a Google account, but would not add cross-device sync or database-backed recovery. Add account login only together with an explicit account-data and storage design.
- Skin analysis is an observation, not diagnosis or treatment. Measurements can vary with image conditions and do not establish cause.
- The current deployment is a local prototype. Public hosting, HTTPS deployment, production abuse protection, and real-user evaluation are not yet verified.

## Hackathon deliverables still needed

The YouCam API Skin AI & eCommerce VTO Hackathon requires at least one YouCam API integration, a repository and project description, screenshots, and a publicly accessible 1–3 minute demo video showing the project on its target device and explaining the API. The current source provides the application and setup instructions. A verified real scan, final screenshots, public demo video, repository license, and submission receipt remain to be completed before claiming a complete submission. See the [official rules](https://youcam-api-skin-ai-ecommerce.devpost.com/rules).

## License

This project is licensed under the [MIT License](LICENSE) (SPDX: `MIT`). The license applies to this repository's original project code. YouCam APIs and any third-party services or materials remain subject to their own terms.
