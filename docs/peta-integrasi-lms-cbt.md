# Peta Integrasi LMS Produksi → CBT Mandiri

**Tanggal:** 28 November 2026
**Status:** Analisis teknis penulis, **bukan keputusan pembimbing**. Tidak mengubah status Q01–Q12, tidak mengubah arsitektur yang sudah dicatat, dan tidak memodifikasi repo LMS.
**Sumber:** `lms-frontend/` dan `lms-backend/` (dibaca saja), `cbt-frontend/`, `cbt-api/`, `CBT-API.md`, `docs/cbt-requirements-matrix.md`.

Dokumen ini menjawab: *"Alur user dan kontrak apa yang benar-benar dipakai LMS produksi, dan bagaimana `cbt-api`/`cbt-frontend` sebaiknya disesuaikan ketika integrasi diizinkan?"*

---

## 1. Ringkasan

1. **Web LMS hanya untuk `admin` dan `dosen`.** `mahasiswa`/peserta sengaja diarahkan ke aplikasi mobile; tidak ada dashboard web peserta yang bisa dipakai ulang (`lms-frontend/src/App.jsx:60-66`, `lms-frontend/src/pages/auth/MobileOnly.jsx:11-14`). Ini berbeda dengan asumsi "web-first" di CBT, yang masih usulan penulis (Q05/Q12).
2. **Identitas dan peran disimpan di localStorage** (`user_token`, `user_role`) dan dikirim sebagai Bearer oleh satu instance Axios. Tidak ada refresh token atau penanganan 401 (`lms-frontend/src/services/authService.js:20-22`, `lms-frontend/src/config/api.js:12-23`).
3. **Alur CBT lama bukan mesin ujian**: dosen menyimpan `link_cbt` + `token_cbt` pada tugas; backend membuat launch URL dengan token di query string; nilai di-sync lewat `POST /nilai-cbt` (`lms-backend/app/Models/Tugas.php:57-81`, `lms-backend/app/Http/Controllers/NilaiCbtController.php:18-75`). Tidak ada validasi tanda tangan, kedaluwarsa, peran, atau kepemilikan pada jalur ini.

Kesimpulan: integrasi CBT tidak bisa sekadar "memanggil endpoint lama". Perlu keputusan Q12 dulu, lalu jembatan baru yang aman.

---

## 2. Userflow produksi yang relevan

### 2.1 Admin / dosen (web)
`POST /login` dengan `{identifier, password, role}` → respons `{status, data:{token,user}}` → token dan role (direndahkan) disimpan di localStorage → `useAuth.login` mengarahkan ke `/${role}/dashboard` → `ProtectedRoute` memeriksa keberadaan token dan `user_role === allowedRole` → layout memuat `ProfileProvider` yang memanggil `GET /profile` sekali.

Sumber: `lms-frontend/src/services/authService.js:12-27`, `lms-frontend/src/hooks/useAuth.js:37-61`, `lms-frontend/src/components/routes/ProtectedRoute.jsx:3-15`, `lms-frontend/src/hooks/useProfile.jsx:11-45`, `lms-frontend/src/layouts/dosen/DashboardLayout.jsx:4-25`.

Backend: Laravel 13 + Sanctum 4; `auth:sanctum` membungkus hampir semua rute; login memakai throttle 5/menit; token = `plainTextToken` tanpa expiry; role enum `Admin|Dosen|Mahasiswa` dicek middleware `role` (`lms-backend/routes/api.php:11-36`, `lms-backend/app/Http/Controllers/Api/AuthController.php:22-116`, `lms-backend/app/Http/Middleware/RoleMiddleware.php:16-35`, `lms-backend/config/sanctum.php:50`).

### 2.2 Peserta / mahasiswa
SSO callback menerima token + role; role `mahasiswa` diarahkan ke `/mobile-only`, yang secara eksplisit menyuruh memakai aplikasi mobile. Tidak ada rute dashboard mahasiswa di web (`lms-frontend/src/pages/auth/AuthCallback.jsx:29-39`, `lms-frontend/src/pages/auth/SsoCallback.jsx:25-32`, `lms-frontend/src/App.jsx:67-153`).

Implikasi: bila CBT final diputuskan web (Q05), harus ada **jalur masuk peserta baru** — tidak bisa mengandung sesi web LMS yang sudah ada.

