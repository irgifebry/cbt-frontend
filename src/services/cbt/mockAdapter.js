// Data contoh untuk alur peserta CBT. Field `kunci` sengaja disimpan di sumber
// agar pengujian bisa memastikan kunci tidak pernah dikirim ke peserta.
const SOAL = [
  {
    id: 'soal-1',
    nomor: 1,
    tipe: 'pilihan_tunggal',
    pertanyaan: 'Manakah yang merupakan contoh struktur data bertipe LIFO?',
    opsi: [
      { id: 'A', teks: 'Stack' },
      { id: 'B', teks: 'Queue' },
      { id: 'C', teks: 'Array' },
      { id: 'D', teks: 'Pohon' },
    ],
    jawabanTersimpan: null,
    kunci: 'A',
  },
  {
    id: 'soal-2',
    nomor: 2,
    tipe: 'esai',
    pertanyaan: 'Jelaskan secara singkat perbedaan antara proses dan thread.',
    opsi: [],
    jawabanTersimpan: null,
    kunci: 'Proses adalah unit eksekusi mandiri, sedangkan thread adalah unit terkecil di dalam proses.',
  },
  {
    id: 'soal-3',
    nomor: 3,
    tipe: 'unggah',
    pertanyaan: 'Unggah bukti penyelesaian tugas dalam format PDF.',
    opsi: [],
    jawabanTersimpan: null,
    kunci: 'bukti-penyelesaian.pdf',
  },
];

const ATTEMPTS_AWAL = [
  {
    id: 'attempt-1',
    idAssessment: 'asesmen-1',
    judul: 'Ujian Tengah Semester Pemrograman',
    status: 'berjalan',
    batasWaktu: '2026-11-25T23:59:59.000Z',
    sisaDetik: 3600,
    idPeserta: 'peserta-contoh-1',
    soal: SOAL,
  },
  {
    id: 'attempt-2',
    idAssessment: 'asesmen-2',
    judul: 'Kuis Pengantar Basis Data',
    status: 'selesai',
    batasWaktu: '2026-11-20T12:00:00.000Z',
    sisaDetik: 0,
    idPeserta: 'peserta-contoh-1',
    soal: SOAL,
  },
];

const KUNCI_STATE = 'cbt-mock-state-v1';
const ID_INSTRUKTUR_CONTOH = 'instruktur-contoh-1';
const PESAN_SOAL_PUBLISHED = 'Soal tidak dapat diubah setelah ujian dipublikasikan';

// Salinan penuh agar state awal tidak pernah berbagi referensi dengan data contoh.
const salin = (nilai) => JSON.parse(JSON.stringify(nilai));

const stateAwal = () => ({
  attempts: salin(ATTEMPTS_AWAL),
  proctorEvents: [],
  asesmen: [
    {
      id: 'asesmen-1',
      judul: 'Ujian Tengah Semester Pemrograman',
      idInstruktur: ID_INSTRUKTUR_CONTOH,
      status: 'draft',
      soal: [],
    },
    {
      id: 'asesmen-2',
      judul: 'Kuis Pengantar Basis Data',
      idInstruktur: ID_INSTRUKTUR_CONTOH,
      status: 'draft',
      soal: [],
    },
  ],
  nomorAsesmenBerikutnya: 3,
});

// State contoh dipertahankan saat halaman dimuat ulang agar demonstrasi tidak
// kehilangan ujian/jawaban. sessionStorage sengaja dipakai (bukan localStorage)
// agar data contoh tidak menempel antar tab/sesi yang berbeda.
const muatState = () => {
  if (typeof sessionStorage === 'undefined') return stateAwal();

  try {
    const mentah = sessionStorage.getItem(KUNCI_STATE);
    if (!mentah) return stateAwal();

    const data = JSON.parse(mentah);
    const sah =
      Array.isArray(data.attempts) &&
      Array.isArray(data.proctorEvents) &&
      Array.isArray(data.asesmen) &&
      Number.isInteger(data.nomorAsesmenBerikutnya);
    return sah ? data : stateAwal();
  } catch {
    return stateAwal();
  }
};

let state = muatState();

const simpanState = () => {
  if (typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.setItem(KUNCI_STATE, JSON.stringify(state));
  } catch {
    // Penyimpanan penuh/terkunci: state tetap hidup di memori untuk sesi ini.
  }
};

const dapatAsesmen = (id) => state.asesmen.find((asesmen) => asesmen.id === id);

// Salinan mandiri untuk `opsi`: perubahan pada objek yang dikirim pemanggil
// tidak boleh diam-diam mengubah soal yang sudah tersimpan.
const salinSoal = (soal) => ({
  ...soal,
  opsi: Array.isArray(soal.opsi)
    ? soal.opsi.map((opsi) => ({ ...opsi }))
    : soal.opsi,
});

