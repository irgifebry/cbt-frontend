/**
 * Pemeta peristiwa proctoring murni: hanya mencatat, tanpa peringatan,
 * penghentian, pengurangan nilai, jaringan, atau konsekuensi apa pun.
 */
export function toProctorEvent(input) {
  if (input?.type === 'visibilitychange' && input.hidden === true) {
    return { tipe: 'tab_hidden', waktu: input.waktu };
  }

  if (input?.type === 'fullscreenchange' && input.fullscreen === false) {
    return { tipe: 'fullscreen_exit', waktu: input.waktu };
  }

  if (input?.type === 'blur') {
    return { tipe: 'window_blur', waktu: input.waktu };
  }

  return null;
}

// Hanya label tampilan. Daftar peristiwa yang wajib dicatat dan konsekuensinya
// masih menunggu Q08/Q09, sehingga pemetaan ini tidak menetapkan aturan apa pun.
const LABEL_PERISTIWA = {
  tab_hidden: 'Halaman tidak terlihat',
  fullscreen_exit: 'Keluar dari layar penuh',
  window_blur: 'Fokus jendela hilang',
};

export function labelPeristiwaProctor(tipe) {
  return LABEL_PERISTIWA[tipe] ?? tipe;
}
