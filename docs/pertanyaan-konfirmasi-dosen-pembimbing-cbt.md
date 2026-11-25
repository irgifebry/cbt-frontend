# Catatan dan Pertanyaan untuk Konsultasi CBT

## Topik skripsi: API CBT untuk U-Cademy

**Nama:** __________________________  **Tanggal konsultasi:** ______________

---

## Arahan dosen yang sudah ada

- Fokus skripsi: **CBT untuk ujian/penilaian peserta U-Cademy**.
- Satu ujian boleh memuat campuran soal pilihan ganda, pilihan ganda dengan banyak jawaban, esai, dan unggah dokumen.
- Setiap soal memiliki bobot tersendiri. Dosen menentukan bobotnya.
- Soal dibuat secara manual oleh pengajar, dan pengajar menentukan bobot setiap soal.
- Satu ujian boleh memadukan soal pilihan ganda, pilihan ganda dengan banyak jawaban, esai, dan unggah dokumen.
- Total bobot soal maksimal 100.
- Ujian perlu memiliki pengaturan waktu.
- Urutan soal diacak.
- Jawaban disimpan otomatis sesering mungkin; arahan dalam catatan adalah jawaban langsung disimpan setiap kali peserta mengisinya.
- CBT perlu menggunakan proctoring.
- Apakah peserta mengakses CBT melalui situs web atau perangkat seluler masih perlu ditanyakan kepada Pak Fitrah.
- Tahap awal pengembangan berfokus pada REST API backend, belum membuat frontend CBT.
- Setiap perubahan kode API harus disertai dokumentasi lengkap yang diperbarui agar sesuai dengan implementasi.

## Rencana yang ingin dikonfirmasi

Saya berencana membuat API CBT di aplikasi dan database terpisah terlebih dahulu, menggunakan data contoh. Login LMS dan koneksi ke data peserta/kursus U-Cademy dibuat belakangan. Tahap ini berfokus pada API dan belum membuat tampilan ujian.

---

## Pertanyaan yang masih perlu dibahas

> **Catatan:** Contoh jawaban di bawah hanya usulan saya untuk memulai diskusi. Contoh tersebut belum menjadi keputusan dosen.

### 1. Apakah API CBT boleh dibuat terpisah terlebih dahulu dan diuji dengan data contoh?

Saya ingin memastikan batas skripsi: apakah cukup membuat dan menguji API secara mandiri, lalu integrasi login dan data U-Cademy menjadi pekerjaan berikutnya?

**Contoh yang bisa saya sampaikan:** “Pak/Bu, saya berencana membuat API CBT dan databasenya secara terpisah terlebih dahulu agar fitur ujian dapat dikembangkan dan diuji. Pada tahap awal saya menggunakan data contoh. Integrasi ke akun dan data U-Cademy akan saya dokumentasikan sebagai tahap berikutnya. Apakah pendekatan ini boleh untuk skripsi saya?”

**Jawaban/catatan dosen:** _____________________________________

### 2. Ujian sebaiknya dikaitkan dengan kursus atau jadwal kursus?

Di U-Cademy terdapat data kursus dan jadwal pelaksanaan kursus. Untuk API CBT mandiri, ID mana yang sebaiknya digunakan sebagai penanda kursus?

**Contoh yang bisa saya sampaikan:** “Untuk sementara saya ingin menggunakan ID kursus contoh saja, tanpa mengambil data langsung dari database LMS. Nanti saat integrasi, ID ini akan dihubungkan ke data U-Cademy. Apakah ini sudah tepat, atau sebaiknya menggunakan ID jadwal kursus?”

**Jawaban/catatan dosen:** _____________________________________

### 3. Apakah skripsi cukup sampai API saja, atau perlu menyertakan tampilan ujian?

Saya juga perlu memastikan apakah ujian nantinya ditujukan untuk situs web, perangkat seluler, atau keduanya. Catatan sebelumnya menyebutkan bahwa hal ini perlu ditanyakan kepada Pak Fitrah.

**Contoh yang bisa saya sampaikan:** “Dalam PRD, fokus saya adalah membuat REST API, belum UI ujian. Saya dapat menunjukkan alurnya melalui Postman dan dokumentasi API. Apakah itu cukup untuk skripsi, dan apakah CBT nantinya lebih diarahkan untuk situs web, perangkat seluler, atau keduanya?”

**Jawaban/catatan dosen:** _____________________________________

### 4. Bagaimana cara memberi nilai untuk soal pilihan ganda dengan banyak jawaban?

- **Pencocokan tepat (exact match):** peserta harus memilih semua jawaban benar dan tidak memilih jawaban salah untuk mendapatkan nilai.
- **Nilai sebagian (partial credit):** jika sebagian pilihan benar, peserta masih dapat memperoleh sebagian nilai. Perlu ditentukan juga apakah pilihan yang salah mengurangi nilai.

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan menggunakan pencocokan tepat terlebih dahulu, Pak/Bu: jika pilihan peserta sama persis dengan kunci, peserta mendapat nilai penuh; jika tidak, nilainya nol untuk soal tersebut. Aturannya lebih sederhana dan mudah diuji. Apakah Bapak/Ibu setuju?”

**Pilihan/catatan dosen:** _____________________________________

Jika memilih nilai sebagian, aturan untuk jawaban yang salah: _______

