# Matriks Kebutuhan CBT

Matriks ini merangkum arahan pembimbing yang telah diterima dan hal-hal yang masih perlu dikonfirmasi. Status **Sudah diarahkan** berarti terdapat catatan dosen yang mendukung kebutuhan tersebut; detail perilaku yang belum dijelaskan tidak otomatis dianggap telah disetujui.

## A. Kebutuhan yang sudah diarahkan pembimbing

| ID | Kebutuhan | Arahan yang sudah ada | Batas implementasi yang aman |
|---|---|---|---|
| CBT-R01 | Fokus sistem | CBT untuk penilaian peserta U-Cademy; penelitian berfokus pada CBT. | Jangan mengembangkan portal umum, gamifikasi evaluasi pengajar, atau sertifikat sebagai bagian dari fitur CBT. |
| CBT-R02 | Tipe soal | Satu ujian boleh memadukan pilihan ganda tunggal, pilihan ganda dengan banyak jawaban, esai, dan unggah dokumen. | Keempat tipe tersebut termasuk dalam cakupan; detail bentuk payload/API tetap perlu didokumentasikan sebelum implementasi. |
| CBT-R03 | Pembuatan soal | Soal dibuat secara manual oleh pengajar. | Jangan menganggap impor atau pembuatan soal otomatis diperlukan. Hak akses pengajar masih perlu diselaraskan dengan fase tanpa login. |
| CBT-R04 | Bobot soal | Setiap soal memiliki bobot dan pengajar menentukan pembagiannya. | Tidak ada pembagian bobot baku berdasarkan tipe soal. |
| CBT-R05 | Total bobot | Total bobot ujian maksimal 100. | Total di atas 100 dapat ditolak melalui validasi. Penanganan total di bawah 100 belum diputuskan. |
| CBT-R06 | Batas waktu | Ujian perlu memiliki pengaturan waktu. | Kebutuhan timer telah diakui; sumber waktu, batas mulai/akhir, dan perilaku saat waktu habis perlu dikonfirmasi sebelum aturannya ditetapkan. |
| CBT-R07 | Pengacakan soal | Urutan soal diacak. | Pengacakan wajib dipertimbangkan; apakah hanya urutan soal atau termasuk opsi, serta konsistensi saat melanjutkan attempt, masih perlu dipastikan. |
| CBT-R08 | Autosave | Jawaban disimpan otomatis setiap kali peserta mengisinya untuk mengurangi kehilangan jawaban saat koneksi terputus. Peserta dapat melanjutkan attempt yang sama setelah koneksi pulih. | Kebutuhan autosave dan resume telah diarahkan. Detail konfirmasi penyimpanan, retry/idempotency, batas waktu resume, dan konflik pengeditan belum ditentukan. |
| CBT-R09 | Proctoring | CBT perlu menggunakan proctoring untuk mengawasi peserta. | Kebutuhan proctoring telah ditetapkan, tetapi jenis event, batas kemampuan, penyimpanan, dan konsekuensinya belum diputuskan. Catatan aktivitas tidak boleh dinyatakan sebagai bukti pasti kecurangan. |
| CBT-R10 | Perubahan setelah publikasi | Soal tidak boleh diubah setelah ujian dipublikasikan. | Perlakukan soal ujian yang telah dipublikasikan sebagai tidak dapat diubah; proses koreksi/pembatalan atau pembuatan versi baru belum dijelaskan. |
| CBT-R11 | API-first, tanpa UI pada tahap awal | Catatan pembimbing dan PRD saat ini berfokus pada REST API backend, belum pada frontend CBT. | Bangun dan uji API; jangan menambahkan frontend CBT pada tahap ini. |
| CBT-R12 | Dokumentasi | Setiap perubahan kode perlu disertai dokumentasi lengkap yang diperbarui. | Dokumentasikan API, contoh request/response, schema bila berubah, serta cara menjalankan dan menguji bersama perubahan terkait. |

