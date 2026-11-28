# Laporan perbaikan akhir — UI web CBT (`feat/cbt-web-ui`)

**Base perbaikan:** `d6bc91b`
**Workspace kode:** `/Volumes/Backup/Irgi/NyobaNyobaBikinAplikasiWeb/U-Cademy/lms-frontend-cbt-ui`
**Lingkup:** empat temuan Important dari review seluruh cabang. Tidak ada perubahan `lms-backend`, `lms-mobile`, `cbt-api`, `package.json`, `package-lock.json`, alur `link_cbt`/`token_cbt`/`nilai_cbt`, atau perilaku Q01–Q12.

## Ringkasan komit

| SHA singkat | Subjek |
|---|---|
| `3ffbf48` | `fix(cbt): flush pending answers before submitting attempt` |
| `062a1e5` | `fix(cbt): assign question ids and copy nested options` |
| `94b1b43` | `fix(cbt): reject invalid assessment weights` |
| `d15da01` | `fix(cbt): validate manual grade before saving` |
| `576831f` | `fix(cbt): issue fresh question id on each save` |

Komit kelima adalah tindak lanjut temuan #2: skenario browser pertama menunjukkan bahwa menyimpan id hasil pembuatan ke state editor membuat dua kali klik **Simpan soal** memperbarui entri yang sama. Karena editor ini belum memiliki daftar/identitas soal yang sedang disunting, setiap klik kini membuat id baru; perilaku ini sudah sesuai dengan uji regresi "dua penyimpanan berurutan menghasilkan id berbeda".

---

## Temuan 1 — Submit tidak mengosongkan antrean debounce 800 ms

### Yang diubah

- `src/lib/autosave.js`: fungsi murni baru `flushAntrean({ menunggu, aktif, kirim, hapusTimer })`. Fungsi ini:
  - menyalin seluruh entri tertunda lalu mengosongkan `Map`;
  - membatalkan setiap `setTimeout` yang masih berjalan;
  - langsung memanggil `kirim(payload)` untuk jawaban yang tertunda;
  - ikut menunggu `Promise` pengiriman yang sudah berjalan (`aktif`);
  - melempar `Error('Jawaban belum berhasil disimpan. Pengumpulan dibatalkan.')` bila ada pengiriman yang gagal.
- `src/hooks/useAutoSave.js`:
  - `kirim` kini mengembalikan `true`/`false` dan mendaftarkan setiap `Promise` ke `pengirimanAktif` (dihapus setelah selesai), sehingga kegagalan dapat dideteksi tanpa `unhandled rejection`;
  - entri antrean menyimpan `{ timer, payload }`;
  - hook mengekspos `flush()`.
- `src/pages/peserta/PengerjaanUjianPage.jsx`: `kumpulkan()` melakukan `await flush()` sebelum `submitAttempt`. Bila flush gagal, submit dibatalkan, tombol tidak mengklaim berhasil, dan pesan `role="alert"` ditampilkan: "Jawaban belum berhasil disimpan. Pengumpulan dibatalkan. Silakan coba lagi." Kegagalan `submitAttempt` tetap memakai pesan "Pengumpulan gagal. Silakan coba lagi."
- `src/lib/autosave.test.js`: dua uji regresi murni (antrean terkirim dan antrean dikosongkan; pengiriman berjalan ditunggu dan kegagalan menolak).
- `README.md`: bagian "Penyimpanan jawaban dan pengumpulan".

### Check yang menutup

1. Uji murni `flushAntrean` — dua test baru di `src/lib/autosave.test.js`.
2. Skenario browser: jawab soal terakhir, langsung klik **Kumpulkan** dalam waktu < 800 ms; urutan panggilan adapter harus `saveAnswer:start → saveAnswer:end → submitAttempt`.

### Perintah dan output

```bash
cd /Volumes/Backup/Irgi/NyobaNyobaBikinAplikasiWeb/U-Cademy/lms-frontend-cbt-ui
node --test src/lib/*.test.js src/services/cbt/*.test.js
```

