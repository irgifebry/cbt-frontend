import test from 'node:test';
import assert from 'node:assert/strict';
import { mockAdapter } from './mockAdapter.js';

test('getAttempt tidak mengirim kunci jawaban ke peserta', async () => {
  const attempt = await mockAdapter.getAttempt({ idAttempt: 'attempt-1' });
  assert.ok(attempt.soal.length > 0);
  for (const soal of attempt.soal) assert.equal('kunci' in soal, false);
});

test('daftar attempt menyertakan attempt yang sedang berjalan', async () => {
  const daftar = await mockAdapter.listAttempts({ idPeserta: 'peserta-contoh-1' });
  assert.ok(daftar.some((item) => item.status === 'berjalan'));
});

test('simpan jawaban mengembalikan konfirmasi server', async () => {
  const hasil = await mockAdapter.saveAnswer({
    idAttempt: 'attempt-1', idSoal: 'soal-1', jawaban: 'A', idempotencyKey: 'kunci-1',
  });
  assert.equal(hasil.tersimpan, true);
  assert.ok(!Number.isNaN(Date.parse(hasil.waktu)));
});

test('jawaban tersimpan dapat dibaca kembali tanpa membocorkan kunci', async () => {
  await mockAdapter.saveAnswer({
    idAttempt: 'attempt-1',
    idSoal: 'soal-2',
    jawaban: 'Jawaban esai tersimpan',
    idempotencyKey: 'kunci-2',
  });

  const attempt = await mockAdapter.getAttempt({ idAttempt: 'attempt-1' });
  const soal = attempt.soal.find((item) => item.id === 'soal-2');
  assert.equal(soal.jawabanTersimpan, 'Jawaban esai tersimpan');
  assert.equal('kunci' in soal, false);
});

test('attempt ditandai selesai setelah dikumpulkan', async () => {
  await mockAdapter.submitAttempt({ idAttempt: 'attempt-1' });
  const daftar = await mockAdapter.listAttempts({ idPeserta: 'peserta-contoh-1' });
  assert.equal(daftar.find((item) => item.id === 'attempt-1').status, 'selesai');
});
