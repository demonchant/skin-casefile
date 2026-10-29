# Deployment notes

The repository includes `render.yaml` for a Render Node service. To deploy, connect the public repository in Render, create the Blueprint service, and configure `YOUCAM_API_KEY` in Render's secret environment settings. Keep the API key server-side and never place it in a public frontend variable.

No Render deployment URL or production operation is claimed by these instructions. After deployment, verify `/api/status`, confirm the app page loads over HTTPS, and only then record the generated service URL as live. The casebook remains browser-local; a public app URL does not make case data private from another person using the same browser profile.
