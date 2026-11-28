import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAutosaveState,
  autosaveReducer,
  flushAntrean,
} from './autosave.js';

test('gagal tidak berubah sendiri menjadi tersimpan', () => {
  const gagal = autosaveReducer(createAutosaveState(), { type: 'SAVE_FAIL' });
  assert.equal(gagal.status, 'gagal');
  assert.deepEqual(gagal, autosaveReducer(gagal, { type: 'NOOP' }));
});

test('retry manual menuju tersimpan setelah konfirmasi', () => {
  let state = autosaveReducer(createAutosaveState(), { type: 'SAVE_FAIL' });
  state = autosaveReducer(state, { type: 'RETRY' });
  assert.equal(state.status, 'menyimpan');
  state = autosaveReducer(state, { type: 'SAVE_OK', waktu: '2026-11-25T10:00:00.000Z' });
  assert.deepEqual(state, { status: 'tersimpan', waktuTersimpan: '2026-11-25T10:00:00.000Z' });
});

test('flush mengirim jawaban tertunda sebelum pengumpulan', async () => {
  const menunggu = new Map();
  const timer = setTimeout(() => {}, 800);
  const payload = { idSoal: 'soal-terakhir', jawaban: 'Jawaban esai' };
  menunggu.set('soal-terakhir', { timer, payload });
  const terkirim = [];
  const kirim = async (dikirim) => {
    terkirim.push(dikirim);
    return true;
  };

  await flushAntrean({ menunggu, aktif: new Set(), kirim });

  assert.deepEqual(terkirim, [payload]);
  assert.equal(menunggu.size, 0);
});

test('flush menunggu pengiriman berjalan dan menolak bila ada yang gagal', async () => {
  const menunggu = new Map();
  const kirim = async () => true;
  let selesaiDitunggu = false;
  const berjalan = Promise.resolve(false).then(() => {
    selesaiDitunggu = true;
    return false;
  });

  await assert.rejects(
    flushAntrean({ menunggu, aktif: new Set([berjalan]), kirim }),
    /Jawaban belum berhasil disimpan\. Pengumpulan dibatalkan\./,
  );
  assert.equal(selesaiDitunggu, true);
});

test('flush membatalkan timer yang tertunda', async () => {
  const menunggu = new Map();
  const timer = setTimeout(() => {}, 800);
  menunggu.set('soal-1', { timer, payload: { idSoal: 'soal-1' } });
  const dibatalkan = [];

  await flushAntrean({
    menunggu,
    aktif: new Set(),
    kirim: async () => true,
    hapusTimer: (t) => dibatalkan.push(t),
  });

  assert.deepEqual(dibatalkan, [timer]);
  clearTimeout(timer);
});

test('flush dengan antrean dan pengiriman kosong tidak memanggil kirim', async () => {
  let dipanggil = false;
  await flushAntrean({
    menunggu: new Map(),
    aktif: new Set(),
    kirim: async () => { dipanggil = true; return true; },
  });
  assert.equal(dipanggil, false);
});

test('flush mengirim semua payload yang tertunda', async () => {
  const menunggu = new Map([
    ['soal-1', { timer: null, payload: { idSoal: 'soal-1' } }],
    ['soal-2', { timer: null, payload: { idSoal: 'soal-2' } }],
  ]);
  const terkirim = [];
  await flushAntrean({
    menunggu,
    aktif: new Set(),
    kirim: async (payload) => { terkirim.push(payload.idSoal); return true; },
  });
  assert.deepEqual(terkirim, ['soal-1', 'soal-2']);
});

test('SAVE_START mempertahankan waktu tersimpan sebelumnya', () => {
  const waktu = '2026-11-28T10:00:00.000Z';
  const tersimpan = autosaveReducer(createAutosaveState(), { type: 'SAVE_OK', waktu });
  const menyimpan = autosaveReducer(tersimpan, { type: 'SAVE_START' });
  assert.equal(menyimpan.status, 'menyimpan');
  assert.equal(menyimpan.waktuTersimpan, waktu);
});
