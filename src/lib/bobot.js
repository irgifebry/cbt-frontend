const PESAN_BOBOT_MELEBIH_100 = 'Total bobot tidak boleh lebih dari 100';
const PESAN_BOBOT_NEGATIF = 'Bobot tidak boleh negatif';
const PESAN_BOBOT_TIDAK_ANGKA = 'Bobot harus berupa angka';

/**
 * Memvalidasi bobot tiap soal dan totalnya. Bobot harus berupa angka hingga
 * dan tidak boleh negatif; total di atas 100 ditolak. Total di bawah 100
 * diterima apa adanya (tidak dinormalisasi).
 *
 * @param {Array<{ bobot: number }>} soal
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validasiBobot(soal) {
  for (const item of soal) {
    const bobot = item?.bobot;
    if (typeof bobot !== 'number' || !Number.isFinite(bobot)) {
      return { valid: false, errors: [PESAN_BOBOT_TIDAK_ANGKA] };
    }
    if (bobot < 0) {
      return { valid: false, errors: [PESAN_BOBOT_NEGATIF] };
    }
  }

  const total = soal.reduce((akumulasi, item) => akumulasi + item.bobot, 0);

  if (total > 100) {
    return { valid: false, errors: [PESAN_BOBOT_MELEBIH_100] };
  }

  return { valid: true, errors: [] };
}
