/**
 * Mesin status autosave murni: tidak ada timer, jaringan, atau retry otomatis.
 * Status 'gagal' hanya berubah lewat event eksplisit, bukan transisi otomatis.
 */
export function createAutosaveState() {
  return { status: 'idle', waktuTersimpan: null };
}

export function autosaveReducer(state, event) {
  switch (event?.type) {
    case 'SAVE_START':
    case 'RETRY':
      return { ...state, status: 'menyimpan' };
    case 'SAVE_OK':
      return { status: 'tersimpan', waktuTersimpan: event.waktu };
    case 'SAVE_FAIL':
      return { ...state, status: 'gagal' };
    default:
      return state;
  }
}

/**
 * Mengosongkan antrean debounce dan menunggu semua pengiriman selesai.
 * Dipakai sebelum pengumpulan agar tidak ada jawaban yang baru ditulis setelah
 * attempt dinyatakan selesai. Timer yang masih tertunda dibatalkan, lalu
 * jawabannya dikirim segera; pengiriman yang sudah berjalan juga ikut ditunggu.
 *
 * @param {{
 *   menunggu: Map<string, {timer: unknown, payload: object}>,
 *   aktif: Set<Promise<boolean>>,
 *   kirim: (payload: object) => Promise<boolean>,
 *   hapusTimer?: (timer: unknown) => void,
 * }} params
 */
export async function flushAntrean({
  menunggu,
  aktif,
  kirim,
  hapusTimer = clearTimeout,
}) {
  const tertunda = [...menunggu.values()];
  menunggu.clear();

  const hasil = await Promise.all([
    ...tertunda.map(({ timer, payload }) => {
      hapusTimer(timer);
      return kirim(payload);
    }),
    ...aktif,
  ]);

  if (hasil.some((berhasil) => berhasil !== true)) {
    throw new Error('Jawaban belum berhasil disimpan. Pengumpulan dibatalkan.');
  }
}
