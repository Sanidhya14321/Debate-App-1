import test from 'node:test';
import assert from 'node:assert/strict';

import { rateLimiterConfig } from '../../middleware/rateLimiter.js';

test('rate limiter config exports positive numeric limits', () => {
  const values = Object.values(rateLimiterConfig);
  assert.ok(values.length > 0);

  for (const value of values) {
    assert.equal(typeof value, 'number');
    assert.ok(Number.isFinite(value));
    assert.ok(value > 0);
  }
});

test('general limits are not lower than auth limits by default', () => {
  assert.ok(rateLimiterConfig.GENERAL_MAX >= rateLimiterConfig.AUTH_MAX);
});
