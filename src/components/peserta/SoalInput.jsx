import { normalisasiJawaban } from '../../lib/jawabanUpload.js';

const LABEL_TIPE = {
  pilihan_tunggal: 'Pilihan tunggal',
  pilihan_ganda: 'Pilihan ganda',
  esai: 'Esai',
  document_upload: 'Unggah dokumen',
  // Adapter contoh memakai 'unggah' untuk tipe unggah dokumen.
  unggah: 'Unggah dokumen',
};

/**
 * Penangkap jawaban untuk empat tipe soal. Tidak ada penilaian, kunci jawaban,
 * atau validasi format/ukuran berkas — semua keputusan itu masih menunggu.
 */
export default function SoalInput({ soal, jawaban, onChange }) {
  const tipe = soal?.tipe;
  const opsi = Array.isArray(soal?.opsi) ? soal.opsi : [];
  const namaBerkas =
    jawaban instanceof File
      ? jawaban.name
      : typeof jawaban === 'string'
        ? jawaban
        : null;

  const pilihGanda = (idOpsi) => {
    const terpilih = Array.isArray(jawaban) ? jawaban : [];
    onChange(
      terpilih.includes(idOpsi)
        ? terpilih.filter((id) => id !== idOpsi)
        : [...terpilih, idOpsi],
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 bg-[#167A61]/10 text-[#167A61] rounded text-[11px] font-bold">
          Soal {soal?.nomor}
        </span>
        <span className="text-[11px] font-semibold text-gray-400">
          {LABEL_TIPE[tipe] ?? 'Tipe tidak dikenali'}
        </span>
      </div>

      <p className="text-[15px] font-semibold text-[#1E293B] leading-relaxed mb-5">
        {soal?.pertanyaan}
      </p>

      {tipe === 'pilihan_tunggal' && (
        <div
          role="radiogroup"
          aria-label={`Pilihan jawaban soal ${soal?.nomor}`}
          className="flex flex-col gap-2"
        >
          {opsi.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                jawaban === item.id
                  ? 'border-[#167A61] bg-[#167A61]/5'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`jawaban-${soal.id}`}
                value={item.id}
                checked={jawaban === item.id}
                onChange={() => onChange(item.id)}
                className="accent-[#167A61]"
              />
              <span className="text-[13px] text-[#1E293B]">
                <span className="font-bold mr-2">{item.id}.</span>
                {item.teks}
              </span>
            </label>
          ))}
        </div>
      )}

      {tipe === 'pilihan_ganda' && (
        <div
          role="group"
          aria-label={`Pilihan jawaban soal ${soal?.nomor}`}
          aria-describedby={`bantuan-${soal?.id}`}
          className="flex flex-col gap-2"
        >
          {opsi.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                value={item.id}
                checked={Array.isArray(jawaban) && jawaban.includes(item.id)}
                onChange={() => pilihGanda(item.id)}
                className="accent-[#167A61]"
              />
              <span className="text-[13px] text-[#1E293B]">
                <span className="font-bold mr-2">{item.id}.</span>
                {item.teks}
              </span>
            </label>
          ))}
          <p id={`bantuan-${soal?.id}`} className="text-[12px] text-gray-400 mt-1">
            Pilih satu atau lebih jawaban.
          </p>
        </div>
      )}

      {tipe === 'esai' && (
        <textarea
          aria-label={`Jawaban esai soal ${soal?.nomor}`}
          value={typeof jawaban === 'string' ? jawaban : ''}
          onChange={(event) => onChange(event.target.value)}
          rows={6}
          placeholder="Tuliskan jawaban Anda di sini..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] resize-y"
        />
      )}

      {(tipe === 'document_upload' || tipe === 'unggah') && (
        <div className="flex flex-col gap-2">
          <input
            type="file"
            aria-label={`Berkas jawaban soal ${soal?.nomor}`}
            onChange={(event) => onChange(normalisasiJawaban(event.target.files?.[0] ?? null))}
            className="text-[13px] text-[#1E293B] file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#167A61] file:text-white file:cursor-pointer"
          />
          {namaBerkas && (
            <p className="text-[12px] text-gray-500">
              Berkas dipilih: <span className="font-semibold">{namaBerkas}</span>
            </p>
          )}
        </div>
      )}

      {tipe !== 'pilihan_tunggal' &&
        tipe !== 'pilihan_ganda' &&
        tipe !== 'esai' &&
        tipe !== 'document_upload' &&
        tipe !== 'unggah' && (
          <p className="text-[13px] text-gray-400">
            Tipe soal ini belum didukung tampilan peserta.
          </p>
        )}
    </section>
  );
}
