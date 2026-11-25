# DOKUMEN PERSYARATAN PRODUK (PRD)

## Pengembangan REST API Computer Based Test (CBT) Mandiri pada LMS Ucademy

**Versi:** 1.1  
**Status:** Draf — kebutuhan diperbarui berdasarkan catatan pembimbing; keputusan terbuka tetap menunggu konfirmasi  
**Tanggal pembaruan:** 19 November 2026  
**Penanggung Jawab:** Irgi Febryansyah  
**Jenis Pengembangan:** Pengembangan API backend  
**Platform rencana:** Laravel 13 / PHP 8.3, aplikasi CBT terpisah  
**Repository API CBT:** [https://github.com/irgifebry/cbt-api](https://github.com/irgifebry/cbt-api)  
**Matriks status kebutuhan:** [`docs/cbt-requirements-matrix.md`](docs/cbt-requirements-matrix.md)

---

# 1. Ringkasan Proyek

## 1.1 Latar Belakang

Ucademy merupakan Sistem Manajemen Pembelajaran (LMS) yang digunakan untuk mendukung kegiatan pembelajaran berbasis kursus singkat untuk umum, tanpa bergantung pada struktur fakultas, program studi, atau mata kuliah. Salah satu fitur yang dibutuhkan dalam platform ini adalah Computer Based Test (CBT), yaitu sistem evaluasi pembelajaran yang memungkinkan peserta mengerjakan ujian secara daring.

Pada implementasi sebelumnya, fungsi CBT memanfaatkan layanan atau API eksternal. Ketergantungan tersebut dapat membatasi fleksibilitas pengembangan, pengelolaan data, dan integrasi dengan kebutuhan internal Ucademy.

Oleh karena itu, diperlukan pengembangan REST API CBT mandiri yang terintegrasi langsung dengan backend Ucademy. API ini akan menangani seluruh proses bisnis CBT, mulai dari pengelolaan ujian dan soal, pelaksanaan ujian, penyimpanan jawaban, penilaian, hingga pengelolaan hasil dan aktivitas pemantauan ujian dasar.

Pengembangan dilakukan pada repositori backend Ucademy yang sudah tersedia agar sistem CBT dapat memanfaatkan autentikasi, pengguna, peran, serta data pembelajaran yang telah dimiliki platform.

## 1.2 Tujuan

1. Mengembangkan REST API CBT mandiri pada backend Ucademy.
2. Mengurangi ketergantungan terhadap API CBT eksternal.
3. Menyediakan API untuk pengelolaan ujian dan bank soal.
4. Mendukung empat tipe soal dalam satu ujian.
5. Mengimplementasikan mekanisme pembobotan dan penilaian.
6. Menyediakan API untuk pelaksanaan dan pengumpulan ujian.
7. Mengimplementasikan pemantauan ujian dasar berbasis aktivitas peramban.
8. Menyediakan API hasil ujian dan riwayat aktivitas peserta.
9. Menghasilkan backend yang terdokumentasi dan siap diintegrasikan dengan antarmuka frontend.

## 1.3 Sasaran Pengguna API


| Pengguna         | Kebutuhan                                              |
| ---------------- | ------------------------------------------------------ |
| Admin/Instruktur | Mengelola ujian, soal, penilaian, dan hasil            |
| Peserta          | Mengakses ujian, mengirim jawaban, dan melihat hasil   |
| Frontend Ucademy | Mengonsumsi endpoint CBT                               |
| Sistem backend   | Memvalidasi proses bisnis dan menjaga konsistensi data |


---

# 2. Ruang Lingkup Pengembangan

## 2.1 Termasuk dalam Cakupan

Pengembangan API mencakup:

1. Audit dan pemanfaatan backend Ucademy.
2. Integrasi autentikasi dan otorisasi.
3. Manajemen ujian.
4. Manajemen bank soal.
5. Manajemen pilihan jawaban.
6. Pengaturan bobot soal.
7. Publikasi ujian.
8. Pelaksanaan ujian dan sesi pengerjaan ujian.
9. Penyimpanan jawaban peserta.
10. Pengumpulan jawaban.
11. Penilaian otomatis dan manual.
12. Pengelolaan hasil ujian.
13. Pengelolaan file jawaban.
14. Pemantauan ujian dasar.
15. Dokumentasi API.
16. Pengujian API.

## 2.2 Di Luar Cakupan

Hal-hal berikut tidak termasuk dalam pengembangan tahap ini:

- Pengembangan antarmuka website CBT.
- Pengembangan antarmuka aplikasi mobile.
- Pengembangan sistem autentikasi baru.
- Pengembangan sistem LMS secara keseluruhan.
- Pengembangan kamera atau webcam pemantauan ujian.
- Face recognition dan face detection.
- Eye tracking atau gaze tracking.
- AI-based cheating detection.
- Screen recording.
- Device pemantauan.
- Pengembangan layanan CBT eksternal baru.
- Pengembangan fitur lanjutan pemantauan ujian.

**Ketentuan:** Pemantauan ujian dasar merupakan kebutuhan yang diarahkan pembimbing, tetapi peristiwa, konsekuensi, dan batas kemampuannya harus menunggu konfirmasi. Pengembangan tahap awal difokuskan pada backend REST API; tidak ada antarmuka frontend CBT dalam tahap ini. API CBT dikembangkan sebagai aplikasi dan basis data terpisah menggunakan data contoh terlebih dahulu; integrasi autentikasi/enrollment LMS belum termasuk pekerjaan yang telah dikonfirmasi untuk tahap awal.

---

# 3. Arsitektur dan Pendekatan Pengembangan

## 3.1 Pendekatan API-First

Pengembangan menggunakan pendekatan API-first. Seluruh kebutuhan bisnis CBT diimplementasikan dan diuji melalui REST API sebelum dilakukan integrasi antarmuka antarmuka frontend.

backend bertanggung jawab atas:

- Validasi data.
- Autentikasi dan otorisasi.
- Pengelolaan ujian.
- Pengelolaan soal.
- Pengelolaan sesi pengerjaan.
- Penghitungan waktu.
- Penyimpanan jawaban.
- Penilaian.
- Pengelolaan hasil.
- Pencatatan aktivitas pemantauan ujian.

Frontend hanya berperan sebagai konsumen API dan tidak menjadi sumber kebenaran untuk proses bisnis utama.

## 3.2 Arsitektur Konseptual

```
                  UCADEMY FRONTEND
                         |
                         | HTTP Request
                         | JSON Response
                         v
                  UCADEMY REST API
                         |
              Middleware Autentikasi
                         |
               Middleware Otorisasi
                         |
                  CBT API Module
                         |
       +-----------------+------------------+
       |                 |                  |
       v                 v                  v
 Ujian          Sesi Pengerjaan Ujian        Proctoring
 Pengelolaan          Pengelolaan          Pengelolaan
       |                 |                  |
       v                 v                  v
 Question            Answer &            Proctor
 Pengelolaan          Submission          Events
       |                 |
       v                 v
       +------------ Grading -------------+
                         |
                         v
                    Exam Results
                         |
                         v
                    UCADEMY DATABASE
```

## 3.3 Prinsip Arsitektur

1. CBT menjadi modul internal backend Ucademy.
2. Sistem menggunakan autentikasi Ucademy yang telah tersedia.
3. Data pengguna tidak diduplikasi tanpa kebutuhan.
4. Seluruh proses bisnis utama dijalankan di backend.
5. Setiap endpoint memiliki validasi dan otorisasi.
6. Struktur implementasi mengikuti konvensi repositori yang sudah ada.
7. API menggunakan format JSON untuk pertukaran data, kecuali proses unggah dan unduh file.

---

# 4. Teknologi dan Lingkungan Pengembangan

Teknologi berikut menjadi acuan awal dan harus diverifikasi terhadap konfigurasi aktual repositori.


| Komponen           | Teknologi                                      |
| ------------------ | ---------------------------------------------- |
| Kerangka Kerja backend  | Laravel 13                                     |
| Bahasa Pemrograman | PHP 8.3                                        |
| Database           | Mengikuti basis data Ucademy yang sudah berjalan |
| Autentikasi     | Mengikuti mekanisme autentikasi Ucademy        |
| Protokol API       | REST API                                       |
| Pertukaran Data      | JSON                                           |
| Dokumentasi API  | OpenAPI / Swagger                              |
| Pengujian API        | Postman atau alat sejenis                     |
| Kendali Versi    | Git                                            |


Penggunaan pustaka tambahan harus mempertimbangkan kompatibilitas dengan dependensi yang telah digunakan backend Ucademy.

---

# 5. Aktor dan Hak Akses

## 5.1 Instruktur

Instruktur memiliki hak untuk:

- Membuat ujian.
- Mengubah informasi ujian.
- Menghapus ujian yang memenuhi ketentuan.
- Membuat dan mengelola soal.
- Mengatur bobot soal.
- Menambahkan soal ke ujian.
- Memublikasikan ujian.
- Melihat peserta dan sesi pengerjaan.
- Melihat aktivitas pemantauan ujian.
- Memberikan penilaian manual.
- Melihat hasil ujian.

## 5.2 Peserta

Peserta memiliki hak untuk:

- Melihat ujian yang tersedia.
- Melihat informasi ujian.
- Memulai ujian.
- Mengambil soal untuk sesi pengerjaan miliknya.
- Menyimpan jawaban.
- Mengunggah dokumen.
- Mengumpulkan ujian.
- Melihat hasil sesuai kebijakan publikasi.

## 5.3 Sistem

Sistem memiliki tanggung jawab untuk:

- Memvalidasi autentikasi.
- Memvalidasi hak akses.
- Memvalidasi jadwal.
- Mengelola durasi ujian.
- Menyimpan jawaban.
- Menghitung nilai.
- Mengelola status sesi pengerjaan.
- Mencatat aktivitas pemantauan ujian.
- Menjaga konsistensi dan keamanan data.

---

# 6. Kebutuhan Fungsional API

## 6.1 Autentikasi dan Otorisasi

**FR-API-001: Integrasi Autentikasi**

API CBT harus menggunakan mekanisme autentikasi Ucademy yang sudah tersedia.

**FR-API-002: Validasi Peran**

API harus membedakan hak akses instruktur dan peserta.

**FR-API-003: Validasi Pendaftaran**

Peserta hanya dapat mengakses ujian yang terkait dengan kursus singkat tempat peserta terdaftar.

**FR-API-004: Validasi Kepemilikan Data**

Peserta hanya dapat mengambil dan mengubah data sesi pengerjaan miliknya sendiri.

## 6.2 Pengelolaan Ujian

**FR-API-005: Membuat Ujian**

Instruktur dapat membuat ujian dengan data:

- Judul.
- Deskripsi.
- Petunjuk.
- kursus singkat ID.
- Waktu mulai.
- Waktu berakhir.
- Durasi.
- Jumlah maksimum sesi pengerjaan.
- Nilai kelulusan.
- Visibilitas hasil.

**FR-API-006: Mengubah Ujian**

Instruktur dapat mengubah konfigurasi ujian sesuai status ujian dan aturan perubahan data.

**FR-API-007: Menghapus Ujian**

Instruktur dapat menghapus ujian yang belum memiliki data pengerjaan yang harus dipertahankan. Penghapusan data historis harus mengikuti kebijakan integritas data.

**FR-API-008: Melihat Daftar Ujian**

API menyediakan daftar ujian berdasarkan hak akses pengguna.

**FR-API-009: Detail Ujian**

API menyediakan detail ujian sesuai peran pengguna.

**FR-API-010: Publikasi Ujian**

API memvalidasi kelengkapan ujian sebelum publikasi.

Validasi meliputi:

- Informasi ujian.
- Jadwal.
- Durasi.
- Daftar soal.
- Bobot soal.
- Konfigurasi penilaian.

## 6.3 Pengelolaan Soal

Sistem harus mendukung empat tipe soal. Arahan pembimbing menyatakan satu ujian dapat mencampur beberapa tipe soal dalam ujian yang sama; soal dibuat manual oleh pengajar.

### A. Pilihan Tunggal

- Pertanyaan.
- Daftar pilihan.
- Satu kunci jawaban.
- Penilaian otomatis.

### B. Pilihan Ganda / Beberapa Jawaban Benar

- Pertanyaan.
- Daftar pilihan.
- Lebih dari satu kunci jawaban dimungkinkan.
- Penilaian otomatis.

Kebijakan penilaian multiple PG (kecocokan persis atau nilai parsial) belum diputuskan. Jangan mengunci algoritma penilaian sebelum ada arahan pembimbing.

### C. Esai

- Pertanyaan.
- Jawaban berbentuk teks.
- Penilaian manual.
- Bobot nilai.

### D. Unggah Dokumen

- Pertanyaan atau instruksi.
- Jawaban berupa dokumen.
- Validasi format dan ukuran file.
- Penyimpanan file secara privat.
- Penilaian manual.

**FR-API-011:** Instruktur dapat membuat soal.

**FR-API-012:** Instruktur dapat mengubah soal.

**FR-API-013:** Instruktur dapat menghapus soal sesuai aturan penggunaan soal.

**FR-API-014:** Instruktur dapat mengelola pilihan jawaban.

**FR-API-015:** Sistem dapat menghubungkan soal dengan ujian.

**FR-API-016:** Satu ujian dapat memiliki kombinasi berbagai tipe soal.

**FR-API-017:** Sistem tidak boleh mengirimkan kunci jawaban kepada endpoint peserta.

## 6.4 Pengelolaan Relasi Soal Ujian dan Bobot

Bobot soal disimpan pada relasi antara ujian dan soal.

**FR-API-018:** Instruktur dapat mengatur bobot setiap soal.

**FR-API-019:** Sistem memvalidasi bobot bernilai positif atau nol sesuai kebijakan yang ditentukan.

**FR-API-020:** Sistem menolak total bobot melebihi 100.

**FR-API-021:** Sistem memvalidasi total bobot sebelum publikasi.

Contoh:


| Soal      | Tipe            | Bobot   |
| --------- | --------------- | ------- |
| 1         | Pilihan Tunggal   | 10      |
| 2         | Pilihan Tunggal   | 10      |
| 3         | Multiple Choice | 20      |
| 4         | Esai           | 30      |
| 5         | Unggah Dokumen | 30      |
| **Total** |                 | **100** |


Arahan pembimbing menetapkan total bobot ujian **maksimum 100** dan pembagian bobot tiap soal ditentukan pengajar, tanpa pembagian baku berdasarkan tipe soal. Aturan penerimaan bobot nol/positif dan cara menghitung nilai jika total bobot kurang dari 100 belum diputuskan. Jangan menerapkan rekomendasi total tepat 100 sebelum dikonfirmasi.

## 6.5 Pengelolaan Sesi Pengerjaan Ujian

Arahan pembimbing menyebut ujian memiliki pengaturan waktu, soal diacak, jawaban disimpan otomatis setiap kali peserta mengisi, dan peserta melanjutkan sesi pengerjaan yang sama setelah koneksi pulih. Detail operasional yang belum dipastikan—termasuk jumlah sesi pengerjaan, aturan expiry/melanjutkan, kapan pewaktu dimulai, cara mempertahankan hasil pengacakan saat melanjutkan, dan pengumpulan otomatis—menunggu konfirmasi sebelum implementasi dikunci.

**FR-API-022: Memulai Ujian**

Peserta dapat memulai ujian apabila:

- Sudah terautentikasi.
- Memiliki enrollment yang valid.
- Ujian sudah dipublikasikan.
- Jadwal ujian mengizinkan pengerjaan.
- Jumlah sesi pengerjaan belum melebihi batas.

**FR-API-023: Membuat Sesi pengerjaan**

Sistem membuat record sesi pengerjaan dengan informasi:

- ID ujian.
- ID pengguna.
- Sesi pengerjaan number.
- Waktu mulai.
- Waktu kedaluwarsa.
- Status.
- Pengumpulanted at.

**FR-API-024: Mengambil Soal**

Peserta hanya dapat mengambil soal dari ujian yang sedang dikerjakan.

**FR-API-025: Timer**

Sistem menggunakan waktu server sebagai acuan durasi ujian.

**FR-API-026: Melanjutkan Sesi pengerjaan**

Peserta dapat melanjutkan sesi pengerjaan aktif setelah reload atau gangguan koneksi sesuai aturan ujian.

**FR-API-027: Pengumpulan Ujian**

Peserta dapat mengumpulkan ujian secara manual.

**FR-API-028: Auto Pengumpulan**

Sistem mengumpulkan ujian ketika batas waktu pengerjaan berakhir.

**FR-API-029: Validasi Sesi pengerjaan**

Sesi pengerjaan yang sudah dikumpulkan atau kedaluwarsa tidak dapat menerima perubahan jawaban.

## 6.6 Pengelolaan Jawaban

Arahan penyimpanan otomatis: jawaban disimpan otomatis setiap kali peserta mengisi. Peserta yang terputus koneksi dapat kembali melanjutkan sesi pengerjaan yang sama dari jawaban yang telah tersimpan. Mekanisme konfirmasi penerimaan, percobaan ulang, idempotensi, dan perilaku saat permintaan bersamaan perlu ditentukan pada rancangan API; jangan mengklaim jawaban telah tersimpan sampai server mengonfirmasikannya.

**FR-API-030:** Peserta dapat menyimpan jawaban pilihan ganda.

**FR-API-031:** Peserta dapat menyimpan jawaban PG kompleks.

**FR-API-032:** Peserta dapat menyimpan jawaban esai.

**FR-API-033:** Peserta dapat mengunggah dokumen jawaban.

**FR-API-034:** Sistem melakukan validasi terhadap jawaban berdasarkan tipe soal.

**FR-API-035:** Sistem menyimpan waktu perubahan jawaban.

**FR-API-036:** Sistem menyediakan mekanisme penyimpanan jawaban yang aman terhadap permintaan berulang.

## 6.7 Pengelolaan Penilaian

**FR-API-037: Penilaian Otomatis**

Sistem menilai single choice dan multiple choice secara otomatis berdasarkan kebijakan penilaian yang ditentukan.

**FR-API-038: Penilaian Manual**

Instruktur dapat memberikan nilai pada jawaban esai dan dokumen.

**FR-API-039: Validasi Nilai**

Nilai yang diberikan tidak boleh melebihi bobot soal.

**FR-API-040: Umpan Balik**

Instruktur dapat memberikan catatan atau umpan balik pada jawaban peserta.

**FR-API-041: Status Penilaian**

Sistem menyediakan status:

- Menunggu Penilaian.
- Dinilai Sebagian.
- Dinilai Sepenuhnya.
- Difinalisasi.

**FR-API-042: Penghitungan Nilai**

Sistem menghitung nilai akhir berdasarkan akumulasi nilai soal.

Rumus:

Nilai Akhir = Jumlah Nilai Seluruh Soal

## 6.8 Pengelolaan Hasil

**FR-API-043:** Instruktur dapat melihat hasil ujian peserta.

**FR-API-044:** Peserta dapat melihat hasil miliknya sendiri apabila publikasi hasil telah diizinkan.

**FR-API-045:** Sistem membedakan hasil sementara dan hasil final.

**FR-API-046:** Sistem menyimpan nilai akhir, status kelulusan, dan informasi penilaian.

## 6.9 API Pemantauan Ujian

Pembimbing meminta adanya pemantauan ujian. Cakupan yang ada pada dokumen ini (pemantauan aktivitas peramban) merupakan rancangan awal dan perlu dikonfirmasi; jenis peristiwa, konsekuensi terhadap ujian, serta apakah keluar layar penuh hanya dicatat atau memengaruhi sesi pengerjaan belum diputuskan. Aktivitas peramban tidak otomatis membuktikan kecurangan.

**FR-API-047: Tab Visibility Peristiwa**

API menerima peristiwa ketika halaman ujian menjadi tidak terlihat.

**FR-API-048: Fullscreen Peristiwa**

API menerima peristiwa ketika peserta keluar dari mode layar penuh.

**FR-API-049: Window Focus Peristiwa**

API menerima peristiwa kehilangan atau kembalinya fokus jendela.

**FR-API-050: Peristiwa Logging**

Sistem mencatat:

- Sesi pengerjaan ID.
- Peristiwa type.
- Peristiwa timestamp.
- Metadata pendukung jika tersedia.

**FR-API-051: Riwayat pemantauan ujian**

Instruktur dapat mengambil riwayat aktivitas pemantauan ujian berdasarkan sesi pengerjaan.

Catatan: Peristiwa dikirim oleh antarmuka frontend melalui peramban API dan dicatat oleh backend. backend tidak dapat membuktikan bahwa semua aktivitas di luar peramban terdeteksi.

---

# 7. Rancangan Endpoint API

Endpoint berikut merupakan spesifikasi awal. Prefix, penamaan, status HTTP, dan struktur respons final harus disesuaikan dengan konvensi backend Ucademy.

Jalur dasar konseptual:

`/api/v1/cbt`

## 7.1 Ujian


| Method | Endpoint                  | Fungsi          |
| ------ | ------------------------- | --------------- |
| GET    | /assessments              | Daftar ujian    |
| POST   | /assessments              | Membuat ujian   |
| GET    | /assessments/{id}         | Detail ujian    |
| PUT    | /assessments/{id}         | Mengubah ujian  |
| DELETE | /assessments/{id}         | Menghapus ujian |
| POST   | /assessments/{id}/publish | Publikasi ujian |
| POST   | /assessments/{id}/archive | Arsip ujian     |


## 7.2 Soal


| Method | Endpoint                                 | Fungsi                    |
| ------ | ---------------------------------------- | ------------------------- |
| GET    | /questions                               | Daftar soal               |
| POST   | /questions                               | Membuat soal              |
| GET    | /questions/{id}                          | Detail soal               |
| PUT    | /questions/{id}                          | Mengubah soal             |
| DELETE | /questions/{id}                          | Menghapus soal            |
| POST   | /assessments/{id}/questions              | Menambahkan soal          |
| PUT    | /assessments/{id}/questions/{questionId} | Mengatur soal dan bobot   |
| DELETE | /assessments/{id}/questions/{questionId} | Menghapus soal dari ujian |


## 7.3 Sesi Pengerjaan Ujian


| Method | Endpoint                   | Fungsi                 |
| ------ | -------------------------- | ---------------------- |
| GET    | /my-assessments            | Ujian peserta          |
| POST   | /assessments/{id}/attempts | Memulai ujian          |
| GET    | /attempts/{id}             | Detail sesi pengerjaan         |
| GET    | /attempts/{id}/questions   | Mengambil soal sesi pengerjaan |
| POST   | /attempts/{id}/submit      | Mengumpulkan ujian     |
| GET    | /attempts/{id}/status      | Status pengerjaan      |


## 7.4 Jawaban


| Method | Endpoint                                 | Fungsi                      |
| ------ | ---------------------------------------- | --------------------------- |
| PUT    | /attempts/{id}/answers/{questionId}      | Menyimpan jawaban           |
| POST   | /attempts/{id}/answers/{questionId}/file | Mengunggah jawaban dokumen  |
| GET    | /attempts/{id}/answers                   | Mengambil jawaban tersimpan |


## 7.5 Penilaian


| Method | Endpoint                            | Fungsi           |
| ------ | ----------------------------------- | ---------------- |
| GET    | /attempts/{id}/grading              | Data penilaian   |
| PUT    | /attempts/{id}/grading/{questionId} | Memberikan nilai |
| POST   | /attempts/{id}/grading/finalize     | Finalisasi nilai |


## 7.6 Hasil


| Method | Endpoint                           | Fungsi                 |
| ------ | ---------------------------------- | ---------------------- |
| GET    | /attempts/{id}/result              | Hasil peserta          |
| GET    | /assessments/{id}/results          | Rekap hasil ujian      |
| GET    | /assessments/{id}/results/{userId} | Hasil peserta tertentu |


## 7.7 Pemantauan Ujian


| Method | Endpoint                         | Fungsi                   |
| ------ | -------------------------------- | ------------------------ |
| POST   | /attempts/{id}/proctor-events    | Mengirim peristiwa           |
| GET    | /attempts/{id}/proctor-events    | Riwayat peristiwa            |
| GET    | /assessments/{id}/proctor-events | Riwayat pemantauan ujian |


---

# 8. Standar Request dan Response API

## 8.1 Format Respons Berhasil

Contoh:

```
{
  "success": true,
  "message": "Ujian retrieved successfully",
  "data": {
    "id": 1,
    "title": "Ujian Pemrograman Dasar",
    "duration": 60,
    "total_weight": 100
  }
}
```

## 8.2 Format Respons Gagal

Contoh:

```
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "duration": [
      "The duration field is required."
    ]
  }
}
```

Format tersebut merupakan usulan. Jika backend sudah memiliki standar respons, gunakan standar yang sama.

## 8.3 Kode Status HTTP


| Status | Kegunaan                      |
| ------ | ----------------------------- |
| 200    | Permintaan berhasil              |
| 201    | Data berhasil dibuat          |
| 204    | Berhasil tanpa respons body  |
| 400    | Permintaan tidak valid           |
| 401    | Belum terautentikasi          |
| 403    | Tidak memiliki izin           |
| 404    | Data tidak ditemukan          |
| 409    | Konflik status atau duplikasi |
| 422    | Validasi gagal                |
| 500    | Kesalahan internal server     |


---

# 9. Rancangan Database Konseptual

Daftar berikut merupakan kebutuhan entitas konseptual. Sebelum membuat migration, lakukan audit terhadap tabel yang sudah tersedia.


| Entitas               | Tanggung Jawab                |
| --------------------- | ----------------------------- |
| assessments           | Informasi ujian               |
| questions             | Data pertanyaan               |
| question\_options     | Pilihan jawaban               |
| ujian\_questions | Relasi ujian, soal, dan bobot |
| exam\_attempts        | Sesi pengerjaan               |
| attempt\_answers      | Jawaban peserta               |
| answer\_files         | Referensi file jawaban        |
| question\_grades      | Nilai per soal                |
| exam\_results         | Rekap hasil ujian             |
| proctor\_events       | Log aktivitas peramban         |


## 9.1 Relasi Konseptual

- Satu ujian memiliki banyak questions melalui ujian_questions.
- Satu soal dapat digunakan pada beberapa ujian.
- Satu ujian memiliki banyak exam_attempts.
- Satu user dapat memiliki beberapa exam_attempts.
- Satu exam_attempt memiliki banyak attempt_answers.
- Satu attempt_answer dapat memiliki referensi answer_files.
- Satu attempt_answer dapat memiliki question_grade.
- Satu exam_attempt memiliki banyak proctor_events.
- Satu exam_attempt memiliki satu hasil akhir setelah penilaian selesai.

## 9.2 Aturan Desain Data

1. Bobot soal disimpan di ujian_questions.
2. Kunci jawaban tidak boleh terekspos pada respons peserta.
3. Sesi pengerjaan harus mereferensikan versi atau snapshot soal yang digunakan.
4. Perubahan soal tidak boleh mengubah sesi pengerjaan yang sudah dimulai.
5. File jawaban tidak disimpan sebagai data publik.
6. Data hasil dan riwayat ujian harus mempertahankan integritas historis.

---

# 10. Aturan Bisnis Utama


| ID    | Aturan                                                     |
| ----- | ---------------------------------------------------------- |
| BR-01 | Hanya instruktur berwenang yang dapat membuat ujian        |
| BR-02 | Peserta harus terdaftar pada kursus singkat terkait          |
| BR-03 | Ujian harus dipublikasikan sebelum dapat dikerjakan        |
| BR-04 | Peserta tidak dapat memulai ujian di luar jadwal           |
| BR-05 | Jumlah sesi pengerjaan mengikuti batas yang ditentukan             |
| BR-06 | Total bobot tidak boleh melebihi 100                       |
| BR-07 | Timer mengikuti waktu server                               |
| BR-08 | Jawaban tidak dapat diubah setelah sesi pengerjaan dikumpulkan     |
| BR-09 | Nilai manual tidak boleh melebihi bobot soal               |
| BR-10 | Hasil akhir menunggu seluruh penilaian manual selesai      |
| BR-11 | Peserta hanya dapat mengakses sesi pengerjaan miliknya             |
| BR-12 | Aktivitas pemantauan ujian tidak otomatis membuktikan kecurangan |
| BR-13 | Kunci jawaban tidak dikirimkan pada endpoint peserta       |
| BR-14 | Perubahan ujian tidak mengubah snapshot sesi pengerjaan aktif      |


---

# 11. Kebutuhan Nonfungsional

## 11.1 Keamanan

- Menggunakan autentikasi Ucademy.
- Menerapkan middleware otorisasi.
- Memvalidasi kepemilikan sumber daya.
- Melindungi kunci jawaban.
- Memvalidasi unggah file.
- Membatasi akses file.
- Menerapkan validasi permintaan.
- Menghindari manipulasi nilai dari sisi klien.
- Menerapkan pembatasan laju permintaan pada endpoint yang relevan.

## 11.2 Kinerja

- Endpoint harus memiliki waktu respons yang layak untuk kebutuhan ujian.
- Query basis data harus efisien.
- Pengambilan soal harus menghindari query berulang yang tidak diperlukan.
- Penyimpanan jawaban harus responsif.
- Pengujian beban dilakukan menggunakan skenario jumlah pengguna bersamaan yang ditetapkan.

## 11.3 Keandalan

- Jawaban yang berhasil disimpan tidak boleh hilang.
- Pengumpulan harus idempotent atau aman terhadap permintaan berulang.
- Timer harus tetap valid meskipun peramban dimuat ulang.
- Sistem harus menjaga konsistensi nilai.
- Kesalahan transaksi tidak boleh meninggalkan data ujian dalam kondisi setengah tersimpan.

## 11.4 Kemudahan Pemeliharaan

- Struktur kode mengikuti konvensi Laravel.
- Logika bisnis dipisahkan dari controller.
- Validasi permintaan dikelola secara terstruktur.
- Penamaan endpoint konsisten.
- Setiap modul memiliki tanggung jawab yang jelas.
- Kode dilengkapi pengujian otomatis untuk logika kritis.

---

# 12. Rekomendasi Struktur Implementasi

Struktur berikut merupakan usulan yang dapat disesuaikan setelah audit repositori.

```
app/
├── Models/
│   └── CBT/
│       ├── Ujian.php
│       ├── Question.php
│       ├── QuestionOption.php
│       ├── ExamAttempt.php
│       ├── AttemptAnswer.php
│       ├── AnswerFile.php
│       ├── QuestionGrade.php
│       ├── ExamResult.php
│       └── ProctorEvent.php
│
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── CBT/
│   │           ├── UjianController.php
│   │           ├── QuestionController.php
│   │           ├── AttemptController.php
│   │           ├── AnswerController.php
│   │           ├── GradingController.php
│   │           ├── ResultController.php
│   │           └── ProctoringController.php
│   │
│   └── Requests/
│       └── CBT/
│
└── Services/
    └── CBT/
        ├── UjianService.php
        ├── QuestionService.php
        ├── AttemptService.php
        ├── AnswerService.php
        ├── GradingService.php
        └── ProctoringService.php
```

Komponen tambahan jika diperlukan:

- Kebijakan otorisasi untuk otorisasi sumber daya.
- API Resources untuk format respons.
- Tugas latar belakang untuk proses asinkron.
- Peristiwa dan Pemroses peristiwa untuk aktivitas tertentu.
- Notifikasi untuk pemberitahuan hasil atau status ujian.

Tidak semua komponen harus dibuat apabila pola repositori yang ada sudah menyediakan pendekatan serupa.

---

# 13. Strategi Pengujian API

## 13.1 Pengujian Unit

Menguji fungsi inti secara terpisah:

- Perhitungan bobot.
- Perhitungan nilai.
- Penilaian PG tunggal.
- Penilaian PG kompleks.
- Validasi waktu ujian.
- Validasi status sesi pengerjaan.

## 13.2 Pengujian Fitur

Menguji endpoint API:

- Membuat ujian.
- Membuat soal.
- Menghubungkan soal dengan ujian.
- Publikasi ujian.
- Memulai sesi pengerjaan.
- Menyimpan jawaban.
- Mengunggah dokumen.
- Pengumpulan ujian.
- Penilaian manual.
- Pengambilan hasil.
- Pencatatan pemantauan ujian.

## 13.3 Pengujian Otorisasi

Menguji:

- Peserta tidak dapat membuat ujian.
- Instruktur tidak dapat mengakses sumber daya di luar kewenangannya.
- Peserta tidak dapat mengambil sesi pengerjaan milik orang lain.
- Peserta tidak dapat melihat kunci jawaban.
- Pengguna tanpa autentikasi tidak dapat mengakses endpoint terlindungi.

## 13.4 Pengujian Keamanan

Menguji:

- Manipulasi nilai.
- Manipulasi waktu.
- Request mengumpulkan berulang.
- Pengiriman jawaban setelah waktu habis.
- Upload file dengan format tidak diizinkan.
- Akses file tanpa izin.
- Manipulasi parameter ID sumber daya.

## 13.5 Pengujian Integrasi

Menguji integrasi CBT dengan:

- Autentikasi Ucademy.
- Peran dan izin.
- kursus singkat.
- Pendaftaran.
- Database.
- File storage.

---

# 14. Tahapan Pengerjaan API

Pengembangan dilakukan secara berurutan agar setiap modul dapat diuji sebelum masuk ke modul berikutnya.


| Tahap | Fokus                              | Hasil                          |
| ----- | ---------------------------------- | ------------------------------- |
| 1     | Audit repositori                   | Dokumen analisis backend        |
| 2     | Finalisasi kebutuhan               | Persyaratan API                 |
| 3     | Perancangan basis data               | ERD dan rencana migrasi          |
| 4     | Perancangan endpoint               | spesifikasi API               |
| 5     | Autentikasi dan otorisasi   | Akses API CBT                   |
| 6     | Pengelolaan ujian dan soal | API manajemen ujian             |
| 7     | Pengelolaan sesi pengerjaan ujian dan jawaban | API pengerjaan ujian            |
| 8     | Pengelolaan penilaian dan hasil      | API penilaian dan hasil         |
| 9     | Pemantauan ujian                         | API pencatatan aktivitas        |
| 10    | Pengujian dan dokumentasi            | laporan pengujian dan dokumentasi API |


## 14.1 Prioritas Implementasi

**Prioritas P0: Fondasi dan alur inti**

- Audit backend.
- Integrasi autentikasi.
- Peran dan otorisasi.
- Ujian.
- Soal.
- Relasi soal ujian dan bobot.
- Sesi pengerjaan.
- Jawaban.
- Pengumpulan.

**Prioritas P1: Penyelesaian fungsi CBT**

- Automatic grading.
- Manual grading.
- Result.
- unggah dokumen.
- Pemantauan ujian.
- snapshot/versi ujian.

**Prioritas P2: Kualitas dan kesiapan integrasi**

- dokumentasi API.
- pengujian otomatis.
- pengujian keamanan.
- pengujian kinerja.
- Standardisasi respons.
- Perbaikan dan optimasi.

Prioritas ini merupakan urutan pengerjaan, bukan tahapan pengembangan produk yang terpisah.

---

# 15. Hasil Kerja

Hasil yang wajib dihasilkan dari pengembangan API CBT:


| No. | Hasil kerja                      |
| --- | -------------------------------- |
| 1   | Hasil audit repositori backend   |
| 2   | Dokumen kebutuhan API            |
| 3   | Diagram Relasi Entitas      |
| 4   | Migrasi basis data               |
| 5   | Model dan relasi                 |
| 6   | REST API CBT                     |
| 7   | Autentikasi dan otorisasi |
| 8   | Sistem penilaian                 |
| 9   | Sistem pemantauan ujian dasar          |
| 10  | Pengujian otomatis                   |
| 11  | Dokumentasi OpenAPI/Swagger      |
| 12  | Koleksi Postman                  |
| 13  | Laporan pengujian API            |


---

# 16. Kriteria Penyelesaian

Pengembangan API CBT dinyatakan selesai apabila:

1. API CBT telah terintegrasi dengan backend Ucademy.
2. Autentikasi dan otorisasi berjalan.
3. Ujian dapat dibuat, diubah, dan dipublikasikan.
4. Sistem mendukung empat jenis soal.
5. Pembobotan soal berjalan sesuai aturan.
6. Peserta dapat memulai dan menyelesaikan ujian.
7. Jawaban dapat disimpan dan dipulihkan.
8. Timer menggunakan waktu server.
9. Pengumpulan manual dan otomatis berjalan.
10. Penilaian otomatis dan manual berjalan.
11. Hasil ujian dapat diambil melalui API.
12. Pemantauan ujian dasar dapat menerima dan menyimpan peristiwa.
13. Endpoint telah diuji berdasarkan peran dan hak akses.
14. Tidak ada bug kritis pada alur utama CBT.
15. Dokumentasi API tersedia dan sesuai implementasi aktual.

---

# 17. Hal yang Memerlukan Konfirmasi

Butir di bawah tetap terbuka. Jangan menetapkan nilai bawaan atau mengimplementasikan perilaku yang bergantung padanya sebelum mendapatkan arahan pembimbing. Status kebutuhan yang sudah diarahkan dan matriks tindak lanjut tersedia di [`docs/cbt-requirements-matrix.md`](docs/cbt-requirements-matrix.md).


| No. | Pertanyaan                                                                 | Dampak                                   |
| --- | -------------------------------------------------------------------------- | ---------------------------------------- |
| 1   | Jika total bobot kurang dari 100, bagaimana nilai akhir dihitung/ditampilkan? | Perhitungan nilai dan kelulusan       |
| 2   | PG kompleks menggunakan kecocokan persis atau nilai parsial?                   | Algoritma grading                        |
| 3   | Berapa kali peserta boleh mengulang ujian?                                 | Sesi pengerjaan management                       |
| 4   | Kapan hasil dan rincian nilai boleh dilihat peserta?                        | Visibilitas hasil                        |
| 5   | Apakah ujian tersedia melalui web saja atau juga mobile?                   | Kontrak API dan integrasi                |
| 6   | Format, ukuran maksimum, dan jumlah file jawaban?                            | File validation                          |
| 7   | Jika soal tidak boleh diubah setelah publikasi, bagaimana koreksi/kesalahan ditangani? | Lifecycle publikasi dan integritas historis |
| 8   | Peristiwa pemantauan ujian apa yang dicatat dan apakah ada konsekuensi terhadap ujian? | Business rules pemantauan ujian               |
| 9   | Apakah keluar layar penuh hanya dicatat atau memengaruhi status ujian?       | Kebijakan sesi pengerjaan                        |
| 10  | Kapan pewaktu dimulai, kapan sesi pengerjaan berakhir, dan bagaimana pengumpulan otomatis bekerja? | Timer dan pengumpulan                  |
| 11  | Apakah opsi jawaban ikut diacak, dan bagaimana urutan dipertahankan saat melanjutkan? | Penyajian soal dan melanjutkan             |
| 12  | Apakah fase penelitian memerlukan login/enrollment LMS atau cukup data uji dan integrasi terdokumentasi? | Batas penelitian dan otorisasi |


---

# 18. Batas Keberhasilan Tahap Ini

Target utama pengembangan adalah menghasilkan backend CBT yang dapat digunakan secara independen melalui REST API.

Tahap ini tidak menargetkan penyelesaian antarmuka pengguna atau integrasi visual antarmuka frontend.

Keberhasilan tahap ini dibuktikan melalui:

- Endpoint yang berfungsi.
- Database dan relasi yang konsisten.
- Proses bisnis yang tervalidasi.
- Pengujian API.
- Dokumentasi API.
- Bukti integrasi dengan backend Ucademy.

Dengan tercapainya target tersebut, backend CBT dinyatakan siap menjadi fondasi integrasi antarmuka frontend Ucademy.

---

**Dokumen ini merupakan PRD khusus pengembangan REST API CBT mandiri oleh Irgi Febryansyah sebagai bagian dari penelitian skripsi. Seluruh implementasi harus mengacu pada kebutuhan yang telah dikonfirmasi dan hasil audit repositori backend Ucademy.**