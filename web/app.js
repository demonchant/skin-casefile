import { displayedScore, formatScore } from './score-display.js';

const STORAGE_KEY = 'skin-casefile.records.v1';
const labels = { acne: 'Acne', redness: 'Redness', moisture: 'Moisture', oiliness: 'Oiliness' };
const elements = Object.fromEntries([
  'serviceBadge', 'privacyButton', 'newCaseButton', 'emptyStartButton', 'welcomeStartButton', 'caseList', 'emptyState', 'caseView', 'welcomeView', 'caseNumber', 'caseTitle', 'caseDescription', 'caseContext', 'scanCount', 'latestScores', 'timeline', 'printButton', 'deleteCaseButton', 'followupForm', 'followupPhoto', 'followupFileLabel', 'followupStatus', 'caseDialog', 'newCaseForm', 'newCaseStatus', 'baselinePhoto', 'baselineFileLabel', 'caseName', 'caseNote', 'caseProduct', 'baselineConsent', 'followupNote', 'followupProduct', 'followupConsent', 'privacyDialog', 'closePrivacyButton', 'closeDialogButton', 'globalStatus',
].map((id) => [id, document.getElementById(id)]));

let records = loadRecords();
let activeId = records[0]?.id ?? null;
let scanPending = false;

function loadRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((record) => record && typeof record.id === 'string' && typeof record.title === 'string' && Array.isArray(record.entries));
  } catch {
    return [];
  }
}

function saveRecords() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function activeRecord() {
  return records.find((record) => record.id === activeId) ?? null;
}

function render() {
  const selected = activeRecord();
  elements.caseList.innerHTML = records.map((record, index) => `<button class="case-list-item ${record.id === activeId ? 'is-active' : ''}" type="button" data-case-id="${escapeHtml(record.id)}" aria-current="${record.id === activeId ? 'page' : 'false'}"><span class="case-list-number">${String(index + 1).padStart(2, '0')}</span><span class="case-list-text"><strong>${escapeHtml(record.title)}</strong><small>${record.entries.length} ${record.entries.length === 1 ? 'entry' : 'entries'} · ${formatDate(record.createdAt)}</small></span><span class="case-chevron" aria-hidden="true">↗</span></button>`).join('');
  elements.emptyState.hidden = records.length > 0;
  elements.caseView.hidden = !selected;
  elements.welcomeView.hidden = Boolean(selected);
  if (!selected) return;

  elements.caseNumber.textContent = String(records.indexOf(selected) + 1).padStart(2, '0');
  elements.caseTitle.textContent = selected.title;
  elements.caseDescription.textContent = selected.description || 'A personal record of what you noticed and when.';
  const first = selected.entries[0];
  const contextParts = [];
  if (first.product) contextParts.push(`<span class="context-label">PRODUCT / ROUTINE</span><strong>${escapeHtml(first.product)}</strong>`);
  if (first.note) contextParts.push(`<span class="context-label">YOUR NOTE</span><p>${escapeHtml(first.note)}</p>`);
  contextParts.push(`<span class="context-label">STARTED</span><strong>${formatDate(selected.createdAt)}</strong>`);
  elements.caseContext.innerHTML = contextParts.map((part) => `<div class="context-item">${part}</div>`).join('');

  const latest = selected.entries.at(-1);
  const previous = selected.entries.at(-2);
  elements.scanCount.textContent = `${selected.entries.length} ${selected.entries.length === 1 ? 'reading' : 'readings'}`;
  elements.latestScores.innerHTML = latest.scores.map((score) => {
    const prior = previous?.scores.find((item) => item.type === score.type);
    const currentReading = displayedScore(score);
    const priorReading = prior ? displayedScore(prior) : null;
    const comparable = currentReading && priorReading && currentReading.kind === priorReading.kind;
    const delta = comparable ? currentReading.value - priorReading.value : null;
    const change = !previous ? 'First reading' : !prior ? 'Not returned before' : !comparable ? 'Comparison unavailable' : `${delta > 0 ? '+' : ''}${delta} points vs previous`;
    const kindLabel = currentReading?.kind === 'raw' ? 'Raw score' : 'UI score';
    return `<div class="score-card"><span class="score-name">${escapeHtml(labels[score.type] ?? score.type)}</span><span class="score-value">${escapeHtml(formatScore(currentReading))}</span><span class="score-unit">${currentReading ? `${kindLabel} · /100` : 'score unavailable'}</span><span class="score-change ${!comparable ? 'change-first' : ''}">${escapeHtml(change)}</span></div>`;
  }).join('');
  elements.timeline.innerHTML = [...selected.entries].reverse().map((entry, reverseIndex) => {
    const ordinal = selected.entries.length - reverseIndex;
    const scoreLines = entry.scores.map((score) => {
      const reading = displayedScore(score);
      const source = reading?.kind === 'raw' ? 'raw' : 'UI';
      return `<span class="timeline-score"><b>${escapeHtml(labels[score.type] ?? score.type)}</b> ${escapeHtml(formatScore(reading))}<small>${reading ? `${source} · /100` : ''}</small></span>`;
    }).join('');
    return `<article class="timeline-entry"><div class="timeline-rail"><span class="timeline-point"></span>${reverseIndex < selected.entries.length - 1 ? '<span class="timeline-line"></span>' : ''}</div><div class="timeline-content"><div class="timeline-heading"><span class="timeline-step">ENTRY ${String(ordinal).padStart(2, '0')}</span><time datetime="${escapeHtml(entry.createdAt)}">${formatDate(entry.createdAt)}</time></div><div class="timeline-scores">${scoreLines}</div>${entry.product ? `<p class="timeline-product"><span aria-hidden="true">◈</span> Product / routine: <strong>${escapeHtml(entry.product)}</strong></p>` : ''}${entry.note ? `<p class="timeline-note">${escapeHtml(entry.note)}</p>` : ''}</div></article>`;
  }).join('');
  elements.caseList.querySelectorAll('[data-case-id]').forEach((button) => button.addEventListener('click', () => { activeId = button.dataset.caseId; render(); }));
}

