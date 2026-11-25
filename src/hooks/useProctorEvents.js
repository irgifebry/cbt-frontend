import { useEffect } from 'react';
import { toProctorEvent } from '../lib/proctorEvents.js';
import { cbtAdapter } from '../services/cbt/index.js';

/**
 * Mencatat peristiwa browser generik hanya saat aktif === true.
 * Tidak ada peringatan, penghentian ujian, atau pengurangan nilai.
 */
export function useProctorEvents({ idAttempt, aktif }) {
  useEffect(() => {
    if (aktif !== true) return undefined;

    const catat = async (input) => {
      const peristiwa = toProctorEvent(input);
      if (!peristiwa) return;

      try {
        await cbtAdapter.sendProctorEvent({ idAttempt, ...peristiwa });
      } catch {
        // Pencatatan bersifat best-effort dan tidak berdampak pada peserta.
      }
    };

    const onVisibilityChange = () =>
      catat({
        type: 'visibilitychange',
        hidden: document.hidden,
        waktu: new Date().toISOString(),
      });

    const onFullscreenChange = () =>
      catat({
        type: 'fullscreenchange',
        fullscreen: Boolean(document.fullscreenElement),
        waktu: new Date().toISOString(),
      });

    const onBlur = () =>
      catat({ type: 'blur', waktu: new Date().toISOString() });

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [aktif, idAttempt]);
}
