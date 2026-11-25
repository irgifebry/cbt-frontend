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
