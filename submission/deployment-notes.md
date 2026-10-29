# Deployment notes

The repository includes `render.yaml` for a Render Node service. To deploy, connect the public repository in Render, create the Blueprint service, and configure `YOUCAM_API_KEY` in Render's secret environment settings. Keep the API key server-side and never place it in a public frontend variable.

The project owner provided the deployed app URL: https://skin-casefile.onrender.com/. This environment could not independently load the page or its `/api/status` endpoint, so deployment health remains unverified here. After opening it, confirm the landing page and `/api/status` respond. The casebook remains browser-local; a public app URL does not make case data private from another person using the same browser profile.
