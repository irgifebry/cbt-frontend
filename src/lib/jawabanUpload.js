/**
 * Menjadikan jawaban unggah aman untuk disimpan lewat adapter dan sessionStorage.
 * Objek File tidak dapat di-JSON.stringify secara bermakna; nama berkas sudah
 * cukup untuk demo. Validasi format, ukuran, dan jumlah berkas masih menunggu Q06.
 *
 * @param {unknown} jawaban
 * @returns {unknown}
 */
export function normalisasiJawaban(jawaban) {
  if (typeof File !== 'undefined' && jawaban instanceof File) {
    return jawaban.name;
  }
  return jawaban;
}
