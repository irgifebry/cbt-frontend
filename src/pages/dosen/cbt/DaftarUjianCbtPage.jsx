import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, FilePenLine, Loader2, Plus, Settings2, Users } from 'lucide-react';
import { cbtAdapter } from '../../../services/cbt/index.js';

// Identitas contoh untuk sisi CBT: login web dosen tetap memakai mekanisme yang ada.
const ID_INSTRUKTUR = 'instruktur-contoh-1';

const LABEL_STATUS = {
  draft: 'Draf',
  published: 'Dipublikasikan',
};

const tautan = (path, icon, label) => (
  <Link
    to={path}
    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default function DaftarUjianCbtPage() {
  const [daftarUjian, setDaftarUjian] = useState([]);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    cbtAdapter
      .listAssessments({ idInstruktur: ID_INSTRUKTUR })
      .then((data) => {
        if (masihTerpasang) setDaftarUjian(data);
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
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <header className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#167A61]/10 rounded-xl flex items-center justify-center text-[#167A61]">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-[19px] font-extrabold text-[#1E293B]">
              Daftar Ujian CBT
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Kelola ujian, soal, dan pantau pengerjaan peserta.
            </p>
          </div>
        </div>
        <Link
          to="/dosen/cbt/ujian/baru/edit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] transition-colors w-fit"
        >
          <Plus size={15} />
          Buat ujian baru
        </Link>
      </header>

      {memuat ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#167A61]" />
          <p className="text-[13px] text-gray-400">Memuat daftar ujian...</p>
        </div>
      ) : gagal ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Daftar ujian tidak dapat dimuat.
          </p>
        </div>
      ) : daftarUjian.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Belum ada ujian untuk instruktur ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {daftarUjian.map((ujian) => (
            <article
              key={ujian.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      ujian.status === 'published'
                        ? 'bg-[#167A61]/10 text-[#167A61]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {LABEL_STATUS[ujian.status] ?? ujian.status}
                  </span>
                  <h2 className="text-[16px] font-bold text-[#1E293B] mt-2">
                    {ujian.judul}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tautan(
                    `/dosen/cbt/ujian/${ujian.id}/edit`,
                    <FilePenLine size={14} />,
                    'Ubah ujian',
                  )}
                  {tautan(
                    `/dosen/cbt/ujian/${ujian.id}/soal`,
                    <Settings2 size={14} />,
                    'Kelola soal',
                  )}
                  {tautan(
                    `/dosen/cbt/ujian/${ujian.id}/attempt`,
                    <Users size={14} />,
                    'Pemantauan pengerjaan',
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
