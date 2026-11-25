import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Clock, Loader2 } from 'lucide-react';
import { cbtAdapter } from '../../services/cbt/index.js';

// Identitas contoh untuk fase mandiri CBT (belum ada login LMS di sisi ini).
const ID_PESERTA = 'peserta-contoh-1';

const LABEL_STATUS = {
  berjalan: 'Berjalan',
  selesai: 'Selesai',
};

export default function DaftarUjianPage() {
  const [daftarUjian, setDaftarUjian] = useState([]);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    cbtAdapter
      .listAttempts({ idPeserta: ID_PESERTA })
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
    <div className="min-h-screen bg-[#F4F7F6] px-5 py-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="bg-white rounded-2xl shadow-sm border border-gray-100 px-7 py-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#167A61]/10 rounded-xl flex items-center justify-center text-[#167A61]">
            <ClipboardList size={24} />
          </div>
          <div>
            <h1 className="text-[19px] font-extrabold text-[#1E293B]">
              Daftar Ujian CBT
            </h1>
            <p className="text-[13px] text-gray-500 mt-1">
              Pilih ujian yang sedang berjalan untuk mulai mengerjakan.
            </p>
          </div>
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
              Belum ada ujian untuk peserta ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {daftarUjian.map((ujian) => (
              <article
                key={ujian.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        ujian.status === 'berjalan'
                          ? 'bg-[#167A61]/10 text-[#167A61]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {LABEL_STATUS[ujian.status] ?? ujian.status}
                    </span>
                  </div>
                  <h2 className="text-[16px] font-bold text-[#1E293B]">
                    {ujian.judul}
                  </h2>
                  <p className="text-[12px] text-gray-500 mt-2 flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    Batas waktu: {new Date(ujian.batasWaktu).toLocaleString('id-ID')}
                  </p>
                </div>

                {ujian.status === 'berjalan' ? (
                  <Link
                    to={`/cbt/attempt/${ujian.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] transition-colors"
                  >
                    Kerjakan
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <span className="text-[12px] text-gray-400">
                    Ujian telah selesai
                  </span>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