### 5. Jika total bobot soal kurang dari 100, bagaimana nilai akhir dihitung?

Contoh: total bobot soal 80, peserta mendapat 60 poin. Apakah nilai yang ditampilkan tetap 60 atau diubah menjadi 75 karena 60 dari 80?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan nilai tetap 60, tidak diubah menjadi 75. Jadi, nilai yang diperoleh langsung mengikuti total bobot soal. Apakah cara ini benar?”

**Jawaban/catatan dosen:** _____________________________________

### 6. Berapa kali peserta boleh mengikuti ujian?

Jawaban peserta disimpan otomatis setiap kali diisi. Jika koneksi terputus, peserta dapat kembali dan melanjutkan attempt yang sama dari jawaban terakhir yang tersimpan, selama waktu ujian belum habis.

**Contoh yang bisa saya sampaikan:** “Jawaban peserta akan tersimpan otomatis. Jika koneksi terputus, peserta dapat masuk kembali dan melanjutkan ujian yang sama. Untuk jumlah kesempatan, saya mengusulkan satu kali attempt. Apakah jumlah attempt ini sudah sesuai?”

**Batas percobaan:** ___________________________________________

### 7. Bagaimana sebaiknya urutan soal diacak?

Catatan dosen menyebutkan bahwa soal diacak, tetapi belum menjelaskan apakah yang diacak hanya urutan soal atau termasuk urutan pilihan jawaban.

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan agar urutan soal diacak untuk setiap peserta. Apakah pilihan jawaban juga perlu diacak? Jika peserta membuka kembali ujian setelah koneksi terputus, urutannya tetap sama agar tidak membingungkan.”

**Arahan dosen:**
- [ ] Acak urutan soal saja
- [ ] Acak urutan soal dan pilihan jawaban
- [ ] Lainnya: _________________________________________________

### 8. Kapan peserta boleh melihat hasil?

Apakah nilai langsung muncul setelah dikumpulkan, atau peserta menunggu sampai dosen selesai memeriksa esai/dokumen dan memublikasikan hasilnya?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan agar hasil baru terlihat setelah semua jawaban selesai dinilai dan dosen memublikasikan hasil. Peserta dapat melihat nilai dan umpan balik, tetapi tidak dapat melihat kunci jawaban. Apakah Bapak/Ibu setuju?”

**Jawaban/catatan dosen:** _____________________________________

### 9. Perubahan soal setelah ujian dipublikasikan

**Keputusan:** Soal tidak boleh diubah setelah ujian dipublikasikan. Aturan ini menjaga agar semua peserta mengerjakan soal yang sama.

### 10. Format file jawaban apa yang diperbolehkan, dan berapa ukuran maksimumnya?

**Contoh yang bisa saya sampaikan:** “Untuk tahap awal, saya mengusulkan agar peserta hanya dapat mengirim satu file PDF dengan ukuran maksimal 10 MB untuk setiap soal. Apakah itu cukup, atau perlu format lain seperti Word?”

**Format yang diizinkan:** ______________________________________

**Ukuran maksimum:** ______________  **Jumlah file:** ___________

### 11. Apa yang perlu dicatat oleh proctoring, dan apakah ada dampaknya terhadap ujian?

Contohnya: berpindah tab, keluar dari mode layar penuh, atau jendela kehilangan fokus. Apakah cukup jika kejadian tersebut dicatat agar dosen dapat melihat riwayatnya, atau perlu ada peringatan/ujian dihentikan setelah kejadian tertentu?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan agar sistem mencatat kejadian tersebut beserta waktunya, tetapi tidak langsung menganggap peserta berbuat curang atau mengurangi nilai. Dosen yang meninjau catatannya. Apakah itu cukup?”

**Event yang perlu dicatat:** ___________________________________

**Akibat jika ada:** ___________________________________________

### 12. Apa yang harus terjadi jika peserta keluar dari mode layar penuh?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan agar kejadian keluar dari mode layar penuh hanya dicatat. Ujian tetap berjalan dan dosen dapat melihat riwayatnya. Apakah Bapak/Ibu setuju?”

- [ ] Hanya dicatat
- [ ] Peringatan ditampilkan, ujian tetap berjalan
- [ ] Ujian otomatis dihentikan/dikumpulkan
- [ ] Lainnya: _________________________________________________

### 13. Pengujian apa yang perlu saya tunjukkan dalam skripsi?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan untuk menguji proses membuat dan memublikasikan ujian, menyimpan jawaban, mengumpulkan ujian, penilaian, timer, dan hasil. Saya juga akan menguji agar kunci jawaban tidak terlihat oleh peserta dan file unggahan divalidasi. Apakah perlu dilakukan uji beban atau integrasi dengan LMS juga?”

**Pengujian yang diminta:** ____________________________________

**Target uji beban jika diperlukan:** _________________________________

### 14. Dokumen teknis apa yang harus disertakan?

**Contoh yang bisa saya sampaikan:** “Saya mengusulkan untuk menyiapkan diagram database, dokumentasi API, koleksi Postman, panduan menjalankan API, dan hasil pengujian otomatis. Apakah ada dokumen lain yang wajib disertakan?”

**Jawaban/catatan dosen:** _____________________________________

---

## Catatan setelah konsultasi

**Keputusan utama:**

1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

**Hal yang perlu saya kerjakan berikutnya:**

1. ___________________________________________________________
2. ___________________________________________________________
