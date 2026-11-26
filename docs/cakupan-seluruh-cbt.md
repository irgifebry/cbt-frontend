# Dokumen Cakupan Seluruh CBT U-Cademy

**Tanggal:** 26 November 2026
**Status:** Dokumen pemetaan cakupan — bukan dokumen persetujuan pembimbing
**Cakupan:** Seluruh ekosistem CBT U-Cademy: PRD, API mandiri, antarmuka web, integrasi LMS yang sudah ada, keputusan terbuka, dan rencana lanjutan.

Dokumen ini menjawab satu pertanyaan: **"Apa saja yang termasuk CBT, apa yang sudah dibuat, apa yang belum, dan apa yang masih menunggu keputusan dosen?"** Untuk rincian teknis per komponen, rujuk tautan di bagian 10.

---

## 1. Peta ekosistem

| Komponen | Repositori | Peran terhadap CBT | Status saat ini |
|---|---|---|---|
| PRD CBT | `CBT-API.md` (root workspace, disalin ke repo ini) | Sumber kebutuhan dan aturan bisnis | Draf; 12 butir masih menunggu konfirmasi (Bab 17) |
| API CBT | `cbt-api` (`github.com/irgifebry/cbt-api`) | Backend mandiri + basis data sendiri | Fondasi saja: `GET /api/health`, response standar, ERD konseptual, OpenAPI health, Postman, CI |
| Antarmuka web CBT | `cbt-frontend` (repo ini) | Demo alur peserta dan instruktur | Alur utama lengkap untuk demonstrasi dengan mock adapter; belum mencakup hasil, autentikasi nyata, atau integrasi LMS |
| Backend LMS | `lms-backend` | Pemilik data tugas/peserta/nilai CBT lama | **Tidak diubah**; memakai `link_cbt`, `token_cbt`, `nilai_cbt` |
| Frontend LMS | `lms-frontend` | Konsumen alur CBT lama | **Tidak diubah**; `TugasModal`, `DetailProgressModal`, `getLaunchUrl` |
| Mobile LMS | `lms-mobile` | Daftar tugas & status nilai peserta | **Tidak diubah**; belum ada masuk ujian CBT |

**Catatan penting:** PRD Bab 1.1–1.2 masih menyebut pengembangan "pada backend Ucademy", tetapi paragraf **Ketentuan** di akhir Bab 2.2 dan arahan terbaru di `AGENTS.md` menetapkan aplikasi dan basis data **terpisah** dengan data contoh pada tahap awal. Dokumen ini memakai arahan terbaru; perbedaan PRD perlu dicatat pada revisi berikutnya.

---

## 2. Cakupan menurut PRD

### 2.1 Termasuk cakupan (PRD Bab 2.1)

1. Audit dan pemanfaatan backend Ucademy
2. Integrasi autentikasi dan otorisasi
3. Manajemen ujian
4. Manajemen bank soal
5. Manajemen pilihan jawaban
6. Pengaturan bobot soal
7. Publikasi ujian
8. Pelaksanaan ujian dan sesi pengerjaan
9. Penyimpanan jawaban peserta
10. Pengumpulan jawaban
11. Penilaian otomatis dan manual
12. Pengelolaan hasil ujian
13. Pengelolaan file jawaban
14. Pemantauan ujian dasar
15. Dokumentasi API
16. Pengujian API

### 2.2 Di luar cakupan (PRD Bab 2.2)

UI website/mobile CBT, sistem autentikasi baru, pengembangan LMS keseluruhan, webcam/face recognition/eye tracking/AI cheating detection, screen recording, device monitoring, layanan CBT eksternal baru, dan fitur proctoring lanjutan.

**Penyesuaian penulis:** antarmuka web CBT dibuat di luar cakupan PRD awal sebagai media demonstrasi skripsi oleh penulis skripsi (Irgi Febryansyah, sesuai identitas di PRD). Ini **tidak** mengubah status keputusan pembimbing dan tidak dimaksudkan sebagai pengganti integrasi LMS.

### 2.3 Aktor (PRD Bab 5)

| Aktor | Kebutuhan utama |
|---|---|
| Instruktur | Mengelola ujian, soal, penilaian, hasil, riwayat proctor |
| Peserta | Mengakses ujian, menjawab, mengumpulkan, melihat hasil |
| Sistem | Memvalidasi proses dan menjaga konsistensi data |
| Frontend/backend Ucademy | Mengonsumsi endpoint dan menjaga integrasi |

---

## 3. Status implementasi per lapisan

