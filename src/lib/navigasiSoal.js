/**
 * Tombol pengumpulan sengaja hanya tersedia pada soal terakhir, sehingga
 * peserta melangkah lewat "Selanjutnya" sampai akhir sebelum mengumpulkan.
 * Ini murni aturan tampilan; tidak mengubah status attempt atau aturan Q10.
 *
 * @param {number} indeksSoal indeks soal yang sedang dibuka (mulai dari 0)
 * @param {number} jumlahSoal jumlah seluruh soal pada ujian
 * @returns {boolean}
 */
export function tampilkanTombolKumpulkan(indeksSoal, jumlahSoal) {
  if (!Number.isInteger(indeksSoal) || !Number.isInteger(jumlahSoal)) {
    return false;
  }
  if (jumlahSoal <= 0 || indeksSoal < 0) {
    return false;
  }
  return indeksSoal === jumlahSoal - 1;
}
