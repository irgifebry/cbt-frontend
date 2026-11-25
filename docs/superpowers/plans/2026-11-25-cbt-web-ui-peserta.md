# CBT Web UI — Alur Peserta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun antarmuka web peserta CBT di `lms-frontend` (daftar ujian, konfirmasi, pengerjaan dengan autosave dan proctoring) di atas adapter mock, tanpa menyentuh repositori lain.

**Architecture:** Client Axios kedua (`cbtApi.js`) dipisah dari client LMS. Komponen memanggil `cbtAdapter` yang saat ini diisi mock; adapter diganti kemudian tanpa mengubah komponen. Logika murni (error, status autosave, pemetaan event) diuji dengan `node:test` bawaan Node; UI diverifikasi dengan build, lint, dan smoke dev server.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, Axios 1, Tailwind 3, Node 26 `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-25-cbt-web-ui-design.md`

## Global Constraints

- Jangan mengubah `lms-backend/`, `lms-mobile/`, atau `cbt-api/`.
- Jangan mengubah alur `link_cbt` / `token_cbt` / `nilai_cbt` yang sudah ada.
- Q01–Q12 tidak diterapkan sebagai perilaku: hasil tidak ditampilkan, penilaian PG ganda tidak dibuat, unggah tanpa validasi format/ukuran sampai Q06.
- Proctoring hanya mencatat; tidak ada peringatan, penghentian, atau pengurangan nilai.
- Autosave tanpa retry otomatis; status "tersimpan" hanya setelah adapter mengonfirmasi.
- Resume attempt yang sedang berjalan wajib tersedia di daftar ujian (R08).
- Kunci jawaban tidak pernah dikirim ke payload peserta.
- Semua teks antarmuka berbahasa Indonesia.
- Tidak menambah dependency npm. File `lms-frontend/package.json` dan `package-lock.json` memiliki perubahan belum ter-commit (`overrides.uuid`) — **jangan** memasukkan perubahan itu ke commit fitur ini.
- Setiap task diakhiri commit kecil dengan pesan Conventional Commit.

## Review Focus

- Attempt berstatus `berjalan` harus muncul di daftar dan bisa dilanjutkan — diuji Task 1 (`listAttempts`).
- Kunci jawaban harus absent dari payload soal peserta — diuji Task 1 (`getAttempt`).
- Jawaban yang gagal disimpan tidak boleh dilaporkan "tersimpan" dan tidak auto-retry — diuji Task 2 (`SAVE_FAIL` tanpa event lanjutan).
- Peristiwa browser yang tidak dikenal harus diabaikan, bukan dikirim sebagai proctor event — diuji Task 3 (`toProctorEvent` null).
- Error jaringan harus punya pesan default yang tidak membocorkan detail — diuji Task 1 (`mapCbtError`).

---

### Task 1: Client CBT dan Adapter Mock

**Files:**
- Create: `lms-frontend/src/config/cbtApi.js`
- Create: `lms-frontend/src/lib/cbtErrors.js`
- Create: `lms-frontend/src/services/cbt/mockAdapter.js`
- Create: `lms-frontend/src/services/cbt/index.js`
- Create: `lms-frontend/src/lib/cbtErrors.test.js`
- Create: `lms-frontend/src/services/cbt/mockAdapter.test.js`
- Modify: `lms-frontend/.env.example`

**Interfaces:**
- Consumes: Axios (sudah terpasang), Vite `import.meta.env`.
- Produces:
  - `mapCbtError(error) -> { message: string, status: number|null }`
  - `cbtApi` (instance Axios dengan `baseURL = import.meta.env.VITE_CBT_API_BASE_URL`, tanpa header Authorization)
  - `cbtAdapter` dengan metode persis: `listAttempts({ idPeserta })`, `getAttempt({ idAttempt })`, `saveAnswer({ idAttempt, idSoal, jawaban, idempotencyKey })`, `submitAttempt({ idAttempt })`, `listProctorEvents({ idAttempt })`, `sendProctorEvent({ idAttempt, tipe, waktu })`.
  - `getAttempt` mengembalikan `{ id, judul, sisaDetik, soal: [{ id, nomor, tipe, pertanyaan, opsi, jawabanTersimpan }] }`.
  - `listAttempts` mengembalikan array `{ id, judul, status, batasWaktu }`, dengan minimal satu item berstatus `'berjalan'`.
  - `saveAnswer` mengembalikan `{ tersimpan: true, waktu }` (ISO string).