### 3.1 `cbt-api` — backend mandiri

| Item | Status | Bukti |
|---|---|---|
| Laravel 13 / PHP 8.3 / Docker / SQLite | Selesai | `Dockerfile`, `composer.json`, `scripts/verify-local.sh` |
| `GET /api/health` | Selesai | `routes/api.php` |
| Format response seragam + global exception handler | Selesai | `app/Traits/ApiResponse.php`, `bootstrap/app.php`, `tests/Feature/ApiResponseFormatTest.php` |
| ERD konseptual 10 entitas (PRD Bab 9) | Selesai (pra-migrasi) | `docs/erd-konseptual.md` |
| OpenAPI untuk endpoint yang ada | Selesai (health only) | `docs/openapi.yaml` |
| Koleksi Postman | Selesai (health only) | `docs/postman/CBT-API.postman_collection.json` |
| CI + verifikasi lokal | Selesai | `.github/workflows/ci.yml` |
| Migrasi tabel CBT | **Belum** — menunggu aturan bisnis dikunci | Lihat bagian 6 |
| Endpoint bisnis (ujian, soal, attempt, jawaban, nilai, hasil, proctor) | **Belum** | Hanya rancangan PRD Bab 7 |
| Autentikasi/otorisasi CBT | **Belum** | Menunggu Q12 |

### 3.2 `cbt-frontend` — antarmuka web (repo ini)

| Fitur | Status | Keterangan |
|---|---|---|
| Daftar ujian peserta, konfirmasi, pengerjaan | Selesai (demo) | Route `/cbt`, `/cbt/attempt/:id/konfirmasi`, `/cbt/attempt/:id` |
| Empat tipe soal | Selesai (input) | Pilihan tunggal, pilihan ganda, esai, unggah dokumen |
| Autosave per soal + idempotensi + `flush()` saat submit | Selesai (mock) | Status hanya muncul setelah adapter merespons |
| Proctoring browser | Selesai (pencatatan) | `tab_hidden`, `fullscreen_exit`, `window_blur`; label Indonesia; tanpa konsekuensi |
| Kelola ujian & soal instruktur | Selesai (demo) | Enam route di bawah `/dosen/cbt/...` dengan `ProtectedRoute` dosen |
| Validasi bobot > 100 dan bobot negatif | Selesai | Sesuai CBT-R05; untuk total < 100 UI sengaja **tidak menormalisasi** sebagai asumsi kerja — Q02 masih terbuka dan belum diputuskan dosen |
| Publikasi → editor read-only | Selesai | Sesuai keputusan No. 9 |
| Monitoring attempt + riwayat proctor | Selesai | Tanpa label kecurangan/tindakan otomatis |
| Penilaian manual esai/dokumen | Selesai | Nilai kosong ditolak; tidak ada penilaian PG otomatis |
| Halaman hasil / publikasi hasil | **Sengaja tidak diaktifkan** | Menunggu Q04 |
| Client HTTP ke `cbt-api` | Disiapkan | `src/config/cbtApi.js`; belum dipakai karena endpoint belum ada |
| Autentikasi/enrollment LMS | **Belum** | Menunggu Q12 |
| Verifikasi | Selesai | 25/25 test murni, build, lint ter-scoped, E2E Orca CLI + agent-browser |

### 3.3 Integrasi dengan LMS yang sudah ada

- Alur lama: dosen menyimpan `tugas.link_cbt` + `tugas.token_cbt`; backend membuat launch URL; nilai masuk `nilai_cbt` dan dipakai dashboard/sertifikat.
- Frontend lama memiliki `TugasModal`, `DetailProgressModal`, dan `tugasService.getLaunchUrl` (belum dipakai komponen).
- Mobile menampilkan status "Sudah Dikerjakan" dan nilai, tetapi belum membuka ujian.
- **Semua alur ini tetap berfungsi dan tidak disentuh.** Rencana integrasi harus memetakan UI baru ke mekanisme ini, bukan menimpa.

---

## 4. Cakupan fungsional PRD vs kenyataan