## B. Keputusan yang masih menunggu pembimbing

| ID | Pertanyaan | Mengapa dibutuhkan sebelum implementasi terkait |
|---|---|---|
| CBT-Q01 | Apakah pilihan ganda dengan banyak jawaban menggunakan pencocokan tepat (exact match) atau nilai sebagian (partial credit)? Jika menggunakan nilai sebagian, bagaimana pilihan yang salah memengaruhi nilai? | Menentukan algoritma penilaian dan pengujian penilaian. |
| CBT-Q02 | Jika total bobot kurang dari 100, apakah nilai tetap berupa jumlah poin atau dinormalisasi? | Menentukan arti nilai akhir dan perhitungan kelulusan. |
| CBT-Q03 | Berapa kali peserta boleh mencoba ujian? | Menentukan kebijakan attempt dan batasan data. |
| CBT-Q04 | Kapan peserta dapat melihat hasil, nilai per soal, umpan balik, atau kunci jawaban? | Menentukan aturan akses dan publikasi hasil. |
| CBT-Q05 | Apakah ujian diakses melalui situs web, perangkat seluler, atau keduanya? Konfirmasi yang dirujuk ditujukan kepada Pak Fitrah. | Menentukan platform yang digunakan serta kebutuhan browser/perangkat seluler, termasuk proctoring. |
| CBT-Q06 | Apa format, ukuran maksimum, dan jumlah file jawaban yang diperbolehkan? | Menentukan validasi unggahan dan kontrak API. |
| CBT-Q07 | Jika soal sudah dipublikasikan dan tidak boleh diubah, bagaimana pengajar menangani kesalahan? Apakah diperlukan mekanisme penarikan, pembatalan, atau pembuatan versi baru? | Menentukan siklus publikasi tanpa melanggar larangan perubahan soal. |
| CBT-Q08 | Event proctoring apa yang wajib dicatat, dan apakah event tersebut hanya untuk pemantauan atau memengaruhi status ujian? | Menentukan jenis event, data yang disimpan, dan dampaknya terhadap attempt. |
| CBT-Q09 | Jika peserta keluar dari mode layar penuh, apakah kejadian itu hanya dicatat, peserta diberi peringatan, atau ada tindakan lain? | Menentukan perilaku proctoring secara spesifik dan perubahan status. |
| CBT-Q10 | Untuk timer: kapan waktu mulai dihitung, apa yang terjadi ketika waktu habis, dan apakah waktu absolut jadwal berbeda dari durasi attempt? | Menentukan validasi server, kedaluwarsa, pengumpulan otomatis, dan pemulihan. |
| CBT-Q11 | Untuk pengacakan: apakah pilihan jawaban juga diacak, dan bagaimana urutan dipertahankan ketika peserta melanjutkan attempt? | Mencegah soal/opsi berubah bagi peserta setelah melanjutkan attempt dan menentukan data urutan attempt. |
| CBT-Q12 | Bagaimana identitas pengajar/peserta dan referensi kursus diperlakukan dalam penelitian mandiri, serta apakah autentikasi/enrollment LMS harus masuk dalam lingkup skripsi? | Menentukan batas integrasi, data contoh, otorisasi, dan klaim Definition of Done. |

## C. Batasan implementasi

1. Jangan membuat keputusan pada bagian B atas nama pembimbing.
2. Kebutuhan pada bagian A dapat menjadi dasar desain, tetapi detail yang dinyatakan belum jelas pada kolom batas implementasi harus ditunda sampai dikonfirmasi.
3. Untuk setiap keputusan baru, catat sumber/arahan, tanggal konfirmasi, dan perubahan pada `CBT-API.md` sebelum menetapkan implementasi yang bergantung pada keputusan tersebut.
4. API saat ini belum memiliki autentikasi produksi. Sampai mekanisme akses disetujui dan dibuat, endpoint yang mengubah data tidak boleh dianggap aman untuk deployment publik.