function setStatus(target, message, kind = '') {
  target.textContent = message;
  target.className = `form-status ${kind}`.trim();
}

function setBusy(form, busy, message = '') {
  const submit = form.querySelector('[type="submit"]');
  if (submit) submit.disabled = busy;
  scanPending = busy;
  if (busy) setStatus(form.querySelector('.form-status'), message, 'is-working');
}

function validatePhoto(file) {
  if (!file) throw new Error('Choose a photo to continue.');
  if (!['image/jpeg', 'image/png'].includes(file.type)) throw new Error('Choose a JPEG or PNG image.');
  if (file.size > 10 * 1024 * 1024) throw new Error('The image must be under 10 MB.');
}

async function analyzePhoto(file, form) {
  validatePhoto(file);
  const consent = form.querySelector('[data-consent]');
  if (!consent.checked) throw new Error('Consent is required before sending your photo to YouCam.');
  try {
    const preflightKey = `${STORAGE_KEY}.preflight`;
    localStorage.setItem(preflightKey, '1');
    localStorage.removeItem(preflightKey);
  } catch {
    throw new Error('This browser cannot save a local case file right now. Free browser storage or change your privacy settings before using a scan.');
  }
  try {
    const decoded = await createImageBitmap(file);
    const shortestSide = Math.min(decoded.width, decoded.height);
    decoded.close();
    if (shortestSide < 480) throw new Error('For SD Skin Analysis, the photo’s shorter side must be at least 480 pixels.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('shorter side')) throw error;
    throw new Error('This image could not be read. Choose a valid JPEG or PNG photo.');
  }
  setBusy(form, true, 'Uploading your photo to YouCam…');
  let startResponse;
  try {
    startResponse = await fetch('/api/analysis', { method: 'POST', headers: { 'content-type': file.type, 'x-user-consent': 'true' }, body: file });
    const start = await startResponse.json();
    if (!startResponse.ok) throw new Error(start.error ?? 'The scan could not start.');
    setStatus(form.querySelector('.form-status'), 'YouCam is analyzing your photo…', 'is-working');
    const started = Date.now();
    while (Date.now() - started < 5 * 60 * 1000) {
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const response = await fetch(`/api/analysis/${encodeURIComponent(start.taskId)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'The scan status could not be checked.');
      if (result.status === 'error') throw new Error(result.error ?? 'YouCam could not process this photo.');
      if (result.status === 'success' && Array.isArray(result.scores) && result.scores.length) return result;
    }
    throw new Error('This scan is still processing. Wait a moment and try another check-in; no case entry was created.');
  } finally {
    scanPending = false;
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = false;
  }
}

function openCaseDialog() {
  if (scanPending) return;
  elements.newCaseForm.reset();
  elements.baselineFileLabel.textContent = 'Choose a front-facing selfie';
  setStatus(elements.newCaseStatus, '');
  elements.caseDialog.showModal();
  elements.caseName.focus();
}

for (const button of [elements.newCaseButton, elements.emptyStartButton, elements.welcomeStartButton]) button.addEventListener('click', openCaseDialog);
elements.closeDialogButton.addEventListener('click', () => elements.caseDialog.close());
elements.privacyButton.addEventListener('click', () => elements.privacyDialog.showModal());
elements.closePrivacyButton.addEventListener('click', () => elements.privacyDialog.close());
elements.caseDialog.addEventListener('click', (event) => { if (event.target === elements.caseDialog) elements.caseDialog.close(); });
elements.privacyDialog.addEventListener('click', (event) => { if (event.target === elements.privacyDialog) elements.privacyDialog.close(); });

elements.baselinePhoto.addEventListener('change', () => { elements.baselineFileLabel.textContent = elements.baselinePhoto.files[0]?.name ?? 'Choose a front-facing selfie'; });
elements.followupPhoto.addEventListener('change', () => { elements.followupFileLabel.textContent = elements.followupPhoto.files[0]?.name ?? 'Choose a selfie'; });

elements.newCaseForm.querySelector('.consent-row input').dataset.consent = '';
elements.followupConsent.dataset.consent = '';
elements.newCaseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (scanPending) return;
  const title = elements.caseName.value.trim();
  if (!title) { elements.caseName.focus(); setStatus(elements.newCaseStatus, 'Add a short name for this concern.', 'is-error'); return; }
  const submitForm = elements.newCaseForm;
  try {
    const result = await analyzePhoto(elements.baselinePhoto.files[0], submitForm);
    const record = {
      id: crypto.randomUUID(),
      title,
      description: elements.caseNote.value.trim(),
      createdAt: result.completedAt,
      entries: [{ id: crypto.randomUUID(), createdAt: result.completedAt, source: result.source, scores: result.scores, note: elements.caseNote.value.trim(), product: elements.caseProduct.value.trim() }],
    };
    records.unshift(record);
    if (!saveRecords()) {
      records.shift();
      setStatus(elements.newCaseStatus, 'YouCam returned a real reading, but this browser could not save the case file. No record was created; this scan used 9 API units.', 'is-error');
      return;
    }
    activeId = record.id;
    elements.caseDialog.close();
    render();
    document.querySelector('.main-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    setStatus(elements.newCaseStatus, error.message, 'is-error');
  } finally {
    elements.baselinePhoto.value = '';
    elements.baselineFileLabel.textContent = 'Choose a front-facing selfie';
  }
});

elements.followupForm.querySelector('.consent-row input').dataset.consent = '';
elements.followupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (scanPending) return;
  const record = activeRecord();
  if (!record) { setStatus(elements.followupStatus, 'Open a case before adding a follow-up.', 'is-error'); return; }
  try {
    const result = await analyzePhoto(elements.followupPhoto.files[0], elements.followupForm);
    const entry = { id: crypto.randomUUID(), createdAt: result.completedAt, source: result.source, scores: result.scores, note: elements.followupNote.value.trim(), product: elements.followupProduct.value.trim() };
    record.entries.push(entry);
    if (!saveRecords()) {
      record.entries.pop();
      setStatus(elements.followupStatus, 'YouCam returned a real reading, but this browser could not save the follow-up. The previous record is unchanged; this scan used 9 API units.', 'is-error');
      return;
    }
    elements.followupForm.reset();
    elements.followupFileLabel.textContent = 'Choose a selfie';
    render();
    setStatus(elements.followupStatus, 'Real YouCam reading added to this device.', 'is-success');
  } catch (error) {
    setStatus(elements.followupStatus, error.message, 'is-error');
  } finally {
    elements.followupPhoto.value = '';
  }
});

elements.printButton.addEventListener('click', () => window.print());
elements.deleteCaseButton.addEventListener('click', () => {
  const record = activeRecord();
  if (!record || !window.confirm('Delete this case file and its notes from this browser? This cannot be undone.')) return;
  const previous = records;
  records = records.filter((item) => item.id !== record.id);
  if (!saveRecords()) {
    records = previous;
    elements.globalStatus.textContent = 'Could not update local storage. The case file is still here.';
    return;
  }
  activeId = records[0]?.id ?? null;
  elements.globalStatus.textContent = 'Case file deleted from this browser.';
  render();
});

async function loadServiceStatus() {
  try {
    const response = await fetch('/api/status', { cache: 'no-store' });
    const status = await response.json();
    elements.serviceBadge.innerHTML = status.configured ? '<i class="is-ready"></i> Key configured' : '<i class="is-unavailable"></i> YouCam key needed';
    elements.serviceBadge.title = status.configured ? 'Server has an API key. Live analysis is not confirmed until a request succeeds.' : 'Add YOUCAM_API_KEY to the server environment to run a real analysis.';
    elements.serviceBadge.classList.toggle('service-ready', status.configured);
  } catch {
    elements.serviceBadge.innerHTML = '<i class="is-unavailable"></i> Service unavailable';
  }
}

render();
loadServiceStatus();