### 2.3 Alur CBT lama (yang tidak boleh dirusak)
1. Dosen menyimpan tugas lewat `POST /sesi/{id_sesi}/tugas` / `PUT /tugas/{id}` dengan `{judul_tugas, deskripsi_tugas, link_cbt, token_cbt, batas_waktu}` (`lms-frontend/src/components/dosen/TugasModal.jsx:41-67`).
2. `token_cbt` dibuat otomatis `strtoupper(Str::random(6))` bila `link_cbt` ada (`lms-backend/app/Http/Controllers/Api/TugasController.php:119-126`, `lms-backend/app/Models/Tugas.php:78-81`).
3. `GET /tugas/{id}/launch/{id_peserta}` mengembalikan `{success, launch_url, judul_tugas}`; URL = `link_cbt?token=<token_cbt>&id_peserta=…&id_tugas=…` (`lms-backend/app/Http/Controllers/Api/TugasController.php:252-278`, `lms-backend/app/Models/Tugas.php:57-73`). **Hook dan komponen pemanggilnya tidak aktif** di frontend (`lms-frontend/src/services/tugasService.js:82-85`, `lms-frontend/src/hooks/useTugas.js:101-103`).
4. Dosen menyinkronkan nilai: `GET /nilai-cbt/peserta/{id_mahasiswa}` → `POST /nilai-cbt` dengan `{nilai:[{id_tugas,id_peserta,nilai}]}`, nilai 0–100, upsert pada pasangan `(id_tugas,id_peserta)` (`lms-frontend/src/components/dosen/DetailProgressModal.jsx:20-57,73-100`, `lms-backend/app/Http/Controllers/NilaiCbtController.php:18-75`).

---

## 3. Kontrak data yang dipakai LMS

| Konsep | Nama/ID | Bentuk | Dipakai untuk |
|---|---|---|---|
| Pengguna | `id_user` (UUID) | `{id_user,email,nama_lengkap,role,...}` | token Sanctum, `id_peserta` di nilai |
| Kursus | `id_mk`, `kode_mk` unik | `master_kursus` | induk jadwal |
| Jadwal | `id_jadwal`, `token_enrollment` 6 karakter | `jadwal_kursus`, `kelas_list[]` | pendaftaran, daftar peserta |
| Kelas peserta | `id_peserta`, `id_jadwal`, `id_mahasiswa` | `peserta_kelas`, unik `(id_peserta,id_jadwal)` | enrollment |
| Sesi | `id_sesi`, `id_jadwal`, `url_cbt` | `sesi_pertemuan` | induk tugas |
| Tugas | `id_tugas`, `id_sesi`, `link_cbt`, `token_cbt` | `tugas` | peluncuran ujian lama |
| Nilai CBT | `id_tugas`, `id_peserta`, `nilai`, `waktu_sinkron` | `nilai_cbt` | sync ke dashboard/sertifikat |

Sumber: `lms-backend/app/Models/Pengguna.php:18-22`, `lms-backend/app/Models/MasterKursus.php:17-35`, `lms-backend/app/Models/JadwalKursus.php:19-44`, `lms-backend/app/Models/PesertaKelas.php:18-40`, `lms-backend/app/Models/SesiPertemuan.php:14-31`, `lms-backend/app/Models/Tugas.php:16-28`, `lms-backend/app/Models/NilaiCbt.php:15-30`, `lms-frontend/src/services/jadwalService.js:56-77`, `lms-frontend/src/services/tugasService.js:7-17`.

---

## 4. Pemetaan ke CBT (calon, **menunggu Q12**)

| LMS produksi | Kolom/artefak CBT saat ini | Tindakan bila Q12 disetujui |
|---|---|---|
| `id_user` / `id_mahasiswa` | `exam_attempts.user_id` (string, nullable) | Simpan UUID LMS, bukan ID contoh. Wajib ada otorisasi. |
| `id_mk` / `id_jadwal` | `assessments.course_id` (string, nullable) | Putuskan salah satu sebagai referensi; jangan keduanya tanpa aturan. |
| `id_tugas` | belum ada; perlu relasi eksplisit di `assessments` atau tabel tautan | Tambah kolomUUID baru via migration, jangan pakai `course_id`. |
| `token_cbt` | tidak ada | Jangan dipakai sebagai kunci akses; ganti mekanisme signed/expiring. |
| `nilai_cbt` | `exam_results.final_score` + `question_grades.score` | Jembatan sync hanya setelah `finalized_at` dan aturan Q04 jelas. |
| `user_token` / Sanctum | `cbt-frontend/src/config/cbtApi.js` (belum ada Bearer) | Tambah interceptor Bearer **hanya** bila Q12 memilih autentikasi LMS. |
| `ProtectedRoute` dosen/admin | `cbt-frontend/src/App.jsx:80`, `:138` | Samakan aturan peran; rute peserta saat ini masih terbuka. |

Ini pemetaan usulan. Tidak ada kolom yang diubah sekarang, dan tidak ada keputusan yang diambil atas nama pembimbing.

---

## 5. Yang boleh ditiru vs yang tidak boleh

**Boleh ditiru**
- Satu instance Axios + interceptor Bearer, base URL dari env (`lms-frontend/src/config/api.js:3-23`).
- `ProtectedRoute` + layout per peran + `ProfileProvider` (`lms-frontend/src/components/routes/ProtectedRoute.jsx:3-15`).
- State loading/error/empty yang konsisten, notifikasi/konfirmasi, throttle pada login, Form Request + `failedValidation`, UUID, dan disiplin OpenAPI/Postman yang sudah ada di `cbt-api`.
- **Gunakan format respons `cbt-api` yang seragam** (`cbt-api/app/Traits/ApiResponse.php:12-31`), bukan campuran `success`/`status`/paginator mentah dari LMS.

