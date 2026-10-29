import test from 'node:test';
import assert from 'node:assert/strict';
import { displayedScore, formatScore } from '../web/score-display.js';

test('prefers YouCam user-facing score and formats it on the 1 to 100 scale', () => {
  const reading = displayedScore({ rawScore: 57.33, uiScore: 68 });
  assert.deepEqual(reading, { value: 68, kind: 'ui' });
  assert.equal(formatScore(reading), '68');
});

test('rounds raw-score fallback to one decimal instead of exposing float precision', () => {
  const reading = displayedScore({ rawScore: 39.91963195800781, uiScore: null });
  assert.deepEqual(reading, { value: 39.9, kind: 'raw' });
  assert.equal(formatScore(reading), '39.9');
});

test('does not display values outside the documented range', () => {
  assert.equal(displayedScore({ rawScore: 0, uiScore: 101 }), null);
  assert.equal(formatScore(null), 'Unavailable');
});
