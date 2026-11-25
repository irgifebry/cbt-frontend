# Desain: Antarmuka Web CBT U-Cademy (Peserta & Instruktur)

**Tanggal:** 25 November 2026
**Status:** Draf setuju pendekatan — menunggu persetujuan dokumen sebelum implementasi
**Cakupan:** Antarmuka web di `lms-frontend` yang memanggil `cbt-api` secara langsung, tanpa mengubah `lms-backend` maupun `lms-mobile`.

## 1. Maksud dan Tujuan

Menyediakan gambaran implementasi antarmuka CBT yang **mencakup semua peran dalam PRD** — peserta, instruktur, dan sistem — di platform **web**, dengan alasan: pemantauan ujian (PRD Bab 6.9) berupa peristiwa browser (`tab visibility`, `fullscreen`, `window focus`) yang dikirim frontend, dan autosave lebih dapat diandalkan pada koneksi web.

Tujuan dokumen ini adalah mengunci **bentuk dan batas** pekerjaan UI sebelum kode ditulis, tanpa mengubah usulan yang belum menjadi keputusan dosen pembimbing menjadi aturan bisnis.

## 2. Kondisi Saat Ini (Hasil Pemeriksaan Kode)

- `lms-frontend/src/App.jsx` hanya memiliki grup route auth, dosen, dan admin. **Belum ada halaman peserta** di web.
- `lms-frontend/src/config/api.js` hanya mengarah ke LMS (`VITE_API_BASE_URL` / `http://127.0.0.1:8000/api`).
- Integrasi CBT yang berjalan saat ini adalah **tautan + token eksternal** (`tugas.link_cbt`, `tugas.token_cbt`) dan **nilai tersinkron** (`nilai_cbt`). `tugasService.getLaunchUrl` sudah ada tetapi belum dipakai komponen mana pun.
- `cbt-api` saat ini hanya memiliki `GET /api/health`; tidak ada endpoint asesmen, soal, attempt, jawaban, penilaian, hasil, atau proctoring.
- Peserta saat ini ada di `lms-mobile/screens/TugasKuisScreen.js`, namun belum ada alur masuk ujian di sana.

## 3. Tujuan, Non-Goal, Anti-Goal

**Tujuan**
- Alur peserta: daftar ujian → konfirmasi mulai → pengerjaan → pengumpulan → hasil.
- Alur instruktur: kelola ujian & soal → bobot → publikasi → pantau attempt & riwayat proctor → penilaian esai/dokumen → publikasi hasil.
- Sistem: pengirim peristiwa proctoring dan autosave jawaban yang jelas statusnya (terkirim / gagal), bukan klaim tersimpan.

**Non-goal**
- Implementasi aturan bisnis yang menunggu konfirmasi (Q01–Q12 pada matriks kebutuhan).
- Perubahan pada `lms-backend` atau `lms-mobile`.
- Autentikasi produksi, enrollment LMS, atau sinkronisasi nilai CBT baru.
- Endpoint bisnis baru di `cbt-api`.

**Anti-goal (yang membuat pekerjaan gagal meski berjalan)**
- Menghapus atau menimpa alur `link_cbt` / `token_cbt` / `nilai_cbt` yang masih dipakai.
- Menampilkan nilai/kunci jawaban sebelum aturan visibilitas (Q04) diputuskan.
- Menyatakan peristiwa browser sebagai bukti kecurangan atau menghentikan ujian otomatis (Q08/Q09 belum diputuskan).
- Mengklaim jawaban tersimpan sebelum server mengonfirmasi (PRD Bab 6.6 / CBT-R08).

## 4. Batasan dan Keputusan yang Masih Terbuka

Sumber: `docs/cbt-requirements-matrix.md`, `docs/pertanyaan-konfirmasi-dosen-pembimbing-cbt.md`, `CBT-API.md` Bab 17.

- **Sudah diputuskan:** soal tidak boleh diubah setelah ujian dipublikasikan (No. 9 catatan konsultasi).
- **Masih terbuka:** Q01 penilaian PG ganda, Q02 normalisasi nilai, Q03 jumlah attempt, Q04 visibilitas hasil, Q05 platform (web/mobile — ditujukan ke Pak Fitrah), Q06 format unggahan, Q07 koreksi setelah publikasi, Q08/Q09 proctoring & fullscreen, Q10 timer, Q11 pengacakan opsi, Q12 identitas/login LMS.
- Karena itu, desain ini **bersifat web-first sebagai usulan arsitektur**, bukan keputusan pembimbing tentang platform.
- UI tidak boleh memilih nilai bawaan untuk butir di atas. Komponen yang bergantung pada keputusan tersebut disiapkan dalam keadaan **nonaktif/terkunci**, bukan dengan asumsi.

