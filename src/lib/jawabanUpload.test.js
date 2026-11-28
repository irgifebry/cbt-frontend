import test from 'node:test';
import assert from 'node:assert/strict';
import { normalisasiJawaban } from './jawabanUpload.js';

test('File dinormalisasi menjadi nama berkas yang dapat diserialisasi', () => {
  const berkas = new File(['isi contoh'], 'bukti-penyelesaian.pdf', {
    type: 'application/pdf',
  });
  const hasil = normalisasiJawaban(berkas);

  assert.equal(hasil, 'bukti-penyelesaian.pdf');
  assert.deepEqual(JSON.parse(JSON.stringify({ jawaban: hasil })), {
    jawaban: 'bukti-penyelesaian.pdf',
  });
});

test('jawaban null tetap null', () => {
  assert.equal(normalisasiJawaban(null), null);
});

test('jawaban string tidak diubah', () => {
  assert.equal(normalisasiJawaban('bukti.pdf'), 'bukti.pdf');
});
