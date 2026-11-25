# CBT Web UI — Alur Instruktur Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambah halaman instruktur CBT di `lms-frontend` (kelola ujian & soal, bobot, publikasi read-only, monitoring attempt, riwayat proctor, penilaian manual) di atas adapter mock yang sama dengan alur peserta.

**Architecture:** Menggunakan `cbtAdapter` dan `cbtApi` dari rencana alur peserta. Halaman instruktur tetap berada di dalam `ProtectedRoute allowedRole="dosen"` dan `DosenDashboardLayout` yang sudah ada. Logika bobot diuji murni dengan `node:test`; UI diverifikasi dengan build, lint, dan smoke dev server.

**Tech Stack:** React 19, Vite 8, react-router-dom 7, Tailwind 3, Node 26 `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-25-cbt-web-ui-design.md`
**Dependensi:** `docs/superpowers/plans/2026-11-25-cbt-web-ui-peserta.md` (Task 1 harus sudah ter-commit).

## Global Constraints

- Jangan mengubah `lms-backend/`, `lms-mobile/`, atau `cbt-api/`.
- Jangan mengubah alur `link_cbt` / `token_cbt` / `nilai_cbt` yang sudah ada.
- Total bobot lebih dari 100 ditolak; total kurang dari 100 tidak dinormalisasi (Q02 terbuka).
- Soal yang sudah dipublikasikan bersifat read-only (No. 9); mekanisme koreksi (Q07) tidak dibuat.
- Penilaian PG ganda tidak diimplementasi (Q01 terbuka); hanya form nilai esai/dokumen.
- Halaman hasil dan publikasi hasil tidak diaktifkan (Q04 terbuka).
- Riwayat proctor tanpa label kecurangan dan tanpa tindakan otomatis (Q08/Q09 terbuka).
- Semua teks antarmuka berbahasa Indonesia.
- Tidak menambah dependency npm; perubahan `overrides.uuid` yang belum ter-commit tidak boleh masuk ke commit fitur ini.
- Setiap task diakhiri commit kecil dengan pesan Conventional Commit.

## Review Focus

- Total bobot 101 harus ditolak, 100 diterima, 80 tidak dinormalisasi — diuji Task 1.
- Soal setelah publikasi harus menolak perubahan — diuji Task 2 (`saveQuestion` reject).
- Kunci jawaban harus tersedia untuk instruktur tetapi tidak untuk peserta — diuji Task 2.
- Error validasi bobot harus menampilkan pesan yang sama dengan aturan PRD — diuji Task 1.
- Rute instruktur tetap terlindungi oleh `ProtectedRoute` dosen — diverifikasi Task 3 (smoke tanpa token harus dialihkan).

---

### Task 1: Validasi Bobot Soal

**Files:**
- Create: `lms-frontend/src/lib/bobot.js`
- Create: `lms-frontend/src/lib/bobot.test.js`

**Interfaces:**
- Consumes: tidak ada.
- Produces: `validasiBobot(soal) -> { valid: boolean, errors: string[] }`
  - Input: array `{ bobot: number }`.
  - `total > 100` → `{ valid: false, errors: ['Total bobot tidak boleh lebih dari 100'] }`.
  - `total <= 100` → `{ valid: true, errors: [] }`. Tidak ada penolakan atau normalisasi untuk total di bawah 100.

- [ ] **Step 1: Tulis test yang gagal**