## 5. Pendekatan yang Dipertimbangkan

| Pendekatan | Kelebihan | Kekurangan | Status |
|---|---|---|---|
| **A. UI di `lms-frontend` → langsung ke `cbt-api`** (client kedua, ID contoh) | Sesuai fase mandiri; tidak menyentuh repo LMS; bisa dibangun & diuji sekarang | `cbt-api` belum ber-autentikasi, belum aman untuk publik; menunggu Q12 | **Dipilih** |
| B. UI → `lms-backend` → `cbt-api` (proxy) | Token LMS divalidasi Laravel; integrasi akhir rapi | Perlu mengubah `lms-backend` (dilarang AGENTS.md tanpa permintaan eksplisit); hop ekstra untuk autosave | Target integrasi nanti |
| C. Frontend CBT terpisah | Isolasi penuh | Duplikasi design system & alur login; tidak memakai dashboard dosen yang ada | Ditolak |

**Pilihan A** dipakai untuk pengembangan dengan ID peserta/kursus contoh. B dipakai hanya setelah Q12 dijawab dan perubahan LMS diminta secara eksplisit.

## 6. Desain yang Disetujui

### 6.1 Routing dan Susunan

- Route peserta baru di `src/App.jsx`, di luar layout dosen/admin, misalnya `/cbt/...`, dengan **pemilih identitas contoh** pada lingkungan pengembangan (lihat 6.5).
- Sisi instruktur tetap di dalam `ProtectedRoute allowedRole="dosen"` + `DosenDashboardLayout` yang sudah ada: login web LMS tetap dipakai untuk membuka halaman dosen, **tanpa bypass auth**. ID contoh pada 6.5 hanya dipakai sebagai identitas sisi CBT saat memanggil `cbt-api`, bukan menggantikan login web.

### 6.2 Layar Peserta

- `DaftarUjianPage` — kartu ujian dengan status, batas waktu, dan entri untuk attempt yang sedang berjalan (R08: peserta dapat melanjutkan attempt yang sama setelah koneksi pulih).
- `KonfirmasiUjianPage` — instruksi, durasi, dan tombol mulai. UI **tidak** menentukan kapan timer mulai; hanya menampilkan nilai dari server.
- `PengerjaanPage` — satu soal per tampilan dengan navigasi nomor; empat tipe soal (pilihan tunggal, pilihan ganda, esai, unggah dokumen). Semua input dibuat fungsional sebagai **penangkapan jawaban**, bukan penilaian; unggah dokumen memakai file picker tanpa validasi format/ukuran sampai Q06 diputuskan. Indikator: "Menyimpan…" / "Tersimpan" / "Gagal tersimpan" dengan tombol **Coba lagi manual** (lihat 6.4); timer dari server; pengumpulan.
- `HasilUjianPage` — disiapkan sebagai komponen, **tetap tidak dirender/default** sampai Q04 diputuskan.

Sketch alur pengerjaan (bukan mockup visual final):

```
/cbt/attempt/:id
┌──────────────────────────────────────────────┐
│ Metode Penelitian              ⏱ 42:15       │
│ Soal 3/20   [1][2][3•][4][5][6]…             │
│──────────────────────────────────────────────│
│ (3) Pilihan ganda ganda / Esai / Unggah PDF  │
│ Tersimpan otomatis 12.04                     │
│ [← Sebelumnya]           [Selanjutnya →]     │
└──────────────────────────────────────────────┘
```

### 6.3 Layar Instruktur

- `DaftarUjianDosenPage` — daftar ujian, status draft/published.
- `EditorUjianPage` — judul, deskripsi, instruksi, referensi kursus contoh, bobot per soal; validasi **total > 100 ditolak** (CBT-R05, arahan sudah ada). Perlakuan total < 100 tidak ditentukan UI.
- `EditorSoalPage` — empat tipe soal; kunci jawaban disimpan terpisah dan tidak dikirim ke tampilan peserta. Setelah dipublikasikan, editor bersifat **read-only** (No. 9). Mekanisme koreksi (Q07) belum dibuat.
- `MonitoringAttemptPage` — daftar attempt dan status.
- `RiwayatProctorPage` — daftar peristiwa dengan waktu; tanpa label kecurangan dan tanpa tindakan otomatis.
- `PenilaianPage` — form nilai untuk esai/dokumen; algoritma PG ganda (Q01) tidak diimplementasi UI.
- `PublikasiHasilPage` — dinonaktifkan sampai Q04 diputuskan.

### 6.4 Plumbing Teknis

