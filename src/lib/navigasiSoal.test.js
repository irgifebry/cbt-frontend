import test from 'node:test';
import assert from 'node:assert/strict';
import { tampilkanTombolKumpulkan } from './navigasiSoal.js';

test('tombol kumpulkan muncul hanya pada soal terakhir', () => {
  assert.equal(tampilkanTombolKumpulkan(0, 3), false);
  assert.equal(tampilkanTombolKumpulkan(1, 3), false);
  assert.equal(tampilkanTombolKumpulkan(2, 3), true);
});

test('tombol kumpulkan tidak muncul untuk ujian tanpa soal', () => {
  assert.equal(tampilkanTombolKumpulkan(0, 0), false);
});

test('indeks di luar rentang tidak menampilkan tombol kumpulkan', () => {
  assert.equal(tampilkanTombolKumpulkan(-1, 3), false);
  assert.equal(tampilkanTombolKumpulkan(3, 3), false);
  assert.equal(tampilkanTombolKumpulkan(1.5, 3), false);
  assert.equal(tampilkanTombolKumpulkan(2, '3'), false);
});
