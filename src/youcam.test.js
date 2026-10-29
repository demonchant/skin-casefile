import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSkinResult, YouCamError } from './youcam.js';

test('parser preserves real-contract fields and discards unrequested output types', () => {
  // Isolated schema fixture only; it is not product data or evidence of a live API call.
  const result = parseSkinResult({ results: { output: [
    { type: 'acne', raw_score: 71.25, ui_score: 74 },
    { type: 'redness', raw_score: 82, ui_score: 84 },
    { type: 'wrinkle', raw_score: 93, ui_score: 95 },
  ] } });
  assert.deepEqual(result, [
    { type: 'acne', rawScore: 71.25, uiScore: 74 },
    { type: 'redness', rawScore: 82, uiScore: 84 },
  ]);
});

test('parser rejects a successful task with no requested score data', () => {
  assert.throws(() => parseSkinResult({ results: { output: [{ type: 'wrinkle', raw_score: 90 }] } }), (error) => {
    assert.ok(error instanceof YouCamError);
    assert.equal(error.code, 'INVALID_RESULT');
    return true;
  });
});

test('parser does not treat missing or null scores as numeric zero', () => {
  assert.throws(() => parseSkinResult({ results: { output: [{ type: 'acne', raw_score: null, ui_score: null }] } }), (error) => error.code === 'INVALID_RESULT');
});

test('parser only accepts values within YouCam documented score range', () => {
  assert.throws(() => parseSkinResult({ results: { output: [{ type: 'redness', raw_score: 0, ui_score: 101 }] } }), (error) => error.code === 'INVALID_RESULT');
});