**Jangan ditiru**
- `token_cbt` 6 karakter plaintext dan token di query string (`lms-backend/app/Models/Tugas.php:57-81`).
- `POST /nilai-cbt` yang bisa ditulis token authenticated mana pun tanpa cek peran/kepemilikan (`lms-backend/routes/api.php:36,201`).
- Route debug login sebagai dosen hard-coded (`lms-backend/routes/api.php:179-186`), token di query Google SSO, dan dokumen API yang sudah stale.
- Tidak adanya penanganan 401/refresh, `TugasModal` yang dipasang dua kali, `getLaunchUrl` yang tidak dipakai, mock `json-server`/`db.json`, serta komentar `implement mock delete`.

---

## 6. Titik sambung di kode CBT sekarang

| Titik | File | Peran |
|---|---|---|
| Klien HTTP kedua | `cbt-frontend/src/config/cbtApi.js:4-21` | Belum memasang Bearer; tempat interceptor ditambah setelah Q12. |
| Client LMS lama | `cbt-frontend/src/config/api.js` | Jangan diubah; konsumen alur `link_cbt`/`nilai_cbt`. |
| Adapter switch | `cbt-frontend/src/services/cbt/index.js:1-5` | Titik ganti mock → HTTP tanpa mengubah pemanggil. |
| Guard peran | `cbt-frontend/src/App.jsx:80`, `:138` | Rute dosen CBT terlindungi; rute peserta `/cbt/...` masih terbuka. |
| Format respons | `cbt-api/app/Traits/ApiResponse.php:12-31` | Pakai untuk semua endpoint baru. |
| Skema fisik | `cbt-api/database/migrations/2026_11_28_000001_create_cbt_schema_skeleton.php` | `course_id`/`user_id`/`graded_by` sudah string nullable; siap menampung UUID LMS. |

---

## 7. Urutan integrasi bila diizinkan

1. **Dapatkan keputusan Q12** (dan Q05 untuk platform peserta), catat sumber + tanggal di matriks kebutuhan dan PRD Bab 17.
2. **Minta izin perubah LMS secara eksplisit.** Jangan menyentuh `lms-backend/`, `lms-frontend/`, atau `lms-mobile/` sebelum ada permintaan.
3. Kunci kontrak Bab 7 PRD, lalu tentukan satu referensi kursus (`id_mk` atau `id_jadwal`) dan relasi ke `id_tugas`.
4. Di `cbt-api`, tambahkan autentikasi/otorisasi yang sesuai keputusan; pakai `ApiResponse`, Form Request, throttle, UUID, CORS, dan env yang jelas. Jangan pakai `token_cbt` lama.
5. Di `cbt-frontend`, aktifkan Bearer di `cbtApi.js` **hanya** bila Q12 memilih login LMS; samakan guard peran; ganti `cbtAdapter` dari mock ke HTTP.
6. Bangun jembatan nilai: tulis ke `nilai_cbt` LMS dari `exam_results` yang sudah final, dengan cek peran/kepemilikan dan idempotensi. Pertahankan konsumen lama.
7. Uji alur penuh: login → enrollment → klik tugas → attempt → autosave → submit → penilaian → sync nilai → dashboard/sertifikat. Perbarui dokumentasi tiap langkah (CBT-R12).

Tidak ada langkah di atas yang dijalankan sekarang.

---

## 8. Risiko yang perlu diputuskan

- **Tidak ada sesi web peserta** → bila web dipilih, perlu jalur masuk baru (Q05/Q12).
- **`token_cbt` lemah** dan diverifikasi di query string → tidak layak jadi otorisasi ujian.
- **Sync nilai tanpa otorisasi** → risiko nilai bisa ditulis pihak mana pun yang punya token Sanctum.
- **Dokumen API LMS stale** pada bagian launch (`API_DOCUMENTATION.md:3336-3406` tidak cocok dengan kode) → jangan dijadikan kontrak.
- **Envelope respons tidak konsisten** di LMS → jangan ditiru ke `cbt-api`.
- **Tidak ada expiry token / handling 401** → perlu keputusan sebelum dipakai untuk ujian.

---

## 9. Dokumen terkait

- [Dokumen cakupan seluruh CBT](cakupan-seluruh-cbt.md) — status dan batas cakupan.
- [Matriks kebutuhan](cbt-requirements-matrix.md) — Q01–Q12 dan arahan pembimbing.
- [Lembar konsultasi satu halaman](lembar-konsultasi-cbt.md) — 12 butir terbuka.
- [PRD API CBT](../CBT-API.md) — Bab 5 (aktor), Bab 6.1 (autentikasi), Bab 17 (keputusan terbuka).
- [Diagram cakupan](diagram-cakupan.html) — tidak diubah karena cakupan/arsitektur/status keputusan tidak berubah.