| Kemampuan PRD | Rancangan endpoint | Realisasi server | Realisasi UI (demo) |
|---|---|---|---|
| Manajemen ujian + publikasi | `/assessments` (7 endpoint) | Belum ada | Ada (mock) |
| Bank soal + pilihan + bobot | `/questions`, `/assessments/{id}/questions` | Belum ada | Ada (mock, 4 tipe) |
| Sesi pengerjaan + status | `/attempts`, `/my-assessments` | Belum ada | Ada (mock) |
| Penyimpanan jawaban + unggah | `/attempts/{id}/answers...` | Belum ada | Ada (mock, tanpa validasi Q06) |
| Pengumpulan | `/attempts/{id}/submit` | Belum ada | Ada (mock, dengan flush) |
| Penilaian otomatis + manual | `/attempts/{id}/grading...` | Belum ada | Manual saja (mock) |
| Hasil ujian | `/attempts/{id}/result`, `/assessments/{id}/results` | Belum ada | Sengaja nonaktif (Q04) |
| Pemantauan ujian | `/attempts/{id}/proctor-events` | Belum ada | Pencatatan browser (mock) |
| Autentikasi + otorisasi | PRD merencanakan memakai akun Ucademy, tapi detailnya bergantung Q12 | Belum ada | Token contoh; tidak untuk produksi |

---

## 5. Aturan bisnis (PRD Bab 10) dan statusnya

| ID | Aturan | Status saat ini |
|---|---|---|
| BR-01 | Hanya instruktur berwenang membuat ujian | Bergantung Q12; UI memakai peran contoh |
| BR-02 | Peserta terdaftar pada kursus terkait | Bergantung Q12; ID kursus contoh |
| BR-03 | Ujian dipublikasikan sebelum dikerjakan | Konsep ada; server belum memvalidasi |
| BR-04 | Peserta tidak mulai di luar jadwal | Bergantung Q10 |
| BR-05 | Batas sesi pengerjaan | Bergantung Q03 |
| BR-06 | Total bobot ≤ 100 | **Diterapkan di UI**; server belum |
| BR-07 | Timer mengikuti waktu server | UI hanya menampilkan `sisaDetik` dari adapter; aturan Q10 belum |
| BR-08 | Jawaban tidak bisa diubah setelah dikumpulkan | Status attempt jadi "Selesai" di mock; server belum |
| BR-09 | Nilai manual ≤ bobot soal | Belum; form nilai mandiri |
| BR-10 | Hasil akhir menunggu penilaian manual | Terkait Q04; halaman hasil nonaktif |
| BR-11 | Peserta hanya akses sesi miliknya | Bergantung Q12/auth |
| BR-12 | Aktivitas proctor bukan bukti kecurangan | **Dijaga UI** (tanpa label/penalti) |
| BR-13 | Kunci jawaban tidak ke endpoint peserta | **Dijaga mock** (allow-list); server belum |
| BR-14 | Perubahan ujian tidak mengubah attempt aktif | Terkait Q07; editor published read-only |

---

## 6. Keputusan yang masih menunggu pembimbing

Sumber: `docs/cbt-requirements-matrix.md`, `docs/pertanyaan-konfirmasi-dosen-pembimbing-cbt.md`, `CBT-API.md` Bab 17. Usulan dalam catatan konsultasi **bukan** keputusan dosen.

| ID | Pertanyaan | Mem-blok |
|---|---|---|
| Q01 | PG kompleks: exact match atau partial credit? | Algoritma grading otomatis |
| Q02 | Total bobot < 100: dinormalisasi atau tidak? | Perhitungan nilai akhir |
| Q03 | Berapa kali peserta boleh mencoba? | Kebijakan attempt |
| Q04 | Kapan hasil/rincian/kunci terlihat peserta? | Halaman hasil & publikasi |
| Q05 | Web, mobile, atau keduanya? (ditujukan ke Pak Fitrah) | Platform final & proctoring |
| Q06 | Format/ukuran/jumlah file jawaban | Validasi unggahan & kontrak API |
| Q07 | Koreksi soal setelah publikasi | Siklus publikasi/versi |
| Q08 | Event proctor wajib + konsekuensinya | Jenis event & dampaknya |
| Q09 | Perilaku keluar fullscreen | Status sesi |
| Q10 | Awal timer, akhir sesi, pengumpulan otomatis | Validasi server & expiry |
| Q11 | Opsi ikut diacak atau tidak; konsistensi resume | Penyajian soal |
| Q12 | Identitas pengajar/peserta & login/enrollment LMS | Batas integrasi & otorisasi |

**Sudah ada arahan** (sumber: bagian "Arahan dosen yang sudah ada" pada catatan konsultasi): keempat tipe soal, bobot per soal dengan total maksimal 100, timer, pengacakan soal, autosave tiap jawaban + lanjut attempt, proctoring dasar, dan soal tidak boleh diubah setelah publikasi (No. 9). UI belum menjadi fokus PRD awal.

