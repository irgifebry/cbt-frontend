export const PESAN_GAGAL_CBT = 'Gagal terhubung ke layanan CBT';

/**
 * Memetakan error dari cbt-api ke bentuk { message, status } yang dipakai UI.
 * Pesan dari server hanya dipakai bila berupa string; selain itu memakai pesan default.
 */
export function mapCbtError(error) {
  const status = error?.response?.status;
  const pesanServer = error?.response?.data?.message;

  return {
    message: typeof pesanServer === 'string' ? pesanServer : PESAN_GAGAL_CBT,
    status: typeof status === 'number' ? status : null,
  };
}
