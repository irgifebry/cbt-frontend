import test from 'node:test';
import assert from 'node:assert/strict';
import { mockAdapter } from './mockAdapter.js';

test('soal ditolak setelah ujian dipublikasikan', async () => {
  await mockAdapter.publishAssessment({ idAssessment: 'asesmen-1' });
  await assert.rejects(
    mockAdapter.saveQuestion({ idAssessment: 'asesmen-1', soal: { id: 'soal-1', kunci: 'A' } }),
    /Soal tidak dapat diubah setelah ujian dipublikasikan/
  );
});

test('payload instruktur memuat kunci', async () => {
  const soal = await mockAdapter.saveQuestion({ idAssessment: 'asesmen-2', soal: { id: 'soal-2', kunci: 'B' } });
  assert.equal(soal.kunci, 'B');
});

test('dua penyimpanan berturut-turut tanpa id menghasilkan id berbeda', async () => {
  const asesmen = await mockAdapter.createAssessment({ judul: 'Uji id soal' });
  const pertama = await mockAdapter.saveQuestion({
    idAssessment: asesmen.id,
    soal: { pertanyaan: 'Soal pertama' },
  });
  const kedua = await mockAdapter.saveQuestion({
    idAssessment: asesmen.id,
    soal: { pertanyaan: 'Soal kedua' },
  });

  assert.equal(typeof pertama.id, 'string');
  assert.equal(typeof kedua.id, 'string');
  assert.notEqual(pertama.id, kedua.id);
  assert.ok(!String(pertama.id).includes('undefined'));
  assert.ok(!String(kedua.id).includes('undefined'));

  const revisi = await mockAdapter.saveQuestion({
    idAssessment: asesmen.id,
    soal: { id: pertama.id, pertanyaan: 'Soal pertama revisi' },
  });
  assert.equal(revisi.id, pertama.id);
});

test('opsi soal tersimpan sebagai salinan mandiri', async () => {
  const asesmen = await mockAdapter.createAssessment({ judul: 'Uji salinan opsi' });
  const opsi = [{ id: 'A', teks: 'Teks asli' }];
  const tersimpan = await mockAdapter.saveQuestion({
    idAssessment: asesmen.id,
    soal: { pertanyaan: 'Soal dengan opsi', opsi },
  });

  assert.notStrictEqual(tersimpan.opsi, opsi);
  assert.notStrictEqual(tersimpan.opsi[0], opsi[0]);
  opsi[0].teks = 'Teks diubah';
  assert.equal(tersimpan.opsi[0].teks, 'Teks asli');
});