```
✔ flush mengirim jawaban tertunda sebelum pengumpulan (1.617741ms)
✔ flush menunggu pengiriman berjalan dan menolak bila ada yang gagal (0.713946ms)
...
ℹ tests 22
ℹ suites 0
ℹ pass 22
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 160.738562
```

Server dev dijalankan terpisah:

```bash
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

Skenario browser (skrip lengkap di Lampiran):

```bash
cp /private/var/folders/qz/fzlplqss3kq2zwdplnszgv9r0000gn/T/opencode/cbt-final-fix-browser.mjs .cbt-final-fix-browser.mjs
node .cbt-final-fix-browser.mjs
rm -f .cbt-final-fix-browser.mjs
```

```
SKENARIO 1 urutan panggilan: ["saveAnswer:start","saveAnswer:end","submitAttempt"]
SKENARIO 1 LULUS: jawaban tersimpan sebelum attempt dikumpulkan
```

---

## Temuan 2 — Setiap soal tersimpan dengan `id: undefined`

### Yang diubah

- `src/pages/dosen/cbt/EditorSoalPage.jsx`: sebelum `saveQuestion`, editor membuat `id: globalThis.crypto.randomUUID()` untuk setiap penyimpanan. Toast memakai id yang dikembalikan adapter, sehingga tidak lagi "Soal undefined tersimpan."
- `src/services/cbt/mockAdapter.js`:
  - `salinSoal()` menyalin objek dan `opsi` bersarang (`map((opsi) => ({ ...opsi }))`) baik saat disimpan maupun saat dikembalikan;
  - `saveQuestion` memakai `soal.id || globalThis.crypto.randomUUID()` bila id tidak dikirim pemanggil, mencari indeks memakai id yang sama, lalu menyimpan salinan mandiri.
- `src/services/cbt/mockAdapter.instruktur.test.js`: uji dua penyimpanan berturut-turut tanpa id (id berjenis string, bukan `undefined`, berbeda, dan id lama tetap bisa dipakai untuk pembaruan) serta uji salinan `opsi`.
- `README.md`: bagian "Penyimpanan soal".

### Check yang menutup

1. Uji murni adapter: `dua penyimpanan berturut-turut tanpa id menghasilkan id berbeda` dan `opsi soal tersimpan sebagai salinan mandiri`.
2. Skenario browser: dua klik berturut-turut pada **Simpan soal** → dua UUID nyata yang berbeda dan toast tanpa "undefined".

### Perintah dan output

```bash
node --test src/lib/*.test.js src/services/cbt/*.test.js
```

```
✔ dua penyimpanan berturut-turut tanpa id menghasilkan id berbeda (5.314141ms)
✔ opsi soal tersimpan sebagai salinan mandiri (0.324ms)
...
ℹ pass 22
ℹ fail 0
```

```bash
node .cbt-final-fix-browser.mjs
```

```
SKENARIO 2 ids soal: ["95b68b19-01a4-4ea5-930d-8def76b6ae4a","4648ac03-2fc6-411e-a79b-438858ce666c"]
SKENARIO 2 toast: ["Soal 4648ac03-2fc6-411e-a79b-438858ce666c tersimpan."]
SKENARIO 2 LULUS: dua id berbeda dan toast tanpa "undefined"
```

---

## Temuan 3 — Bobot negatif lolos dari validasi

### Yang diubah

- `src/lib/bobot.js`: `validasiBobot` menolak lebih dulu bobot yang bukan `number`/tidak hingga dengan pesan "Bobot harus berupa angka", lalu bobot `< 0` dengan pesan "Bobot tidak boleh negatif", baru setelah itu memeriksa total > 100. Tidak ada normalisasi dan tidak ada aturan Q01–Q12 yang ditambahkan. `EditorUjianPage` tetap memakai `validasiBobot` dan daftar `errors` yang sudah ada.
- `src/lib/bobot.test.js`: empat kasus baru — negatif dengan total 100, `Number('abc')`, `Infinity`, dan teks `'50'`.
- `README.md`: bagian "Validasi bobot".

### Check yang menutup

Uji murni `src/lib/bobot.test.js` (kasus lama tetap lulus).

### Perintah dan output

```bash
node --test src/lib/*.test.js src/services/cbt/*.test.js
```

```
✔ total 101 ditolak (2.03628ms)
✔ total 100 diterima (0.275459ms)
✔ total 80 tidak dinormalisasi (0.230229ms)
✔ bobot negatif ditolak meskipun totalnya 100 (0.175207ms)
✔ bobot bukan angka ditolak (0.222712ms)
✔ bobot tak hingga ditolak (0.187412ms)
✔ bobot berupa teks ditolak (0.193914ms)
...
ℹ pass 22
ℹ fail 0
```

---

## Temuan 4 — Nilai kosong menjadi `NaN` dan dilaporkan tersimpan

### Yang diubah

- `src/pages/dosen/cbt/PenilaianPage.jsx`:
  - state `validasiNilai` per soal;
  - `simpan(idSoal)` menolak `null`/string kosong/whitespace/`NaN`/`Infinity` sebelum memanggil adapter, dan tidak mengubah status menjadi "tersimpan";
  - validasi inline `role="alert"` dengan teks "Nilai harus diisi dengan angka." ditampilkan di bawah kolom input, `aria-invalid` mengikuti keadaan validasi;
  - pesan validasi hilang saat pengguna mengubah nilai; nilai yang valid tetap dikirim sebagai angka.
- `README.md`: bagian "Penilaian manual".

### Check yang menutup

Skenario browser: klik **Simpan nilai** pada kolom kosong → validasi tampil, `saveGrade` tidak dipanggil, tidak ada klaim "Nilai tersimpan."; lalu isi `85` dan simpan → tepat satu panggilan `saveGrade` dengan `nilai: 85`.

### Perintah dan output

```bash
node .cbt-final-fix-browser.mjs
```

```
SKENARIO 4 validasi: ["Nilai harus diisi dengan angka."]
SKENARIO 4 panggilan saveGrade: []
SKENARIO 4 LULUS: validasi inline tampil, saveGrade tidak dipanggil
SKENARIO 4 panggilan setelah nilai diisi: [{"idAttempt":"attempt-1","idSoal":"soal-2","nilai":85}]
SKENARIO 4 LULUS: nilai valid tetap tersimpan
SEMUA SKENARIO BROWSER LULUS
```

---

## Gate verifikasi bersama

### 1. Seluruh uji murni CBT

```bash
cd /Volumes/Backup/Irgi/NyobaNyobaBikinAplikasiWeb/U-Cademy/lms-frontend-cbt-ui
node --test src/lib/*.test.js src/services/cbt/*.test.js
```

Output lengkap (final, setelah komit terakhir):

```
✔ gagal tidak berubah sendiri menjadi tersimpan (2.263861ms)
✔ retry manual menuju tersimpan setelah konfirmasi (3.813162ms)
✔ flush mengirim jawaban tertunda sebelum pengumpulan (1.617741ms)
✔ flush menunggu pengiriman berjalan dan menolak bila ada yang gagal (0.713946ms)
✔ total 101 ditolak (2.03628ms)
✔ total 100 diterima (0.275459ms)
✔ total 80 tidak dinormalisasi (0.230229ms)
✔ bobot negatif ditolak meskipun totalnya 100 (0.175207ms)
✔ bobot bukan angka ditolak (0.222712ms)
✔ bobot tak hingga ditolak (0.187412ms)
✔ bobot berupa teks ditolak (0.193914ms)
✔ memetakan pesan error dari respons cbt-api (2.46474ms)
✔ error jaringan memakai pesan default (0.253157ms)
✔ memetakan tiga peristiwa yang dikenal (1.927467ms)
✔ peristiwa lain diabaikan (0.292608ms)
✔ soal ditolak setelah ujian dipublikasikan (1.782429ms)
✔ payload instruktur memuat kunci (0.311786ms)
✔ dua penyimpanan berturut-turut tanpa id menghasilkan id berbeda (5.314141ms)
✔ opsi soal tersimpan sebagai salinan mandiri (0.324ms)
✔ getAttempt tidak mengirim kunci jawaban ke peserta (1.414018ms)
✔ daftar attempt menyertakan attempt yang sedang berjalan (0.343526ms)
✔ simpan jawaban mengembalikan konfirmasi server (12.796974ms)
ℹ tests 22
ℹ suites 0
ℹ pass 22
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 160.738562
```

### 2. ESLint pada semua berkas kode yang diubah

```bash
npx eslint src/hooks/useAutoSave.js src/lib/autosave.js src/lib/autosave.test.js src/lib/bobot.js src/lib/bobot.test.js src/pages/dosen/cbt/EditorSoalPage.jsx src/pages/dosen/cbt/PenilaianPage.jsx src/pages/peserta/PengerjaanUjianPage.jsx src/services/cbt/mockAdapter.js src/services/cbt/mockAdapter.instruktur.test.js
```

Output: tidak ada pesan (kode keluar `0`). `README.md` tidak diketik sebagai berkas JS/JSX sehingga ESLint hanya memberi peringatan "File ignored because no matching configuration was supplied"; berkas tersebut tidak dimasukkan dalam daftar di atas.

Catatan: `npm run lint` tidak dipakai sebagai gate karena memiliki ~103 kesalahan yang sudah ada sebelumnya dan tidak terkait.

### 3. Build produksi

```bash
npm run build
```

```
> lms-frontend@0.0.0 build
> vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 2272 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                          0.82 kB │ gzip:   0.43 kB
dist/assets/index-O1pfb2IJ.css            46.81 kB │ gzip:   8.92 kB
dist/assets/purify.es-Dzkdzyfv.js         28.50 kB │ gzip:  11.42 kB
dist/assets/index.es-CQSb2Ijh.js         151.24 kB │ gzip:  48.85 kB
dist/assets/html2canvas-DNecraVP.js      199.39 kB │ gzip:  46.73 kB
dist/assets/index-BdAyPp6a.js          2,206.85 kB │ gzip: 616.22 kB

[plugin builtin:vite-reporter] 
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking: https://rolldown.rs/reference/OutputOptions.codeSplitting
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 1.73s
```

Peringatan ukuran chunk sudah ada sebelumnya dan tidak terkait perubahan ini.

---

## Berkas yang diubah

```
README.md
src/hooks/useAutoSave.js
src/lib/autosave.js
src/lib/autosave.test.js
src/lib/bobot.js
src/lib/bobot.test.js
src/pages/dosen/cbt/EditorSoalPage.jsx
src/pages/dosen/cbt/PenilaianPage.jsx
src/pages/peserta/PengerjaanUjianPage.jsx
src/services/cbt/mockAdapter.instruktur.test.js
src/services/cbt/mockAdapter.js
```

`git diff --stat d6bc91b..HEAD`: 11 berkas, 275 baris ditambahkan, 31 baris dihapus. `git status --short` bersih setelah komit terakhir (skrip browser sementara dihapus).

## Self-review

- `flushAntrean` adalah fungsi murni yang dapat diuji; hook hanya menyambungkan `Map`/`Set`/adapter. Tidak ada timer baru yang dibiarkan hidup: antrean dikosongkan dan semua timer tertunda dibatalkan sebelum pengiriman.
- `kirim` tidak melempar `Promise` yang gagal (mengembalikan boolean), sehingga tombol **Coba lagi** yang mengabaikan nilai kembali tidak memicu `unhandled rejection`. Status autosave tetap mengikuti reducer yang sudah ada.
- `kumpulkan` memakai `try` bersarang: kegagalan flush mengembalikan dari `try` bagian dalam, tetapi `finally` bagian luar tetap menjalankan `setSedangMengumpulkan(false)` sehingga tombol tidak macet.
- `saveQuestion` mempertahankan id yang diberikan pemanggil (jalur pembaruan) dan hanya membuat id bila tidak ada; `EditorSoalPage` sengaja selalu mengirim id baru karena editor belum memiliki daftar soal/entitas yang disunting.
- Validasi bobot didahulukan sebelum penjumlahan, sehingga `[150, -50]` ditolak karena negatif, bukan diterima karena total 100. Tidak ada normalisasi.
- Validasi nilai dilakukan sebelum `saveGrade`; status "tersimpan" hanya ditetapkan setelah adapter mengonfirmasi.
- Seluruh teks antarmuka/pesan baru berbahasa Indonesia. Tidak ada perubahan di luar empat temuan yang ditugaskan; temuan Minor dan keputusan Q01–Q12 tidak disentuh.

## Concerns

1. `globalThis.crypto.randomUUID()` memerlukan konteks aman (localhost/HTTPS). Ini berlaku untuk lingkungan pengembangan yang didokumentasikan; bila UI nanti dilayani lewat HTTP biasa non-localhost, pembuatan id perlu diganti. Tidak diubah sekarang karena di luar lingkup perbaikan.
2. Mock adapter menyimpan state di memori, sehingga id soal tidak bertahan setelah muat ulang halaman. Ini perilaku adapter contoh yang sudah ada dan sengaja tidak diubah.
3. Skenario browser memakai puppeteer yang sudah tersedia sebagai dependensi proyek; skripnya disimpan sementara di direktori kerja untuk resolusi `node_modules`, lalu dihapus. Tidak ada dependensi baru yang ditambahkan.
4. Dua klik **Simpan soal** kini menghasilkan dua entri soal. Ini mengikuti perilaku editor yang belum memiliki daftar/identitas soal; bila nanti ada alur sunting soal, id perlu dibawa dari state/data yang dimuat.

---

## Lampiran — skrip skenario browser

Lokasi sementara: `/private/var/folders/qz/fzlplqss3kq2zwdplnszgv9r0000gn/T/opencode/cbt-final-fix-browser.mjs` (disalin ke root worktree hanya saat dijalankan agar resolusi `puppeteer` berfungsi).

```js
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';

const BASE = 'http://127.0.0.1:5178';
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const klikTombol = async (page, teks) => {
  const ditemukan = await page.evaluate((label) => {
    const tombol = [...document.querySelectorAll('button')].find(
      (item) => item.textContent.trim() === label,
    );
    if (!tombol) return false;
    tombol.click();
    return true;
  }, teks);
  assert.ok(ditemukan, `Tombol "${teks}" tidak ditemukan`);
};

try {
  // Skenario #1: jawab soal terakhir, langsung kumpulkan.
  const halaman1 = await browser.newPage();
  await halaman1.goto(`${BASE}/cbt/attempt/attempt-1`, { waitUntil: 'load' });
  await halaman1.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Mulai'),
  );
  await halaman1.evaluate(async () => {
    const { cbtAdapter } = await import('/src/services/cbt/index.js');
    window.__urutan = [];
    const simpanAsli = cbtAdapter.saveAnswer;
    const kumpulkanAsli = cbtAdapter.submitAttempt;
    cbtAdapter.saveAnswer = async (...args) => {
      window.__urutan.push('saveAnswer:start');
      const hasil = await simpanAsli(...args);
      window.__urutan.push('saveAnswer:end');
      return hasil;
    };
    cbtAdapter.submitAttempt = async (...args) => {
      window.__urutan.push('submitAttempt');
      return kumpulkanAsli(...args);
    };
  });

  await klikTombol(halaman1, 'Mulai');
  await klikTombol(halaman1, '3');
  const berkas = path.join(os.tmpdir(), 'cbt-jawaban-akhir.txt');
  await fs.writeFile(berkas, 'bukti contoh');
  const inputBerkas = await halaman1.waitForSelector('input[type="file"]');
  await inputBerkas.uploadFile(berkas);
  await klikTombol(halaman1, 'Kumpulkan');
  await halaman1.waitForFunction(() =>
    document.body.textContent.includes('Jawaban berhasil dikumpulkan.'),
  );

  const urutan = await halaman1.evaluate(() => window.__urutan);
  console.log('SKENARIO 1 urutan panggilan:', JSON.stringify(urutan));
  const indeksMulai = urutan.indexOf('saveAnswer:start');
  const indeksSelesai = urutan.indexOf('saveAnswer:end');
  const indeksSubmit = urutan.indexOf('submitAttempt');
  assert.ok(indeksMulai >= 0 && indeksSelesai >= 0 && indeksSubmit >= 0);
  assert.ok(indeksMulai < indeksSubmit, 'saveAnswer harus dipanggil sebelum submitAttempt');
  assert.ok(indeksSelesai < indeksSubmit, 'saveAnswer harus selesai sebelum submitAttempt');
  console.log('SKENARIO 1 LULUS: jawaban tersimpan sebelum attempt dikumpulkan');
  await halaman1.close();

  // Skenario #2: dua kali simpan soal dari UI.
  const halaman2 = await browser.newPage();
  await halaman2.evaluateOnNewDocument(() => {
    localStorage.setItem('user_token', 'token-contoh');
    localStorage.setItem('user_role', 'dosen');
  });
  await halaman2.goto(`${BASE}/dosen/cbt/ujian/asesmen-1/soal`, { waitUntil: 'load' });
  await halaman2.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Simpan soal')),
  );
  await halaman2.evaluate(async () => {
    const { cbtAdapter } = await import('/src/services/cbt/index.js');
    window.__idsSoal = [];
    const simpanAsli = cbtAdapter.saveQuestion;
    cbtAdapter.saveQuestion = async (...args) => {
      const tersimpan = await simpanAsli(...args);
      window.__idsSoal.push(tersimpan.id);
      return tersimpan;
    };
  });

  await halaman2.type('#pertanyaan-soal', 'Soal pertama');
  await klikTombol(halaman2, 'Simpan soal');
  await halaman2.waitForFunction(() => window.__idsSoal.length === 1);
  await halaman2.type('#pertanyaan-soal', ' revisi');
  await klikTombol(halaman2, 'Simpan soal');
  await halaman2.waitForFunction(() => window.__idsSoal.length === 2);

  const hasil2 = await halaman2.evaluate(() => ({
    ids: window.__idsSoal,
    toast: [...document.querySelectorAll('p[role="status"]')].map((p) => p.textContent.trim()),
  }));
  console.log('SKENARIO 2 ids soal:', JSON.stringify(hasil2.ids));
  console.log('SKENARIO 2 toast:', JSON.stringify(hasil2.toast));
  const polaUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert.ok(hasil2.ids.every((id) => polaUuid.test(id)), 'id soal harus UUID nyata');
  assert.notEqual(hasil2.ids[0], hasil2.ids[1], 'id soal harus berbeda');
  assert.ok(hasil2.toast.some((teks) => teks.includes('tersimpan.')));
  assert.ok(hasil2.toast.every((teks) => !teks.includes('undefined')));
  console.log('SKENARIO 2 LULUS: dua id berbeda dan toast tanpa "undefined"');
  await halaman2.close();

  // Skenario #4: nilai kosong tidak dipanggil ke adapter.
  const halaman4 = await browser.newPage();
  await halaman4.evaluateOnNewDocument(() => {
    localStorage.setItem('user_token', 'token-contoh');
    localStorage.setItem('user_role', 'dosen');
  });
  await halaman4.goto(`${BASE}/dosen/cbt/attempt/attempt-1/nilai`, { waitUntil: 'load' });
  await halaman4.waitForFunction(() =>
    [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Simpan nilai')),
  );
  await halaman4.evaluate(async () => {
    const { cbtAdapter } = await import('/src/services/cbt/index.js');
    window.__nilaiDipanggil = [];
    const simpanAsli = cbtAdapter.saveGrade;
    cbtAdapter.saveGrade = async (...args) => {
      window.__nilaiDipanggil.push(args[0]);
      return simpanAsli(...args);
    };
  });

  await klikTombol(halaman4, 'Simpan nilai');
  await halaman4.waitForFunction(() =>
    [...document.querySelectorAll('p[role="alert"]')].some((p) =>
      p.textContent.includes('Nilai harus diisi dengan angka.'),
    ),
  );
  const hasil4 = await halaman4.evaluate(() => ({
    validasi: [...document.querySelectorAll('p[role="alert"]')].map((p) => p.textContent.trim()),
    panggilan: window.__nilaiDipanggil,
    klaimTersimpan: document.body.textContent.includes('Nilai tersimpan.'),
  }));
  console.log('SKENARIO 4 validasi:', JSON.stringify(hasil4.validasi));
  console.log('SKENARIO 4 panggilan saveGrade:', JSON.stringify(hasil4.panggilan));
  assert.equal(hasil4.panggilan.length, 0, 'saveGrade tidak boleh dipanggil untuk nilai kosong');
  assert.equal(hasil4.klaimTersimpan, false, 'tidak boleh mengklaim nilai tersimpan');
  console.log('SKENARIO 4 LULUS: validasi inline tampil, saveGrade tidak dipanggil');

  await halaman4.type('#nilai-soal-2', '85');
  await klikTombol(halaman4, 'Simpan nilai');
  await halaman4.waitForFunction(() => window.__nilaiDipanggil.length === 1);
  const panggilanSah = await halaman4.evaluate(() => window.__nilaiDipanggil);
  console.log('SKENARIO 4 panggilan setelah nilai diisi:', JSON.stringify(panggilanSah));
  assert.equal(panggilanSah[0].nilai, 85);
  console.log('SKENARIO 4 LULUS: nilai valid tetap tersimpan');

  console.log('SEMUA SKENARIO BROWSER LULUS');
} finally {
  await browser.close();
}
```


---

## Verifikasi 28 November 2026 — hardening tanpa keputusan baru

Lingkup: 12 uji regresi edge case baru, atribut ARIA pada input jawaban, dan sinkronisasi bukti. Tidak ada perubahan perilaku yang bergantung pada Q01–Q12.

### Perintah dan hasil

```bash
cd cbt-frontend
node --test src/lib/*.test.js src/services/cbt/*.test.js
npx eslint src/components/peserta/SoalInput.jsx src/lib/*.test.js
npm run build
```

- `node --test`: **37 test lulus, 0 gagal** (sebelumnya 25).
- `npx eslint`: tanpa keluaran (kode keluar 0).
- `npm run build`: berhasil; peringatan ukuran chunk > 500 kB sudah ada sebelumnya dan tidak terkait perubahan ini.

### Uji browser

1. Buka `http://127.0.0.1:5173/cbt/attempt/attempt-1` dengan `agent-browser`, viewport 1440×900.
2. Klik **Mulai**； evaluasi DOM menunjukkan `1` grup ber-`role` (`radiogroup`) dan atribut `aria-label` `["Navigasi soal", "Pilihan jawaban soal 1"]`.
3. Screenshot: [`screenshots/28-11-2026-pengerjaan-a11y.png`](screenshots/28-11-2026-pengerjaan-a11y.png). Tampilan tidak berubah secara visual dibanding bukti 26 November.

Dengan demikian label aksesibilitas terpasang pada grup pilihan, textarea esai, dan input berkas tanpa menambah aturan penilaian, proctoring, unggahan, attempt, atau hasil.
