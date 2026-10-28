const API_BASE = 'https://yce-api-01.makeupar.com/s2s';
const TASK_PATH = '/v2.1/task/skin-analysis';
const CONCERNS = ['acne', 'redness', 'moisture', 'oiliness'];
const UPSTREAM_TIMEOUT_MS = 30_000;

export class YouCamError extends Error {
  constructor(publicMessage, statusCode = 502, code = 'YOUCAM_ERROR') {
    super(publicMessage);
    this.name = 'YouCamError';
    this.publicMessage = publicMessage;
    this.statusCode = statusCode;
    this.code = code;
  }
}

function apiKey() {
  const key = process.env.YOUCAM_API_KEY?.trim();
  if (!key) throw new YouCamError('Live analysis is unavailable because the server API key is missing.', 503, 'API_KEY_MISSING');
  return key;
}

async function fetchWithTimeout(url, options) {
  let response;
  try {
    response = await fetch(url, { ...options, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError';
    throw new YouCamError(timedOut ? 'The YouCam service took too long to respond. You can try again.' : 'Could not reach the YouCam service. Check your connection and try again.', 502, timedOut ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_NETWORK');
  }
  if (!response.ok) {
    const status = response.status;
    if (status === 401 || status === 403) throw new YouCamError('YouCam rejected the API key. Check the server configuration.', 502, 'API_KEY_REJECTED');
    if (status === 429) throw new YouCamError('YouCam is limiting requests. Wait a moment, then try again.', 429, 'RATE_LIMITED');
    throw new YouCamError(`YouCam returned an error (HTTP ${status}). Your saved case notes were not changed.`, 502, 'PROVIDER_ERROR');
  }
  try {
    return await response.json();
  } catch {
    throw new YouCamError('YouCam returned an unreadable response.', 502, 'INVALID_PROVIDER_RESPONSE');
  }
}

function apiData(payload) {
  return payload?.data ?? payload;
}

function uploadDetails(payload) {
  const item = apiData(payload)?.files?.[0];
  const requestOptions = item?.requests;
  const upload = Array.isArray(requestOptions)
    ? requestOptions.find((entry) => String(entry.method ?? '').toUpperCase() === 'PUT') ?? requestOptions[0]
    : requestOptions;
  const uploadUrl = upload?.url ?? item?.upload_url;
  const uploadHeaders = upload?.headers ?? item?.headers ?? {};
  const fileId = item?.file_id ?? item?.id;
  if (!fileId || !uploadUrl) throw new YouCamError('YouCam file upload setup returned an incomplete response.', 502, 'INVALID_UPLOAD_RESPONSE');
  let parsed;
  try { parsed = new URL(uploadUrl); } catch { throw new YouCamError('YouCam returned an invalid upload address.', 502, 'INVALID_UPLOAD_URL'); }
  if (parsed.protocol !== 'https:') throw new YouCamError('YouCam returned an insecure upload address.', 502, 'INVALID_UPLOAD_URL');
  return { fileId, uploadUrl: parsed.href, uploadHeaders };
}

export async function createSkinAnalysis({ image, fileName, contentType }) {
  const key = apiKey();
  const metadata = await fetchWithTimeout(`${API_BASE}/v2.0/file`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ files: [{ content_type: contentType, file_name: fileName, file_size: image.length }] }),
  });
  const { fileId, uploadUrl, uploadHeaders } = uploadDetails(metadata);
  let upload;
  try {
    upload = await fetch(uploadUrl, {
      method: 'PUT',
      headers: uploadHeaders,
      body: image,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      redirect: 'error',
    });
  } catch (error) {
    throw new YouCamError(error?.name === 'TimeoutError' ? 'The image upload took too long. Try again.' : 'The image could not be uploaded to YouCam. Try again.', 502, 'UPLOAD_FAILED');
  }
  if (!upload.ok) throw new YouCamError(`The image upload failed (HTTP ${upload.status}). Your existing notes were not changed.`, 502, 'UPLOAD_FAILED');

  const task = await fetchWithTimeout(`${API_BASE}${TASK_PATH}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ src_file_id: fileId, dst_actions: CONCERNS, format: 'json' }),
  });
  const taskId = apiData(task)?.task_id;
  if (typeof taskId !== 'string' || !/^[A-Za-z0-9_-]{12,160}$/.test(taskId)) {
    throw new YouCamError('YouCam did not return a valid analysis task identifier.', 502, 'INVALID_TASK_RESPONSE');
  }
  return taskId;
}

export async function getSkinAnalysis(taskId) {
  const key = apiKey();
  const payload = await fetchWithTimeout(`${API_BASE}${TASK_PATH}/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
  });
  const data = apiData(payload);
  const rawStatus = String(data?.task_status ?? data?.taskStatus ?? '').toLowerCase();
  if (rawStatus === 'error' || rawStatus === 'failed') return { taskStatus: 'error', message: 'YouCam could not process this photo. Try a clear, front-facing image in even light.' };
  if (rawStatus !== 'success') return { taskStatus: 'running' };
  return { taskStatus: 'success', data };
}

export function parseSkinResult(data) {
  const results = data?.results;
  const output = Array.isArray(results?.output) ? results.output : Array.isArray(results) ? results : null;
  if (!output?.length) throw new YouCamError('YouCam marked the task complete but returned no score data.', 502, 'EMPTY_RESULT');
  const allowed = new Set(CONCERNS);
  const scores = output.flatMap((item) => {
    const type = typeof item?.type === 'string' ? item.type : typeof item?.action === 'string' ? item.action : '';
    if (!allowed.has(type)) return [];
    const raw = item.raw_score;
    const ui = item.ui_score;
    const rawScore = raw !== null && raw !== undefined && raw !== '' && Number.isFinite(Number(raw)) ? Number(raw) : null;
    const uiScore = ui !== null && ui !== undefined && ui !== '' && Number.isFinite(Number(ui)) ? Number(ui) : null;
    if (rawScore === null && uiScore === null) return [];
    return [{ type, rawScore, uiScore }];
  });
  const unique = new Map(scores.map((score) => [score.type, score]));
  const normalized = [...unique.values()];
  if (!normalized.length) throw new YouCamError('YouCam returned a result without any of the requested scores.', 502, 'INVALID_RESULT');
  return normalized;
}
