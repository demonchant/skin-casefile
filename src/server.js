import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import {
  YouCamError,
  createSkinAnalysis,
  getSkinAnalysis,
  parseSkinResult,
} from './youcam.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WEB_ROOT = path.join(ROOT, 'web');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_SCAN_ATTEMPTS_PER_DAY = 10;
const MAX_ACTIVE_TASKS_PER_SESSION = 2;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SESSION_COOKIE = 'skin_casefile_session';
const sessions = new Map();
const taskOwners = new Map();

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function sessionFor(request, response) {
  const now = Date.now();
  for (const [taskId, owner] of taskOwners) if (now - owner.createdAt > SESSION_TTL_MS) taskOwners.delete(taskId);
  for (const [sessionId, session] of sessions) if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(sessionId);
  const cookieHeader = request.headers.cookie ?? '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([a-f0-9]{64})(?:;|$)`));
  let id = match?.[1];
  if (!id || !sessions.has(id)) {
    id = randomBytes(32).toString('hex');
    sessions.set(id, { createdAt: now, scanAttempts: [] });
    const secure = process.env.COOKIE_SECURE === 'true' ? '; Secure' : '';
    response.setHeader('set-cookie', `${SESSION_COOKIE}=${id}; HttpOnly; SameSite=Strict; Path=/${secure}`);
  }
  return id;
}

function readBinary(request, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    let rejected = false;
    request.on('data', (chunk) => {
      if (rejected) return;
      total += chunk.length;
      if (total > limit) {
        rejected = true;
        reject(new YouCamError('Image exceeds the 10 MB limit.', 413, 'IMAGE_TOO_LARGE'));
        request.resume();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => { if (!rejected) resolve(Buffer.concat(chunks)); });
    request.on('error', (error) => { if (!rejected) reject(error); });
  });
}

