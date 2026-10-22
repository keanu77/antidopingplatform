import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarDate, nextContentDateBoundary, assessEvidence, CONTENT_TIME_ZONE } from '../shared/content-evidence.mjs';

test('the content year boundary is the same instant in UTC, Taiwan and US runtimes', t => {
  const previousTimeZone = process.env.TZ;
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-12-31T15:59:59.999Z') });
  try {
    assert.equal(CONTENT_TIME_ZONE, 'Asia/Taipei');
    for (const timeZone of ['UTC', 'Asia/Taipei', 'America/Los_Angeles']) {
      process.env.TZ = timeZone;
      t.mock.timers.setTime(new Date('2026-12-31T15:59:59.999Z').getTime());
      assert.equal(calendarDate(), '2026-12-31', timeZone);
      assert.equal(assessEvidence('drug:guanfacine', 'wada-2026').valid, true, timeZone);
      assert.equal(nextContentDateBoundary().toISOString(), '2026-12-31T16:00:00.000Z', timeZone);

      t.mock.timers.setTime(new Date('2026-12-31T16:00:00.000Z').getTime());
      assert.equal(calendarDate(), '2027-01-01', timeZone);
      assert.equal(assessEvidence('drug:guanfacine', 'wada-2026').valid, false, timeZone);
      assert.equal(nextContentDateBoundary().toISOString(), '2027-01-01T16:00:00.000Z', timeZone);
    }
  } finally {
    if (previousTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimeZone;
  }
});

test('next Taiwan midnight handles month and leap-year boundaries', () => {
  assert.equal(nextContentDateBoundary(new Date('2026-10-31T15:00:00Z')).toISOString(), '2026-10-31T16:00:00.000Z');
  assert.equal(calendarDate(new Date('2026-10-31T16:00:00Z')), '2026-11-01');
  assert.equal(calendarDate(new Date('2028-02-28T16:00:00Z')), '2028-02-29');
  assert.equal(nextContentDateBoundary(new Date('2028-02-29T15:00:00Z')).toISOString(), '2028-02-29T16:00:00.000Z');
  assert.equal(calendarDate(new Date('2028-02-29T16:00:00Z')), '2028-03-01');
});

test('invalid dates cannot produce a content date or refresh boundary', () => {
  for (const value of [new Date(NaN), null, '2026-10-23']) {
    assert.equal(calendarDate(value), null);
    assert.equal(nextContentDateBoundary(value), null);
  }
});