```js
// src/lib/bobot.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { validasiBobot } from './bobot.js';

test('total 101 ditolak', () => {
  assert.deepEqual(validasiBobot([{ bobot: 60 }, { bobot: 41 }]), {
    valid: false,
    errors: ['Total bobot tidak boleh lebih dari 100'],
  });
});

test('total 100 diterima', () => {
  assert.deepEqual(validasiBobot([{ bobot: 60 }, { bobot: 40 }]), { valid: true, errors: [] });
});

test('total 80 tidak dinormalisasi', () => {
  assert.deepEqual(validasiBobot([{ bobot: 80 }]), { valid: true, errors: [] });
});
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run (dari `lms-frontend/`): `node --test src/lib/bobot.test.js`
Expected: FAIL — modul belum ada.

- [ ] **Step 3: Implementasi fungsi murni**

`bobot.js`: jumlahkan `bobot` tiap soal, kembalikan bentuk sesuai Interfaces. Tanpa efek samping dan tanpa aturan lain.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --test src/lib/bobot.test.js`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/bobot.js src/lib/bobot.test.js
git commit -m "feat(cbt): add assessment weight validation"
```

---

### Task 2: Metode Adapter untuk Instruktur

**Files:**
- Modify: `lms-frontend/src/services/cbt/mockAdapter.js`
- Create: `lms-frontend/src/services/cbt/mockAdapter.instruktur.test.js`

**Interfaces:**
- Consumes: `cbtAdapter` dari rencana peserta Task 1.
- Produces (ditambahkan ke `cbtAdapter`):
  - `listAssessments({ idInstruktur }) -> Promise<Array<{ id, judul, status }>>`
  - `createAssessment(payload) -> Promise<{ id, judul, status: 'draft' }>`
  - `saveQuestion({ idAssessment, soal }) -> Promise<{ id, ...soal }>`; menolak dengan `Error('Soal tidak dapat diubah setelah ujian dipublikasikan')` bila assessment berstatus `'published'`.
  - `publishAssessment({ idAssessment }) -> Promise<{ id, status: 'published' }>`
  - `listAttemptsInstruktur({ idAssessment }) -> Promise<Array<{ id, idPeserta, status }>>`
  - `saveGrade({ idAttempt, idSoal, nilai }) -> Promise<{ tersimpan: true }>`
  - `listProctorEvents({ idAttempt })` sudah tersedia dari rencana peserta Task 1.
  -Payload `soal` untuk instruktur **boleh** memuat `kunci`; payload `getAttempt` untuk peserta tetap tidak boleh.

- [ ] **Step 1: Tulis test yang gagal**

```js
// src/services/cbt/mockAdapter.instruktur.test.js
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
```

- [ ] **Step 2: Jalankan test dan pastikan gagal**

Run: `node --test src/services/cbt/mockAdapter.instruktur.test.js`
Expected: FAIL — metode belum ada.

- [ ] **Step 3: Implementasi metode adapter**

Tambahkan state assessment di memori (object/Map) yang **di-seed** dengan `asesmen-1` dan `asesmen-2`, keduanya berstatus `'draft'`. `publishAssessment` mengubah status menjadi `'published'`. `saveQuestion` memeriksa status sebelum menulis. `createAssessment` menghasilkan id unik berikutnya `asesmen-N`.

- [ ] **Step 4: Jalankan test dan pastikan lulus**

Run: `node --test src/services/cbt/mockAdapter.instruktur.test.js`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/services/cbt/mockAdapter.js src/services/cbt/mockAdapter.instruktur.test.js
git commit -m "feat(cbt): add instructor methods to mock adapter"
```

---

### Task 3: Halaman Instruktur dan Routing

**Files:**
- Create: `lms-frontend/src/pages/dosen/cbt/DaftarUjianCbtPage.jsx`
- Create: `lms-frontend/src/pages/dosen/cbt/EditorUjianPage.jsx`
- Create: `lms-frontend/src/pages/dosen/cbt/EditorSoalPage.jsx`
- Create: `lms-frontend/src/pages/dosen/cbt/MonitoringAttemptPage.jsx`
- Create: `lms-frontend/src/pages/dosen/cbt/RiwayatProctorPage.jsx`
- Create: `lms-frontend/src/pages/dosen/cbt/PenilaianPage.jsx`
- Create: `lms-frontend/src/components/dosen/cbt/SoalEditor.jsx`
- Modify: `lms-frontend/src/App.jsx`