function validImage(buffer, contentType) {
  if (contentType === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (contentType === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return false;
}

function safeError(error) {
  if (error instanceof YouCamError) return { status: error.statusCode, message: error.publicMessage, code: error.code };
  return { status: 502, message: 'The YouCam service could not complete this scan. Your saved case notes are unchanged.', code: 'PROVIDER_UNAVAILABLE' };
}

async function serveFile(request, response, pathname) {
  const decoded = decodeURIComponent(pathname);
  const requested = decoded === '/' ? 'index.html' : decoded === '/dashboard' ? 'dashboard.html' : decoded.slice(1);
  const resolved = path.resolve(WEB_ROOT, requested);
  if (!resolved.startsWith(`${WEB_ROOT}${path.sep}`)) {
    sendJson(response, 404, { error: 'Not found.' });
    return;
  }
  try {
    const fileInfo = await stat(resolved);
    if (!fileInfo.isFile()) throw new Error('Not a file.');
    const content = await readFile(resolved);
    response.writeHead(200, {
      'content-type': MIME_TYPES[path.extname(resolved)] ?? 'application/octet-stream',
      'content-security-policy': "default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer',
      'cache-control': 'no-store',
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: 'Not found.' });
  }
}

export function createServer() {
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      const sessionId = sessionFor(request, response);

      if (request.method === 'GET' && url.pathname === '/api/status') {
        sendJson(response, 200, { configured: Boolean(process.env.YOUCAM_API_KEY?.trim()), provider: 'YouCam Skin Analysis v2.1' });
        return;
      }

      if (request.method === 'POST' && url.pathname === '/api/analysis') {
        if (!process.env.YOUCAM_API_KEY?.trim()) {
          request.resume();
          sendJson(response, 503, { error: 'Live analysis is unavailable: add YOUCAM_API_KEY to the server environment and restart it.', code: 'API_KEY_MISSING' });
          return;
        }
        if (request.headers['x-user-consent'] !== 'true') {
          request.resume();
          sendJson(response, 400, { error: 'Consent is required before sending a selfie to YouCam.', code: 'CONSENT_REQUIRED' });
          return;
        }
        const contentType = request.headers['content-type'];
        if (!['image/jpeg', 'image/png'].includes(contentType)) {
          request.resume();
          sendJson(response, 415, { error: 'Choose a JPEG or PNG image.', code: 'UNSUPPORTED_IMAGE' });
          return;
        }
        const declaredLength = Number(request.headers['content-length']);
        if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
          sendJson(response, 413, { error: 'Image exceeds the 10 MB limit.', code: 'IMAGE_TOO_LARGE' });
          request.resume();
          return;
        }
        const session = sessions.get(sessionId);
        session.scanAttempts = session.scanAttempts.filter((timestamp) => Date.now() - timestamp < SESSION_TTL_MS);
        const activeTasks = [...taskOwners.values()].filter((owner) => owner.sessionId === sessionId).length;
        if (session.scanAttempts.length >= MAX_SCAN_ATTEMPTS_PER_DAY || activeTasks >= MAX_ACTIVE_TASKS_PER_SESSION) {
          request.resume();
          sendJson(response, 429, { error: 'Scan limit reached for this browser session. Try again later; existing case records are unchanged.', code: 'SESSION_LIMIT' });
          return;
        }
        const image = await readBinary(request, MAX_IMAGE_BYTES);
        if (!image.length || !validImage(image, contentType)) {
          sendJson(response, 400, { error: 'The selected file is empty or is not a valid JPEG/PNG image.', code: 'INVALID_IMAGE' });
          return;
        }
        const fileName = contentType === 'image/png' ? 'skin-casefile.png' : 'skin-casefile.jpg';
        session.scanAttempts.push(Date.now());
        const taskId = await createSkinAnalysis({ image, fileName, contentType });
        taskOwners.set(taskId, { sessionId, createdAt: Date.now() });
        sendJson(response, 202, { taskId, status: 'running' });
        return;
      }

      const taskMatch = url.pathname.match(/^\/api\/analysis\/([A-Za-z0-9_-]{12,160})$/);
      if (request.method === 'GET' && taskMatch) {
        const taskId = taskMatch[1];
        const owner = taskOwners.get(taskId);
        if (!owner || owner.sessionId !== sessionId || Date.now() - owner.createdAt > 24 * 60 * 60 * 1000) {
          sendJson(response, 404, { error: 'This analysis session has expired. Start a new scan to continue.', code: 'TASK_NOT_FOUND' });
          return;
        }
        const result = await getSkinAnalysis(taskId);
        if (result.taskStatus === 'error') {
          taskOwners.delete(taskId);
          sendJson(response, 200, { status: 'error', error: result.message ?? 'YouCam could not process this photo. Try a clear, front-facing image in even light.' });
          return;
        }
        if (result.taskStatus !== 'success') {
          sendJson(response, 200, { status: 'running' });
          return;
        }
        const scores = parseSkinResult(result.data);
        taskOwners.delete(taskId);
        sendJson(response, 200, { status: 'success', source: 'YouCam Skin Analysis v2.1', completedAt: new Date().toISOString(), scores });
        return;
      }

      if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
        sendJson(response, 404, { error: 'API route not found.' });
        return;
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        sendJson(response, 405, { error: 'Method not allowed.' });
        return;
      }
      await serveFile(request, response, url.pathname);
    } catch (error) {
      const safe = safeError(error);
      sendJson(response, safe.status, { error: safe.message, code: safe.code });
    }
  });
}

export function validateEnvironment(environment = process.env) {
  const errors = [];
  const port = environment.PORT === undefined || environment.PORT === '' ? 3000 : Number(environment.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT must be an integer from 1 through 65535.');
  const host = environment.HOST ?? '127.0.0.1';
  if (!['127.0.0.1', '0.0.0.0'].includes(host)) errors.push('HOST must be 127.0.0.1 (local only) or 0.0.0.0 (container/proxy binding).');
  const cookieSecure = environment.COOKIE_SECURE ?? 'false';
  if (!['true', 'false'].includes(cookieSecure)) errors.push('COOKIE_SECURE must be true or false.');
  const key = environment.YOUCAM_API_KEY ?? '';
  if (key.length > 4096 || /[\r\n]/.test(key)) errors.push('YOUCAM_API_KEY must be a single line no longer than 4096 characters.');
  return { valid: errors.length === 0, errors, port, host };
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntrypoint) {
  const config = validateEnvironment();
  if (!config.valid) {
    process.stderr.write(`${config.errors.join('\n')}\n`);
    process.exit(1);
  }
  const server = createServer();
  server.listen(config.port, config.host, () => process.stdout.write(`Skin Casefile listening at http://${config.host}:${config.port}\n`));
}