- File client baru, misalnya `src/config/cbtApi.js`, memakai `VITE_CBT_API_BASE_URL`, timeout, dan interceptor.error yang memetakan format response `cbt-api` ke pesan UI. Client lama tidak diubah.
- Lapisan service per fitur (`src/services/cbt/*.js`) dan hook (`src/hooks/useCbt*.js`) mengikuti pola `services` + `hooks` yang sudah ada.
- Karena `cbt-api` belum punya endpoint bisnis, pengembangan UI memakai **mock adapter lokal** (data contoh) yang bisa diganti ke client asli tanpa mengubah komponen. Mock tidak boleh dianggap sebagai kontrak final.
- Autosave: periodic/debounce saat jawaban berubah, dengan kunci idempotensi sisi klien; status ditampilkan hanya setelah server mengonfirmasi. **Tidak ada retry otomatis** sampai mekanisme retry/idempotensi (R08) diputuskan — tombol "Coba lagi" bersifat manual. Konflik pengeditan dan batas waktu resume tetap terbuka.
- Proctoring: kirim peristiwa browser generik + timestamp saat tab tersembunyi, fullscreen keluar, fokus jendela berubah. UI meminta fullscreen saat tombol Mulai ditekan; jika browser menolak, ujian tetap berjalan dan kondisi itu dicatat sebagai metadata. Tidak ada peringatan, penghentian, atau pengurangan nilai (Q08/Q09 belum diputuskan).

### 6.5 Identitas untuk Pengembangan

- Untuk sementara, peserta dan instruktur dipilih melalui **ID contoh** yang diberikan ke adapter (misalnya selector di lingkungan pengembangan). Ini sesuai fase API mandiri dengan data contoh.
- `cbt-api` tidak melakukan validasi token LMS dan tidak ada enrollment pada tahap ini; login web LMS untuk halaman dosen tetap memakai mekanisme yang sudah ada. Tidak ada klaim bahwa permintaan ke `cbt-api` aman untuk produksi.
- Jembatan identitas asli menunggu Q12 dan pendekatan B.

## 7. Kontrak Data yang Dibutuhkan UI (Proposal, Bukan Keputusan)

UI hanya membutuhkan: daftar ujian; detail ujian + daftar soal tanpa kunci; attempt + sisa waktu dari server; penyimpanan jawaban; pengumpulan; daftar peristiwa proctoring; nilai per soal; dan status publikasi hasil. Nama endpoint, field, dan status HTTP **sengaja tidak ditetapkan** di dokumen ini karena bergantung pada keputusan yang masih terbuka dan pada implementasi `cbt-api` yang belum ada.

## 8. Keputusan yang Diambil Penulis (bukan keputusan dosen)

- Platform web-first dan penempatan UI di `lms-frontend` (dipilih pengguna, bukan konfirmasi pembimbing).
- Nama route `/cbt/...`, file `cbtApi.js`, serta pola service/hook mengikuti konvensi repo.
- Halaman hasil dan publikasi hasil disiapkan tetapi tidak diaktifkan sampai Q04.
- Proctoring hanya mencatat, tanpa konsekuensi otomatis, sebagai pilihan paling aman sebelum Q08/Q09; UI tetap meminta fullscreen saat mulai karena FR-API-048 memerlukan peristiwa keluar fullscreen.
- Semua input jawaban dibuat fungsional, tetapi penilaian dan validasi yang bergantung pada Q01/Q06 tidak diterapkan; unggah dokumen sengaja tanpa validasi sampai Q06.
- Resume attempt yang terputus (R08, arahan sudah ada) masuk ke dalam daftar ujian; detail konflik/edit bersamaan tidak ditentukan.
- Autosave tidak retry otomatis; status gagal diberi tombol Coba lagi manual sampai R08 dikunci.
- Mock adapter dipakai sampai endpoint bisnis tersedia.

## 9. Yang Diserahkan ke Pembangun / Masih Terbuka

- Detail visual (warna, komponen, layout responsif) mengikuti gaya `lms-frontend` yang ada; tidak dibahas di sini.
- Mekanisme pemilih ID contoh dan penempatannya di UI pengembangan.
- Struktur state dan library yang dipakai (form, validasi, unggah) mengikuti pola yang sudah ada di repo; keputusan ini tidak mengubah perilaku ujian.
- Kontrak API final, setelah keputusan pembimbing dan endpoint `cbt-api` tersedia.

## 10. Kriteria Selesai (DoD)

- `npm run build` dan `npm run lint` lulus di `lms-frontend`.
- Alur peserta dan instruktur dapat dijalankan terhadap mock adapter tanpa endpoint bisnis `cbt-api`.
- Tidak ada perubahan pada `lms-backend` / `lms-mobile`, dan alur `link_cbt` / `token_cbt` / `nilai_cbt` tetap berfungsi.
- Tidak ada aturan dari Q01–Q12 yang diterapkan sebagai perilaku default.
- Dokumen ini dan README terkait diperbarui bersama perubahan kode (CBT-R12).