- [ ] **Step 1: Tulis test yang gagal**

```js
// src/lib/cbtErrors.test.js
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
```

```js
// src/services/cbt/mockAdapter.test.js
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
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run (dari `lms-frontend/`): `node --test src/lib/cbtErrors.test.js src/services/cbt/mockAdapter.test.js`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi modul**

`cbtErrors.js`: baca `error?.response?.data?.message` (string) dan `error?.response?.status`; jika tidak ada, kembalikan pesan default `'Gagal terhubung ke layanan CBT'` dan `status: null`.
`cbtApi.js`: `axios.create` dengan `timeout: 15000`, header JSON, interceptor response yang melempar hasil `mapCbtError(error)`; **tanpa** interceptor Bearer.
`mockAdapter.js`: data contoh dengan ID tetap — soal `soal-1` (pilihan tunggal), `soal-2` (esai), `soal-3` (unggah), masing-masing menyimpan field `kunci` di sumber; attempt `attempt-1` (status `'berjalan'`) dan `attempt-2` (status `'selesai'`) untuk peserta `peserta-contoh-1`. `getAttempt` membuang field `kunci` dari setiap soal; `saveAnswer` mengisi `waktu: new Date().toISOString()`.
`index.js`: `export const cbtAdapter = mockAdapter;`
`.env.example`: tambah baris `VITE_CBT_API_BASE_URL=http://127.0.0.1:8001/api`.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --test src/lib/cbtErrors.test.js src/services/cbt/mockAdapter.test.js`
Expected: PASS (5 test).

- [ ] **Step 5: Commit**

```bash
git add src/config/cbtApi.js src/lib/cbtErrors.js src/lib/cbtErrors.test.js src/services/cbt/mockAdapter.js src/services/cbt/mockAdapter.test.js src/services/cbt/index.js .env.example
git commit -m "feat(cbt): add web client and mock adapter for participant flow"
```

---

### Task 2: Mesin Status Autosave

**Files:**
- Create: `lms-frontend/src/lib/autosave.js`
- Create: `lms-frontend/src/lib/autosave.test.js`

**Interfaces:**
- Consumes: tidak ada.
- Produces:
  - `createAutosaveState() -> { status: 'idle', waktuTersimpan: null }`
  - `autosaveReducer(state, event) -> state`; event: `{ type: 'SAVE_START' }`, `{ type: 'SAVE_OK', waktu }`, `{ type: 'SAVE_FAIL' }`, `{ type: 'RETRY' }`.
  - Status yang dihasilkan: `'idle' | 'menyimpan' | 'tersimpan' | 'gagal'`.

- [ ] **Step 1: Tulis test yang gagal**

```js
// src/lib/autosave.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createAutosaveState, autosaveReducer } from './autosave.js';

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
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --test src/lib/autosave.test.js`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi reducer**

`autosave.js`: reducer murni tanpa efek samping; event selain empat jenis di atas mengembalikan `state` apa adanya. Tidak ada timer atau retry di dalam reducer.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --test src/lib/autosave.test.js`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/autosave.js src/lib/autosave.test.js
git commit -m "feat(cbt): add autosave status reducer"
```

---

### Task 3: Pemetaan Peristiwa Proctoring

**Files:**
- Create: `lms-frontend/src/lib/proctorEvents.js`
- Create: `lms-frontend/src/lib/proctorEvents.test.js`

**Interfaces:**
- Consumes: tidak ada.
- Produces: `toProctorEvent(input) -> { tipe: 'tab_hidden' | 'fullscreen_exit' | 'window_blur', waktu } | null`
  - Input: `{ type: 'visibilitychange' | 'fullscreenchange' | 'blur', hidden: boolean, fullscreen: boolean, waktu: string }`.
  - `visibilitychange` + `hidden === true` → `tab_hidden`.
  - `fullscreenchange` + `fullscreen === false` → `fullscreen_exit`.
  - `blur` → `window_blur`.
  - Selain itu → `null`.

- [ ] **Step 1: Tulis test yang gagal**

