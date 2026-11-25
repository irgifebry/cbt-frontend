import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  autosaveReducer,
  createAutosaveState,
  flushAntrean,
} from '../lib/autosave.js';
import { cbtAdapter } from '../services/cbt/index.js';

const JEDA_SIMPAN_MS = 800;

/**
 * Autosave dengan debounce per soal: jawaban satu soal tidak pernah menimpa
 * antrean soal lain. Kunci idempotensi dibuat sekali per pasangan idSoal+attempt
 * dan dipakai ulang oleh simpan maupun cobaLagi. Tidak ada retry terjadual:
 * status 'gagal' hanya diubah oleh cobaLagi.
 */
export function useAutoSave({ idAttempt }) {
  const [state, dispatch] = useReducer(autosaveReducer, undefined, createAutosaveState);
  const kunciPerSoal = useRef(new Map());
  const menungguPerSoal = useRef(new Map());
  const pengirimanAktif = useRef(new Set());

  const dapatkanKunci = useCallback(
    (idSoal) => {
      if (!kunciPerSoal.current.has(idSoal)) {
        kunciPerSoal.current.set(idSoal, `cbt:${idAttempt}:${idSoal}`);
      }
      return kunciPerSoal.current.get(idSoal);
    },
    [idAttempt],
  );

  const kirim = useCallback(
    ({ idSoal, jawaban }) => {
      const tugas = (async () => {
        try {
          const hasil = await cbtAdapter.saveAnswer({
            idAttempt,
            idSoal,
            jawaban,
            idempotencyKey: dapatkanKunci(idSoal),
          });
          dispatch({ type: 'SAVE_OK', waktu: hasil.waktu });
          return true;
        } catch {
          dispatch({ type: 'SAVE_FAIL' });
          return false;
        }
      })();

      pengirimanAktif.current.add(tugas);
      return tugas.finally(() => {
        pengirimanAktif.current.delete(tugas);
      });
    },
    [dapatkanKunci, idAttempt],
  );

  const simpan = useCallback(
    ({ idSoal, jawaban }) => {
      const menunggu = menungguPerSoal.current;
      const sebelumnya = menunggu.get(idSoal);
      if (sebelumnya) clearTimeout(sebelumnya.timer);

      dispatch({ type: 'SAVE_START' });
      const payload = { idSoal, jawaban };
      const timer = setTimeout(() => {
        menunggu.delete(idSoal);
        kirim(payload);
      }, JEDA_SIMPAN_MS);
      menunggu.set(idSoal, { timer, payload });
    },
    [kirim],
  );

  const flush = useCallback(
    () =>
      flushAntrean({
        menunggu: menungguPerSoal.current,
        aktif: pengirimanAktif.current,
        kirim,
      }),
    [kirim],
  );

  const cobaLagi = useCallback(
    ({ idSoal, jawaban }) => {
      const menunggu = menungguPerSoal.current;
      const tertunda = menunggu.get(idSoal);
      if (tertunda) {
        clearTimeout(tertunda.timer);
        menunggu.delete(idSoal);
      }
      dispatch({ type: 'RETRY' });
      return kirim({ idSoal, jawaban });
    },
    [kirim],
  );

  useEffect(() => {
    const menunggu = menungguPerSoal.current;
    kunciPerSoal.current.clear();
    return () => {
      menunggu.forEach(({ timer }) => clearTimeout(timer));
      menunggu.clear();
    };
  }, [idAttempt]);

  return {
    status: state.status,
    waktuTersimpan: state.waktuTersimpan,
    simpan,
    cobaLagi,
    flush,
  };
}
