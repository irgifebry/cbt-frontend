# AGENTS.md

Panduan untuk agen AI yang bekerja di repositori `cbt-frontend` (antarmuka web CBT mandiri U-Cademy).

## Konteks singkat

- Repo: `github.com/irgifebry/cbt-frontend`, dibuat 26 November 2026 dari salinan aplikasi `lms-frontend` + fitur CBT.
- Tujuan: **media demonstrasi skripsi**, bukan produksi. Memakai mock adapter, ID contoh, dan `sessionStorage`.
- Backend `cbt-api` adalah repo terpisah dan saat ini hanya memiliki `GET /api/health`; endpoint bisnis belum ada.
- **Pak Fitrah adalah dosen pembimbing.** Q01–Q12 masih terbuka — jangan menulis usulan catatan konsultasi sebagai keputusan beliau.
- Alur lama `link_cbt` / `token_cbt` / `nilai_cbt` di LMS tetap berfungsi; UI ini **tidak** menggantikannya.

## Aturan kerja

1. Sebelum mengubah cakupan atau arsitektur, baca `docs/cakupan-seluruh-cbt.md`. Untuk ringkasan skripsi baca `docs/cbt-ui-catatan-skripsi.md`; untuk status keputusan baca `docs/cbt-requirements-matrix.md`.
2. Setiap perubahan kode harus disertai pembaruan dokumentasi yang sama (CBT-R12): README, OpenAPI/ERD bila relevan, contoh request/response, dan langkah verifikasi.
3. Jangan menambah dependency npm tanpa kebutuhan nyata. Test memakai `node --test` bawaan Node.
4. `npm run lint` penuh gagal karena ~103 error lama di luar CBT; gate yang benar adalah `npx eslint <berkas yang diubah>` + `npm run build`.
5. Jangan mengubah `lms-backend/`, `lms-mobile/`, atau `cbt-api/` dari repo ini.
6. Jangan mengaktifkan halaman hasil/publikasi hasil sebelum Q04 diputuskan. Jangan menambah peringatan, penghentian, atau penalti proctoring sebelum Q08/Q09 diputuskan.
7. Jangan diam-diam menormalisasi bobot di bawah 100 (Q02), menambah aturan attempt (Q03), atau memvalidasi format unggahan (Q06).

## Perintah

```bash
npm install
npm run dev -- --host 127.0.0.1
node --test src/lib/*.test.js src/services/cbt/*.test.js
npm run build
npx eslint src/lib src/services/cbt src/pages/peserta src/pages/dosen/cbt src/components/peserta src/components/dosen/cbt
```

Jika `npm ci` gagal karena izin cache npm (`EACCES`), pakai ulang `node_modules` yang sudah ada melalui symlink; ini penyesuaian lingkungan, bukan perubahan kode.

## Struktur penting

- `src/config/api.js` — client LMS lama (jangan diubah).
- `src/config/cbtApi.js` — client kedua ke `cbt-api` (belum dipakai karena endpoint belum ada).
- `src/services/cbt/index.js` — titik ganti `cbtAdapter` dari mock ke HTTP.
- `src/lib/` — logika murni: `autosave.js`, `bobot.js`, `cbtErrors.js`, `proctorEvents.js`.
- `src/pages/peserta/`, `src/pages/dosen/cbt/` — layar CBT.
- `docs/screenshots/` — bukti tampilan hasil uji end-to-end.

## Verifikasi terakhir

25/25 test murni lulus, build lulus, dan uji end-to-end memakai Orca CLI serta `agent-browser` berhasil. Bukti: `docs/bukti-verifikasi-cbt-ui.md` dan `docs/screenshots/`.

## Kewajiban pembaruan menyeluruh

Setiap perubahan pada CBT — kode, dokumentasi, atau konfigurasi — wajib diikuti pembaruan yang sesuai agar tidak ada yang tertinggal:

1. **Dokumentasi:** README, `docs/cakupan-seluruh-cbt.md`, `docs/cbt-ui-catatan-skripsi.md`, OpenAPI/ERD bila kontrak atau skema berubah, contoh request/response, dan langkah verifikasi (CBT-R12).
2. **Diagram:** bila cakupan, arsitektur, atau status keputusan berubah, perbarui diagram cakupan memakai skill `diagram-design`. Diagram cakupan lengkap **belum dibuat** dan menjadi pekerjaan wajib berikutnya.
3. **Repository:** jaga metadata GitHub (deskripsi About, homepage, topics), status branch, dan sinkronisasi remote agar tetap rapi.
4. **Memori AI:** perbarui `AGENTS.md` dan `CLAUDE.md` (root serta repo terkait) bila aturan, status, atau keputusan berubah, supaya agen baru otomatis mengikuti keadaan terbaru.

Jangan menganggap pekerjaan selesai sebelum keempat hal di atas dicek.
