import test from 'node:test';
import assert from 'node:assert/strict';

import generateColor from '../../utils/generateColor.js';

test('generateColor returns a valid hex color format', () => {
  const color = generateColor();
  assert.match(color, /^#[0-9a-fA-F]{6}$/);
});

test('generateColor produces enough variation across samples', () => {
  const samples = new Set();
  for (let i = 0; i < 100; i += 1) {
    samples.add(generateColor());
  }

  // White-box sanity check to catch accidental constant return regressions.
  assert.ok(samples.size > 1);
});
