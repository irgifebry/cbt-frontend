import test from 'node:test';
import assert from 'node:assert/strict';
import { mapCbtError } from './cbtErrors.js';

test('memetakan pesan error dari respons cbt-api', () => {
  assert.deepEqual(
    mapCbtError({ response: { status: 404, data: { message: 'Attempt tidak ditemukan' } } }),
    { message: 'Attempt tidak ditemukan', status: 404 }
  );
});

test('error jaringan memakai pesan default', () => {
  assert.deepEqual(mapCbtError(new Error('Network Error')), {
    message: 'Gagal terhubung ke layanan CBT',
    status: null,
  });
});
