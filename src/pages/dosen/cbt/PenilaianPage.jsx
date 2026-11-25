import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, Save } from 'lucide-react';
import { cbtAdapter } from '../../../services/cbt/index.js';

const TIPE_MANUAL = ['esai', 'document_upload', 'unggah'];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61]';

export default function PenilaianPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [nilai, setNilai] = useState({});
  const [statusNilai, setStatusNilai] = useState({});
  const [validasiNilai, setValidasiNilai] = useState({});
  const [soalDiproses, setSoalDiproses] = useState(null);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    cbtAdapter
      .getAttempt({ idAttempt: id })
      .then((data) => {
        if (masihTerpasang) setAttempt(data);
      })
      .catch(() => {
        if (masihTerpasang) setGagal(true);
      })
      .finally(() => {
        if (masihTerpasang) setMuat(false);
      });

    return () => {
      masihTerpasang = false;
    };
  }, [id]);

  const daftarSoalManual = (attempt?.soal ?? []).filter((soal) =>
    TIPE_MANUAL.includes(soal.tipe),
  );

  const simpan = async (idSoal) => {
    if (soalDiproses) return;
    const mentah = nilai[idSoal];
    const angka = Number(mentah);
    if (mentah == null || String(mentah).trim() === '' || !Number.isFinite(angka)) {
      setValidasiNilai((sebelumnya) => ({
        ...sebelumnya,
        [idSoal]: 'Nilai harus diisi dengan angka.',
      }));
      setStatusNilai((sebelumnya) => ({ ...sebelumnya, [idSoal]: null }));
      return;
    }

    setValidasiNilai((sebelumnya) => ({ ...sebelumnya, [idSoal]: null }));
    setSoalDiproses(idSoal);
    setStatusNilai((sebelumnya) => ({ ...sebelumnya, [idSoal]: null }));
    try {
      await cbtAdapter.saveGrade({
        idAttempt: id,
        idSoal,
        nilai: angka,
      });
      setStatusNilai((sebelumnya) => ({ ...sebelumnya, [idSoal]: 'tersimpan' }));
    } catch {
      setStatusNilai((sebelumnya) => ({ ...sebelumnya, [idSoal]: 'gagal' }));
    } finally {
      setSoalDiproses(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Link
        to="/dosen/cbt/ujian"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#167A61] hover:underline w-fit"
      >
        <ArrowLeft size={15} />
        Kembali ke daftar ujian
      </Link>

      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-[#167A61]/10 rounded-xl flex items-center justify-center text-[#167A61]">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold text-[#1E293B]">
            Penilaian Manual
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {attempt?.judul ?? 'Pengerjaan'}
          </p>
        </div>
      </header>

      {memuat ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#167A61]" />
          <p className="text-[13px] text-gray-400">Memuat pengerjaan...</p>
        </div>
      ) : gagal || !attempt ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Pengerjaan tidak dapat ditampilkan.
          </p>
        </div>
      ) : daftarSoalManual.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Tidak ada soal esai atau unggah dokumen pada pengerjaan ini.
          </p>
        </div>
      ) : (
        <>
          <p className="text-[13px] text-gray-500">
            Nilai hanya diisi untuk soal esai dan unggah dokumen. Tidak ada
            penilaian otomatis untuk soal pilihan ganda.
          </p>

          {daftarSoalManual.map((soal) => (
            <section
              key={soal.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4"
            >
              <div>
                <span className="px-2 py-0.5 bg-[#167A61]/10 text-[#167A61] rounded text-[11px] font-bold">
                  Soal {soal.nomor}
                </span>
                <p className="text-[14px] font-semibold text-[#1E293B] mt-3 leading-relaxed">
                  {soal.pertanyaan}
                </p>
                <p className="text-[13px] text-gray-500 mt-2">
                  Jawaban:{' '}
                  {soal.jawabanTersimpan instanceof File
                    ? soal.jawabanTersimpan.name
                    : typeof soal.jawabanTersimpan === 'string' &&
                        soal.jawabanTersimpan.length > 0
                      ? soal.jawabanTersimpan
                      : 'Belum ada jawaban tersimpan.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="sm:w-40">
                  <label
                    htmlFor={`nilai-${soal.id}`}
                    className="block text-[12px] font-semibold text-gray-500 mb-2"
                  >
                    Nilai
                  </label>
                  <input
                    id={`nilai-${soal.id}`}
                    type="number"
                    value={nilai[soal.id] ?? ''}
                    aria-invalid={Boolean(validasiNilai[soal.id])}
                    onChange={(event) => {
                      setNilai((sebelumnya) => ({
                        ...sebelumnya,
                        [soal.id]: event.target.value,
                      }));
                      setValidasiNilai((sebelumnya) => ({
                        ...sebelumnya,
                        [soal.id]: null,
                      }));
                    }}
                    placeholder="0"
                    className={inputClass}
                  />
                  {validasiNilai[soal.id] && (
                    <p
                      role="alert"
                      className="text-[12px] font-semibold text-red-600 mt-2"
                    >
                      {validasiNilai[soal.id]}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => simpan(soal.id)}
                  disabled={soalDiproses === soal.id}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] disabled:opacity-60 transition-colors w-fit"
                >
                  <Save size={15} />
                  Simpan nilai
                </button>
                {statusNilai[soal.id] && (
                  <p
                    role="status"
                    className={`text-[13px] font-semibold ${
                      statusNilai[soal.id] === 'gagal'
                        ? 'text-red-600'
                        : 'text-[#167A61]'
                    }`}
                  >
                    {statusNilai[soal.id] === 'gagal'
                      ? 'Nilai gagal disimpan.'
                      : 'Nilai tersimpan.'}
                  </p>
                )}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
