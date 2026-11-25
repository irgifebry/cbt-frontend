import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, Save, Settings2 } from 'lucide-react';
import SoalEditor from '../../../components/dosen/cbt/SoalEditor.jsx';
import { cbtAdapter } from '../../../services/cbt/index.js';

const ID_INSTRUKTUR = 'instruktur-contoh-1';
const PESAN_READ_ONLY = 'Soal tidak dapat diubah setelah ujian dipublikasikan';

const SOAL_AWAL = {
  nomor: 1,
  tipe: 'pilihan_tunggal',
  pertanyaan: '',
  opsi: [
    { id: 'A', teks: '' },
    { id: 'B', teks: '' },
    { id: 'C', teks: '' },
    { id: 'D', teks: '' },
  ],
  kunci: '',
};

export default function EditorSoalPage() {
  const { id } = useParams();
  const [status, setStatus] = useState(null);
  const [soal, setSoal] = useState(SOAL_AWAL);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [menyimpan, setMenyimpan] = useState(false);

  useEffect(() => {
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

  const published = status === 'published';

  const simpan = async () => {
    if (published || menyimpan) return;
    // Editor ini belum memiliki daftar soal atau identitas soal yang sedang
    // disunting: setiap kali tombol Simpan ditekan, soal disimpan sebagai
    // entri baru dengan id unik.
    const soalSimpan = { ...soal, id: globalThis.crypto.randomUUID() };
    setMenyimpan(true);
    setPesan(null);
    try {
      const tersimpan = await cbtAdapter.saveQuestion({
        idAssessment: id,
        soal: soalSimpan,
      });
      setPesan({
        tipe: 'sukses',
        teks: `Soal ${tersimpan.id} tersimpan.`,
      });
    } catch (error) {
      setPesan({
        tipe: 'gagal',
        teks: error?.message ?? 'Soal gagal disimpan.',
      });
    } finally {
      setMenyimpan(false);
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
          <Settings2 size={24} />
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold text-[#1E293B]">
            Editor Soal
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">Ujian {id}</p>
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
            <div
              role="status"
              className="flex items-center gap-2 px-5 py-4 rounded-2xl bg-[#167A61]/10 border border-[#167A61]/20 text-[#167A61]"
            >
              <Lock size={16} />
              <p className="text-[13px] font-semibold">{PESAN_READ_ONLY}</p>
            </div>
          )}

          <SoalEditor
            soal={soal}
            onChange={setSoal}
            readOnly={published}
          />

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
            <button
              type="button"
              onClick={simpan}
              disabled={menyimpan}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] disabled:opacity-60 transition-colors w-fit"
            >
              <Save size={15} />
              {menyimpan ? 'Menyimpan...' : 'Simpan soal'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
