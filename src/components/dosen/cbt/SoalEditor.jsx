const TIPE_SOAL = [
  { value: 'pilihan_tunggal', label: 'Pilihan tunggal' },
  { value: 'pilihan_ganda', label: 'Pilihan ganda' },
  { value: 'esai', label: 'Esai' },
  { value: 'document_upload', label: 'Unggah dokumen' },
];

const OPSI_AWAL = [
  { id: 'A', teks: '' },
  { id: 'B', teks: '' },
  { id: 'C', teks: '' },
  { id: 'D', teks: '' },
];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] disabled:bg-gray-50 disabled:text-gray-500';

/**
 * Editor satu soal untuk instruktur. Mendukung empat tipe soal dan kunci
 * jawaban. Tidak ada penilaian otomatis: kunci hanya disimpan sebagai field.
 */
export default function SoalEditor({ soal, onChange, readOnly = false }) {
  const opsi = Array.isArray(soal.opsi) ? soal.opsi : OPSI_AWAL;
  const memakaiOpsi =
    soal.tipe === 'pilihan_tunggal' || soal.tipe === 'pilihan_ganda';

  const ubah = (field, nilai) => onChange({ ...soal, [field]: nilai });

  const ubahOpsi = (id, teks) => {
    const daftar = opsi.some((item) => item.id === id)
      ? opsi.map((item) => (item.id === id ? { ...item, teks } : item))
      : [...opsi, { id, teks }];
    onChange({ ...soal, opsi: daftar });
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
      <div>
        <label
          htmlFor="tipe-soal"
          className="block text-[13px] font-semibold text-[#1E293B] mb-2"
        >
          Tipe soal
        </label>
        <select
          id="tipe-soal"
          value={soal.tipe}
          disabled={readOnly}
          onChange={(event) => ubah('tipe', event.target.value)}
          className={inputClass}
        >
          {TIPE_SOAL.map((tipe) => (
            <option key={tipe.value} value={tipe.value}>
              {tipe.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="pertanyaan-soal"
          className="block text-[13px] font-semibold text-[#1E293B] mb-2"
        >
          Pertanyaan
        </label>
        <textarea
          id="pertanyaan-soal"
          value={soal.pertanyaan ?? ''}
          disabled={readOnly}
          onChange={(event) => ubah('pertanyaan', event.target.value)}
          rows={4}
          placeholder="Tuliskan pertanyaan di sini..."
          className={inputClass}
        />
      </div>

      {memakaiOpsi && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold text-[#1E293B]">Opsi jawaban</p>
          {OPSI_AWAL.map((opsiAwal) => (
            <div key={opsiAwal.id} className="flex items-center gap-3">
              <span className="w-7 text-[13px] font-bold text-gray-400">
                {opsiAwal.id}.
              </span>
              <input
                type="text"
                aria-label={`Opsi ${opsiAwal.id}`}
                value={
                  opsi.find((item) => item.id === opsiAwal.id)?.teks ?? ''
                }
                disabled={readOnly}
                onChange={(event) => ubahOpsi(opsiAwal.id, event.target.value)}
                placeholder={`Teks opsi ${opsiAwal.id}`}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}

      <div>
        <label
          htmlFor="kunci-soal"
          className="block text-[13px] font-semibold text-[#1E293B] mb-2"
        >
          Kunci jawaban
        </label>
        <input
          id="kunci-soal"
          type="text"
          value={soal.kunci ?? ''}
          disabled={readOnly}
          onChange={(event) => ubah('kunci', event.target.value)}
          placeholder="Misalnya A untuk pilihan tunggal"
          className={inputClass}
        />
        <p className="text-[12px] text-gray-400 mt-2">
          Kunci disimpan untuk instruktur dan tidak dikirim ke tampilan peserta.
        </p>
      </div>
    </section>
  );
}
