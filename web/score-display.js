const MIN_SCORE = 1;
const MAX_SCORE = 100;

export function displayedScore(score) {
  const uiScore = Number(score?.uiScore);
  if (Number.isInteger(uiScore) && uiScore >= MIN_SCORE && uiScore <= MAX_SCORE) {
    return { value: uiScore, kind: 'ui' };
  }

  const rawScore = Number(score?.rawScore);
  if (Number.isFinite(rawScore) && rawScore >= MIN_SCORE && rawScore <= MAX_SCORE) {
    return { value: Math.round(rawScore * 10) / 10, kind: 'raw' };
  }

  return null;
}

export function formatScore(reading) {
  if (!reading) return 'Unavailable';
  return reading.kind === 'ui' ? String(reading.value) : reading.value.toFixed(1);
}