**Interfaces:**
- Consumes: `cbtAdapter` (Task 2), `validasiBobot` (Task 1).
- Produces: route di bawah grup dosen yang sudah ada:
  - `dosen/cbt/ujian` → `DaftarUjianCbtPage`
  - `dosen/cbt/ujian/:id/edit` → `EditorUjianPage`
  - `dosen/cbt/ujian/:id/soal` → `EditorSoalPage`
  - `dosen/cbt/ujian/:id/attempt` → `MonitoringAttemptPage`
  - `dosen/cbt/attempt/:id/proctor` → `RiwayatProctorPage`
  - `dosen/cbt/attempt/:id/nilai` → `PenilaianPage`
  - `HasilUjianPage` dan halaman publikasi hasil **tidak** didaftarkan.

- [ ] **Step 1: Implementasi halaman**

`DaftarUjianCbtPage.jsx`: panggil `listAssessments({ idInstruktur: 'instruktur-contoh-1' })`; tautkan ke editor, soal, dan monitoring.
`EditorUjianPage.jsx`: form judul/deskripsi/instruksi/referensi kursus contoh; tombol simpan memanggil `validasiBobot` sebelum `createAssessment`/update; tampilkan `errors` hasil validasi; tombol publikasi memanggil `publishAssessment` dan setelah itu form menjadi read-only.
`EditorSoalPage.jsx` + `SoalEditor.jsx`: empat tipe soal + kunci jawaban; `saveQuestion` dipanggil dari tombol simpan; jika assessment published, tampilkan pesan read-only dan sembunyikan tombol simpan.
`MonitoringAttemptPage.jsx`: `listAttemptsInstruktur`; tautkan ke riwayat proctor dan penilaian.
`RiwayatProctorPage.jsx`: `listProctorEvents` menampilkan tipe + waktu tanpa label kecurangan.
`PenilaianPage.jsx`: form nilai untuk esai/dokumen; memanggil `saveGrade`; tidak ada penilaian otomatis PG ganda.
`App.jsx`: tambah keenam route di dalam grup `/dosen` yang sudah dibungkus `ProtectedRoute allowedRole="dosen"`; jangan mengubah route lain.

- [ ] **Step 2: Verifikasi build dan lint**

Run: `cd lms-frontend && npm run build && npm run lint`
Expected: keduanya PASS tanpa error.

- [ ] **Step 3: Smoke test manual**

Run: `cd lms-frontend && npm run dev -- --host 127.0.0.1`
Expected: tanpa token, membuka `/dosen/cbt/ujian` dialihkan oleh `ProtectedRoute`; dengan akun dosen lokal, keenam halaman dapat dibuka; bobot 101 menampilkan pesan "Total bobot tidak boleh lebih dari 100"; setelah publikasi, editor soal read-only.

- [ ] **Step 4: Commit**

```bash
git add src/pages/dosen/cbt src/components/dosen/cbt src/App.jsx
git commit -m "feat(cbt): add instructor exam management screens"
```

---

### Task 4: Dokumentasi Pengembangan

**Files:**
- Modify: `lms-frontend/README.md`

**Interfaces:**
- Consumes: hasil Task 1–3 dari kedua rencana.
- Produces: bagian baru "Antarmuka CBT (pengembangan)" yang memuat `VITE_CBT_API_BASE_URL`, fakta bahwa mock adapter dipakai sampai endpoint bisnis tersedia, perintah `node --test`, `npm run build`, `npm run lint`, dan batasan Q01–Q12.

- [ ] **Step 1: Tulis dokumentasi**

Tambahkan bagian sesuai Interfaces. Nyatakan dengan tegas bahwa tidak untuk produksi dan tidak menggantikan alur `link_cbt` / `token_cbt` / `nilai_cbt`.

- [ ] **Step 2: Verifikasi isi**

Run: `cd lms-frontend && grep -n "Antarmuka CBT (pengembangan)" README.md`
Expected: satu baris cocok.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs(cbt): document local UI development and limits"
```