```js
// src/lib/proctorEvents.test.js
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
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --test src/lib/proctorEvents.test.js`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi pemetaan**

`proctorEvents.js`: fungsi murni, tanpa mengirim jaringan dan tanpa konsekuensi apa pun.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --test src/lib/proctorEvents.test.js`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/proctorEvents.js src/lib/proctorEvents.test.js
git commit -m "feat(cbt): add proctor event mapper"
```

---

### Task 4: Halaman Peserta dan Routing

**Files:**
- Create: `lms-frontend/src/hooks/useAutoSave.js`
- Create: `lms-frontend/src/hooks/useProctorEvents.js`
- Create: `lms-frontend/src/components/peserta/SoalInput.jsx`
- Create: `lms-frontend/src/pages/peserta/DaftarUjianPage.jsx`
- Create: `lms-frontend/src/pages/peserta/KonfirmasiUjianPage.jsx`
- Create: `lms-frontend/src/pages/peserta/PengerjaanUjianPage.jsx`
- Create: `lms-frontend/src/pages/peserta/HasilUjianPage.jsx`
- Modify: `lms-frontend/src/App.jsx`

**Interfaces:**
- Consumes: `cbtAdapter` (Task 1), `autosaveReducer`/`createAutosaveState` (Task 2), `toProctorEvent` (Task 3).
- Produces:
  - `useAutoSave({ idAttempt }) -> { status, waktuTersimpan, simpan({ idSoal, jawaban }), cobaLagi({ idSoal, jawaban }) }`
  - `useProctorEvents({ idAttempt, aktif })` — memasang/melepaskan listener, tidak mengembalikan nilai.
  - Route: `/cbt`, `/cbt/attempt/:id/konfirmasi`, `/cbt/attempt/:id`. `HasilUjianPage` **tidak** didaftarkan sebagai route.

- [ ] **Step 1: Implementasi hook dan komponen**

`useAutoSave.js`: debounce 800 ms; setiap `simpan` memanggil `cbtAdapter.saveAnswer` dengan `idempotencyKey` yang dibuat sekali per pasangan `idSoal`+attempt; dispatch `SAVE_START`/`SAVE_OK`/`SAVE_FAIL`; `cobaLagi` memakai kunci idempotensi yang sama dan **tidak** memicu timer otomatis.
`useProctorEvents.js`: pasang `visibilitychange`, `fullscreenchange`, `blur` hanya saat `aktif === true`; tiap event dikirim ke `toProctorEvent`, lalu `cbtAdapter.sendProctorEvent` bila tidak null; bersihkan listener saat unmount.
`SoalInput.jsx`: empat tipe soal; untuk `document_upload` pakai `<input type="file">` tanpa atribut `accept` dan tanpa validasi ukuran.
`DaftarUjianPage.jsx`: panggil `cbtAdapter.listAttempts({ idPeserta: 'peserta-contoh-1' })`, tampilkan status, dan tautkan attempt berstatus `'berjalan'` ke halaman pengerjaan.
`PengerjaanUjianPage.jsx`: ambil `getAttempt`, tampilkan `sisaDetik` dari server, `SoalInput`, indikator status dari `useAutoSave`, tombol kumpulkan yang memanggil `submitAttempt`, dan `requestFullscreen()` saat tombol Mulai dengan `catch` yang tetap melanjutkan ujian.
`App.jsx`: tambah tiga route di atas sebelum catch-all; jangan mengubah route dosen/admin yang ada.

- [ ] **Step 2: Verifikasi build dan lint**

Run: `cd lms-frontend && npm run build && npm run lint`
Expected: keduanya PASS tanpa error.

- [ ] **Step 3: Smoke test manual**

Run: `cd lms-frontend && npm run dev -- --host 127.0.0.1`
Expected: `/cbt` menampilkan attempt contoh; attempt berstatus berjalan membuka pengerjaan; mengisi jawaban menampilkan "Menyimpan…" lalu "Tersimpan"; tidak ada error di console; `/cbt/attempt/attempt-1/konfirmasi` dapat dibuka. Tidak ada halaman hasil yang bisa dibuka lewat URL.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAutoSave.js src/hooks/useProctorEvents.js src/components/peserta src/pages/peserta src/App.jsx
git commit -m "feat(cbt): add participant exam screens and routes"
```
