import test from 'node:test';
import assert from 'node:assert/strict';
import { toProctorEvent, labelPeristiwaProctor } from './proctorEvents.js';

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

test('label tampilan peristiwa berbahasa Indonesia', () => {
  assert.equal(labelPeristiwaProctor('tab_hidden'), 'Halaman tidak terlihat');
  assert.equal(labelPeristiwaProctor('fullscreen_exit'), 'Keluar dari layar penuh');
  assert.equal(labelPeristiwaProctor('window_blur'), 'Fokus jendela hilang');
  assert.equal(labelPeristiwaProctor('tipe_baru'), 'tipe_baru');
});

test('input null tidak menghasilkan peristiwa', () => {
  assert.equal(toProctorEvent(null), null);
});

test('label untuk tipe tidak terdefinisi mengembalikan nilai aslinya', () => {
  assert.equal(labelPeristiwaProctor(undefined), undefined);
});
