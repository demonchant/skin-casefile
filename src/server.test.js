import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, validateEnvironment } from './server.js';

test('configuration rejects invalid port, host, cookie mode, and header injection', () => {
  const invalid = validateEnvironment({ PORT: '70000', HOST: '192.168.1.10', COOKIE_SECURE: 'yes', YOUCAM_API_KEY: 'bad\nkey' });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 4);
  assert.equal(validateEnvironment({ PORT: '3000', HOST: '127.0.0.1', COOKIE_SECURE: 'false', YOUCAM_API_KEY: '' }).valid, true);
});

test('preflight reports missing credentials without exposing a key', async (t) => {
  const previousKey = process.env.YOUCAM_API_KEY;
  delete process.env.YOUCAM_API_KEY;
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    if (previousKey === undefined) delete process.env.YOUCAM_API_KEY;
    else process.env.YOUCAM_API_KEY = previousKey;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;
  const status = await fetch(`${base}/api/status`);
  assert.deepEqual(await status.json(), { configured: false, provider: 'YouCam Skin Analysis v2.1' });
  const response = await fetch(`${base}/api/analysis`, { method: 'POST', headers: { 'content-type': 'image/png', 'x-user-consent': 'true' }, body: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]) });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.code, 'API_KEY_MISSING');
  assert.match(body.error, /YOUCAM_API_KEY/);
  assert.doesNotMatch(JSON.stringify(body), /Bearer|sk-[A-Za-z0-9]/i);
});

test('landing page and dashboard are separate direct routes', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  const landing = await fetch(`${base}/`);
  const dashboard = await fetch(`${base}/dashboard`);
  const heroImage = await fetch(`${base}/images/quiet-morning-mirror-ritual.webp`);
  const featureImage = await fetch(`${base}/images/sunlit-journaling-still-life.webp`);
  const dashboardImage = await fetch(`${base}/images/cozy-self-care-journaling-moment.webp`);
  assert.equal(landing.status, 200);
  const landingHtml = await landing.text();
  assert.match(landingHtml, /Your skin has a story/);
  assert.match(landingHtml, /quiet-morning-mirror-ritual\.webp/);
  assert.match(landingHtml, /sunlit-journaling-still-life\.webp/);
  assert.equal(dashboard.status, 200);
  const dashboardHtml = await dashboard.text();
  assert.match(dashboardHtml, /No case files yet/);
  assert.match(dashboardHtml, /cozy-self-care-journaling-moment\.webp/);
  for (const image of [heroImage, featureImage, dashboardImage]) {
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /image\/webp/);
  }
});
