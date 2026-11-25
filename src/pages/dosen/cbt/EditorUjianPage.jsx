import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FilePenLine, Loader2, Lock, Save, Send } from 'lucide-react';
import { validasiBobot } from '../../../lib/bobot.js';
import { cbtAdapter } from '../../../services/cbt/index.js';

const ID_INSTRUKTUR = 'instruktur-contoh-1';
const ID_BARU = 'baru';

const FORM_AWAL = {
  judul: '',
  deskripsi: '',
  instruksi: '',
  referensiKursus: 'Pemrograman Dasar (kursus contoh)',
};

const BOBOT_AWAL = [
  { id: 'contoh-1', pertanyaan: 'Contoh soal 1', bobot: 60 },
  { id: 'contoh-2', pertanyaan: 'Contoh soal 2', bobot: 40 },
];

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[13px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#167A61] disabled:bg-gray-50 disabled:text-gray-500';

export default function EditorUjianPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const modeBaru = id === ID_BARU;

  const [form, setForm] = useState(FORM_AWAL);
  const [bobot, setBobot] = useState(BOBOT_AWAL);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState([]);
  const [pesan, setPesan] = useState(null);
  const [memuat, setMuat] = useState(!modeBaru);
  const [gagal, setGagal] = useState(false);
  const [menyimpan, setMenyimpan] = useState(false);
  const [mempublikasikan, setMempublikasikan] = useState(false);

  useEffect(() => {
    if (modeBaru) return undefined;

    let masihTerpasang = true;
    cbtAdapter
      .listAssessments({ idInstruktur: ID_INSTRUKTUR })
      .then((daftar) => {
        if (!masihTerpasang) return;
        const ujian = daftar.find((item) => item.id === id);
        if (!ujian) {
          setGagal(true);
          return;
        }
        setStatus(ujian.status);
        setForm((sebelumnya) => ({ ...sebelumnya, judul: ujian.judul }));
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
  }, [id, modeBaru]);

  const published = status === 'published';
  const totalBobot = bobot.reduce(
    (total, row) => total + Number(row.bobot || 0),
    0,
  );

  const ubahForm = (field, nilai) =>
    setForm((sebelumnya) => ({ ...sebelumnya, [field]: nilai }));

  const ubahBobot = (idSoal, field, nilai) =>
    setBobot((sebelumnya) =>
      sebelumnya.map((row) =>
        row.id === idSoal ? { ...row, [field]: nilai } : row,
      ),
    );

  const simpan = async () => {
    // Ujian yang sudah ada belum bisa diperbarui: adapter belum memiliki
    // kontrak pembaruan ujian, dan saveQuestion menimpa objek soal utuh.
    if (!modeBaru || published || menyimpan) return;

    const hasil = validasiBobot(
      bobot.map((row) => ({ bobot: Number(row.bobot) })),
    );
    if (!hasil.valid) {
      setErrors(hasil.errors);
      setPesan(null);
      return;
    }
    setErrors([]);
    setPesan(null);
    setMenyimpan(true);

    try {
      const asesmen = await cbtAdapter.createAssessment({
        judul: form.judul.trim() || 'Ujian baru',
        idInstruktur: ID_INSTRUKTUR,
      });
      navigate(`/dosen/cbt/ujian/${asesmen.id}/edit`, { replace: true });
    } catch (error) {
      setPesan({
        tipe: 'gagal',
        teks: error?.message ?? 'Ujian gagal disimpan.',
      });
    } finally {
      setMenyimpan(false);
    }
  };

  const publikasikan = async () => {
    if (modeBaru || published || mempublikasikan) return;
    setMempublikasikan(true);
    setPesan(null);
    try {
      const hasil = await cbtAdapter.publishAssessment({ idAssessment: id });
      setStatus(hasil.status);
      setPesan({
        tipe: 'sukses',
        teks: 'Ujian dipublikasikan. Soal tidak dapat diubah.',
      });
    } catch (error) {
      setPesan({
        tipe: 'gagal',
        teks: error?.message ?? 'Ujian gagal dipublikasikan.',
      });
    } finally {
      setMempublikasikan(false);
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
          <FilePenLine size={24} />
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold text-[#1E293B]">
            {modeBaru ? 'Buat Ujian Baru' : 'Editor Ujian'}
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {modeBaru
              ? 'Isi informasi ujian dan bobot tiap soal.'
              : `Ujian ${id}`}
          </p>
        </div>
      </header>

      {memuat ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#167A61]" />
          <p className="text-[13px] text-gray-400">Memuat ujian...</p>
        </div>
      ) : gagal ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Ujian tidak ditemukan atau tidak dapat dimuat.
          </p>
        </div>
      ) : (
        <>
          {published && (
            <div className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#167A61]/10 border border-[#167A61]/20 text-[#167A61]">
              <Lock size={16} />
              <p className="text-[13px] font-semibold">
                Ujian telah dipublikasikan. Form tidak dapat diubah.
              </p>
            </div>
          )}

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <label
                htmlFor="judul-ujian"
                className="block text-[13px] font-semibold text-[#1E293B] mb-2"
              >
                Judul ujian
              </label>
              <input
                id="judul-ujian"
                type="text"
                value={form.judul}
                disabled={published}
                onChange={(event) => ubahForm('judul', event.target.value)}
                placeholder="Misalnya Ujian Tengah Semester"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="deskripsi-ujian"
                className="block text-[13px] font-semibold text-[#1E293B] mb-2"
              >
                Deskripsi
              </label>
              <textarea
                id="deskripsi-ujian"
                value={form.deskripsi}
                disabled={published}
                onChange={(event) => ubahForm('deskripsi', event.target.value)}
                rows={3}
                placeholder="Deskripsi singkat ujian..."
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="instruksi-ujian"
                className="block text-[13px] font-semibold text-[#1E293B] mb-2"
              >
                Instruksi
              </label>
              <textarea
                id="instruksi-ujian"
                value={form.instruksi}
                disabled={published}
                onChange={(event) => ubahForm('instruksi', event.target.value)}
                rows={3}
                placeholder="Instruksi untuk peserta..."
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="referensi-kursus"
                className="block text-[13px] font-semibold text-[#1E293B] mb-2"
              >
                Referensi kursus contoh
              </label>
              <input
                id="referensi-kursus"
                type="text"
                value={form.referensiKursus}
                disabled={published}
                onChange={(event) =>
                  ubahForm('referensiKursus', event.target.value)
                }
                className={inputClass}
              />
            </div>

            <p className="text-[12px] text-gray-400">
              Deskripsi, instruksi, dan referensi kursus belum memiliki kontrak
              penyimpanan. Saat membuat ujian baru, hanya judul yang tersimpan;
              bobot dan field lainnya tidak disimpan.
            </p>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-[#1E293B]">
                Bobot per soal
              </h2>
              <span className="text-[13px] font-semibold text-gray-500">
                Total bobot: <span className="text-[#1E293B]">{totalBobot}</span>
              </span>
            </div>

            {bobot.map((row, indeks) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
              >
                <div>
                  <label
                    htmlFor={`pertanyaan-${row.id}`}
                    className="block text-[12px] font-semibold text-gray-500 mb-2"
                  >
                    Soal {indeks + 1}
                  </label>
                  <input
                    id={`pertanyaan-${row.id}`}
                    type="text"
                    value={row.pertanyaan}
                    disabled={published}
                    onChange={(event) =>
                      ubahBobot(row.id, 'pertanyaan', event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`bobot-${row.id}`}
                    className="block text-[12px] font-semibold text-gray-500 mb-2"
                  >
                    Bobot
                  </label>
                  <input
                    id={`bobot-${row.id}`}
                    type="number"
                    min="0"
                    value={row.bobot}
                    disabled={published}
                    onChange={(event) =>
                      ubahBobot(row.id, 'bobot', event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
            <p className="text-[12px] text-gray-400">
              Nilai di atas adalah contoh dan belum dibaca dari adapter. Total
              lebih dari 100 ditolak saat membuat ujian baru; total di bawah 100
              tidak dinormalisasi.
            </p>
          </section>

          {errors.length > 0 && (
            <ul
              role="alert"
              className="bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-[13px] font-semibold text-red-600 list-disc list-inside"
            >
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          {pesan && (
            <p
              role="status"
              className={`text-[13px] font-semibold ${
                pesan.tipe === 'gagal' ? 'text-red-600' : 'text-[#167A61]'
              }`}
            >
              {pesan.teks}
            </p>
          )}

          {!published && (
            <div className="flex flex-col gap-3">
              {!modeBaru && (
                <p className="text-[13px] text-gray-500">
                  Ujian yang sudah ada belum dapat diperbarui karena kontrak
                  pembaruan ujian belum tersedia. Tombol simpan dinonaktifkan.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={simpan}
                  disabled={menyimpan || !modeBaru}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] disabled:opacity-60 transition-colors"
                >
                  <Save size={15} />
                  {menyimpan ? 'Menyimpan...' : 'Simpan ujian'}
                </button>
                {!modeBaru && (
                  <button
                    type="button"
                    onClick={publikasikan}
                    disabled={mempublikasikan}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#167A61] text-[#167A61] text-[13px] font-bold hover:bg-[#167A61]/5 disabled:opacity-60 transition-colors"
                  >
                    <Send size={15} />
                    Publikasikan ujian
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
