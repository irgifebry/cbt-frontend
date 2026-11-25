import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  FileText,
  History,
  Loader2,
  Users,
} from 'lucide-react';
import { cbtAdapter } from '../../../services/cbt/index.js';

const ID_INSTRUKTUR = 'instruktur-contoh-1';

const LABEL_STATUS = {
  berjalan: 'Berjalan',
  selesai: 'Selesai',
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

export default function MonitoringAttemptPage() {
  const { id } = useParams();
  const [judulUjian, setJudulUjian] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    Promise.all([
      cbtAdapter.listAssessments({ idInstruktur: ID_INSTRUKTUR }),
      cbtAdapter.listAttemptsInstruktur({ idAssessment: id }),
    ])
      .then(([daftarUjian, daftarAttempt]) => {
        if (!masihTerpasang) return;
        setJudulUjian(
          daftarUjian.find((ujian) => ujian.id === id)?.judul ?? null,
        );
        setAttempts(daftarAttempt);
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
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold text-[#1E293B]">
            Pemantauan Pengerjaan
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {judulUjian ?? `Ujian ${id}`}
          </p>
        </div>
      </header>

      {memuat ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#167A61]" />
          <p className="text-[13px] text-gray-400">Memuat pengerjaan...</p>
        </div>
      ) : gagal ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Daftar pengerjaan tidak dapat dimuat.
          </p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Belum ada pengerjaan untuk ujian ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {attempts.map((attempt, indeks) => (
            <article
              key={attempt.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    attempt.status === 'berjalan'
                      ? 'bg-[#167A61]/10 text-[#167A61]'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {LABEL_STATUS[attempt.status] ?? attempt.status}
                </span>
                <h2 className="text-[15px] font-bold text-[#1E293B] mt-2">
                  Pengerjaan {indeks + 1}
                </h2>
                <p className="text-[12px] text-gray-500 mt-1">
                  Peserta: {attempt.idPeserta}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tautan(
                  `/dosen/cbt/attempt/${attempt.id}/proctor`,
                  <History size={14} />,
                  'Riwayat proktor',
                )}
                {tautan(
                  `/dosen/cbt/attempt/${attempt.id}/nilai`,
                  <FileText size={14} />,
                  'Penilaian',
                )}
              </div>
            </article>
          ))}
          <p className="text-[12px] text-gray-400 flex items-center gap-1.5">
            <ClipboardCheck size={14} />
            Riwayat proktor hanya mencatat peristiwa, tanpa tindakan otomatis.
          </p>
        </div>
      )}
    </div>
  );
}
