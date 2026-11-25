import test from 'node:test';
import assert from 'node:assert/strict';
import { toProctorEvent } from './proctorEvents.js';

test('memetakan tiga peristiwa yang dikenal', () => {
  const waktu = '2026-11-25T10:00:00.000Z';
  assert.deepEqual(toProctorEvent({ type: 'visibilitychange', hidden: true, waktu }), { tipe: 'tab_hidden', waktu });
  assert.deepEqual(toProctorEvent({ type: 'fullscreenchange', fullscreen: false, waktu }), { tipe: 'fullscreen_exit', waktu });
  assert.deepEqual(toProctorEvent({ type: 'blur', waktu }), { tipe: 'window_blur', waktu });
});

test('peristiwa lain diabaikan', () => {
  assert.equal(toProctorEvent({ type: 'visibilitychange', hidden: false }), null);
  assert.equal(toProctorEvent({ type: 'unknown' }), null);
});