// Membangun payload soal secara eksplisit: hanya field yang boleh dilihat peserta.
const soalUntukPeserta = (soal) => ({
  id: soal.id,
  nomor: soal.nomor,
  tipe: soal.tipe,
  pertanyaan: soal.pertanyaan,
  opsi: soal.opsi,
  jawabanTersimpan: soal.jawabanTersimpan,
});

export const mockAdapter = {
  /** @param {{ idPeserta: string }} params */
  listAttempts: async ({ idPeserta }) =>
    state.attempts
      .filter((attempt) => attempt.idPeserta === idPeserta)
      .map(({ id, judul, status, batasWaktu }) => ({
        id,
        judul,
        status,
        batasWaktu,
      })),

  /** @param {{ idAttempt: string }} params */
  getAttempt: async ({ idAttempt }) => {
    const attempt = state.attempts.find((item) => item.id === idAttempt);
    if (!attempt) return null;

    return {
      id: attempt.id,
      judul: attempt.judul,
      sisaDetik: attempt.sisaDetik,
      soal: attempt.soal.map(soalUntukPeserta),
    };
  },

  /**
   * Menyimpan jawaban ke state contoh lalu mengonfirmasi. Tidak ada aturan
   * penilaian, retry, atau konflik yang diterapkan di sini (R08/Q01 masih terbuka).
   * @param {{ idAttempt: string, idSoal: string, jawaban: unknown, idempotencyKey: string }} params
   */
  saveAnswer: async ({ idAttempt, idSoal, jawaban }) => {
    const attempt = state.attempts.find((item) => item.id === idAttempt);
    const soal = attempt?.soal.find((item) => item.id === idSoal);

    if (soal) {
      soal.jawabanTersimpan = jawaban;
      simpanState();
    }

    return { tersimpan: true, waktu: new Date().toISOString() };
  },

  /** @param {{ idAttempt: string }} params */
  submitAttempt: async ({ idAttempt }) => {
    const attempt = state.attempts.find((item) => item.id === idAttempt);
    if (attempt && attempt.status !== 'selesai') {
      attempt.status = 'selesai';
      simpanState();
    }

    return { id: idAttempt, status: 'selesai', waktu: new Date().toISOString() };
  },

  /** @param {{ idAttempt: string }} params */
  listProctorEvents: async ({ idAttempt }) =>
    state.proctorEvents.filter((event) => event.idAttempt === idAttempt),

  /** @param {{ idAttempt: string, tipe: string, waktu: string }} params */
  sendProctorEvent: async ({ idAttempt, tipe, waktu }) => {
    const event = { idAttempt, tipe, waktu };
    state.proctorEvents.push(event);
    simpanState();
    return { ...event, tersimpan: true };
  },

  /** @param {{ idInstruktur: string }} params */
  listAssessments: async ({ idInstruktur }) =>
    state.asesmen
      .filter((asesmen) => asesmen.idInstruktur === idInstruktur)
      .map(({ id, judul, status }) => ({ id, judul, status })),

  /** @param {{ judul: string, idInstruktur?: string }} payload */
  createAssessment: async (payload) => {
    const id = `asesmen-${state.nomorAsesmenBerikutnya++}`;
    state.asesmen.push({
      id,
      judul: payload.judul,
      idInstruktur: payload.idInstruktur ?? ID_INSTRUKTUR_CONTOH,
      status: 'draft',
      soal: [],
    });
    simpanState();
    return { id, judul: payload.judul, status: 'draft' };
  },

  /** @param {{ idAssessment: string, soal: object }} params */
  saveQuestion: async ({ idAssessment, soal }) => {
    const asesmen = dapatAsesmen(idAssessment);
    if (!asesmen) throw new Error('Ujian tidak ditemukan');
    if (asesmen.status === 'published') throw new Error(PESAN_SOAL_PUBLISHED);

    const id = soal.id || globalThis.crypto.randomUUID();
    const soalTersimpan = salinSoal({ ...soal, id });
    const indeks = asesmen.soal.findIndex((item) => item.id === id);
    if (indeks === -1) asesmen.soal.push(soalTersimpan);
    else asesmen.soal[indeks] = soalTersimpan;
    simpanState();
    return salinSoal(soalTersimpan);
  },

  /** @param {{ idAssessment: string }} params */
  publishAssessment: async ({ idAssessment }) => {
    const asesmen = dapatAsesmen(idAssessment);
    if (asesmen) {
      asesmen.status = 'published';
      simpanState();
    }
    return { id: idAssessment, status: 'published' };
  },

  /** @param {{ idAssessment: string }} params */
  listAttemptsInstruktur: async ({ idAssessment }) =>
    state.attempts
      .filter((attempt) => attempt.idAssessment === idAssessment)
      .map(({ id, idPeserta, status }) => ({ id, idPeserta, status })),

  /** @param {{ idAttempt: string, idSoal: string, nilai: unknown }} params */
  saveGrade: async () => ({ tersimpan: true }),
};