**Hubungan No. 9 dan Q07:** No. 9 memutuskan soal yang sudah dipublikasikan tidak boleh diubah; Q07 masih menanyakan bagaimana pengajar menangani kesalahan/versi baru. Keduanya tidak bertentangan — UI saat ini memilih read-only dan belum menyediakan mekanisme koreksi.

**Peran Pak Fitrah:** **Pak Fitrah adalah dosen pembimbing penulis.** Q05 (platform web/mobile) dalam catatan konsultasi ditujukan kepadanya. Sampai beliau menjawab, web-first tetap usulan penulis, bukan keputusan pembimbing.

---

## 7. Arsitektur dan batas integrasi

**Keputusan penulis (bukan dosen):**
- Web-first, UI di `cbt-frontend`, alur peserta + instruktur.
- **Pendekatan A sekarang:** UI → `cbt-api` langsung lewat client kedua (`VITE_CBT_API_BASE_URL`) dengan ID contoh.
- **Pendekatan B nanti:** UI → `lms-backend` → `cbt-api` setelah Q12 dijawab dan perubahan LMS diminta eksplisit.
- Mock adapter dipakai sampai endpoint bisnis ada; state disimpan di `sessionStorage`.
- Tidak mengubah `lms-backend`, `lms-mobile`, atau alur `link_cbt`/`token_cbt`/`nilai_cbt`.

**Urutan integrasi yang disarankan:**
1. Konfirmasi Q01–Q12 ke dosen pembimbing; catat sumber + tanggal.
2. Kunci kontrak API final (Bab 7 PRD) dan jalankan migration 10 entitas ERD.
3. Implementasi endpoint bisnis + aturan BR-01…BR-14 di `cbt-api`.
4. Autentikasi/otorisasi & pemetaan identitas U-Cademy (Q12).
5. Ganti `cbtAdapter` dari mock ke HTTP; hapus jalur ID contoh.
6. Aktifkan halaman hasil/publikasi hasil bila Q04 sudah diputuskan.
7. Uji integrasi penuh dengan LMS; perbarui dokumentasi setiap langkah (CBT-R12).

---

## 8. Kriteria penyelesaian (PRD Bab 16)

PRD menargetkan: endpoint berfungsi, database dan relasi konsisten, proses bisnis tervalidasi, pengujian API, dokumentasi API, dan bukti integrasi dengan backend Ucademy.

**Realisasi saat ini:** dokumentasi dan pengujian fondasi terpenuhi; endpoint bisnis, migrasi, dan integrasi LMS **belum** terpenuhi. UI demo tidak dapat dihitung sebagai pengganti kriteria tersebut.

---

## 9. Status kebenaran dokumen

| Pernyataan | Benar? |
|---|---|
| CBT siap produksi | **Tidak** — mock, tanpa auth dan endpoint bisnis |
| UI menggantikan alur `link_cbt`/`token_cbt`/`nilai_cbt` | **Tidak** — alur lama tetap menjadi jalur yang saat ini didukung LMS |
| Semua fitur PRD sudah dibuat | **Tidak** — baru fondasi API + demo UI |
| Q01–Q12 sudah diputuskan dosen | **Tidak** — belum ada keputusan dosen untuk ke-12 butir; sebagian arahan umum sudah ada (bagian 6) |
| Web sudah dikonfirmasi pembimbing | **Tidak** — web-first adalah keputusan penulis; Q05 masih menunggu konfirmasi |

---

## 10. Dokumen dan bukti terkait

- [PRD API CBT](../CBT-API.md) — kebutuhan, endpoint rancangan, aturan bisnis, Bab 17.
- [Matriks kebutuhan](cbt-requirements-matrix.md) — arahan pembimbing vs keputusan terbuka.
- [Catatan konsultasi](pertanyaan-konfirmasi-dosen-pembimbing-cbt.md) — 14 pertanyaan, termasuk No. 9.
- [Desain antarmuka web](superpowers/specs/2026-11-25-cbt-web-ui-design.md) — keputusan arsitektur UI.
- [Rencana peserta](superpowers/plans/2026-11-25-cbt-web-ui-peserta.md) dan [rencana instruktur](superpowers/plans/2026-11-25-cbt-web-ui-instruktur.md).
- [Catatan skripsi](cbt-ui-catatan-skripsi.md) — ringkasan, batas, bukti verifikasi, dan [lampiran tampilan](screenshots/).
- [Bukti verifikasi](bukti-verifikasi-cbt-ui.md) — laporan uji/build/skenario browser.
- [README frontend](../README.md) — cara menjalankan.
