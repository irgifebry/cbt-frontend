import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, Loader2 } from 'lucide-react';
import { cbtAdapter } from '../../services/cbt/index.js';

export default function KonfirmasiUjianPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
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

  const durasiMenit = attempt ? Math.ceil(attempt.sisaDetik / 60) : 0;

  return (
    <div className="min-h-screen bg-[#F4F7F6] px-5 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Link
          to="/cbt"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#167A61] hover:underline w-fit"
        >
          <ArrowLeft size={15} />
          Kembali ke daftar ujian
        </Link>

        {memuat ? (
          <div className="py-16 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Loader2 size={28} className="animate-spin text-[#167A61]" />
            <p className="text-[13px] text-gray-400">Memuat ujian...</p>
          </div>
        ) : gagal || !attempt ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[14px] font-semibold text-gray-600">
              Ujian tidak dapat ditampilkan.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#167A61]/10 rounded-xl flex items-center justify-center text-[#167A61]">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <h1 className="text-[19px] font-extrabold text-[#1E293B]">
                  {attempt.judul}
                </h1>
                <p className="text-[13px] text-gray-500 mt-1">
                  {attempt.soal.length} soal · Sisa waktu {durasiMenit} menit
                </p>
              </div>
            </div>

            <div className="bg-[#F4F7F6] rounded-xl p-5 text-[13px] text-gray-600 leading-relaxed">
              <p className="font-bold text-[#1E293B] mb-2">Petunjuk pengerjaan</p>
              <ul className="list-disc pl-5 flex flex-col gap-1">
                <li>Jawaban tersimpan otomatis setelah Anda berhenti mengetik.</li>
                <li>Periksa kembali jawaban sebelum tombol kumpulkan.</li>
                <li>Jangan tutup halaman ini sampai ujian selesai dikumpulkan.</li>
              </ul>
            </div>

            <Link
              to={`/cbt/attempt/${id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] transition-colors w-fit"
            >
              Lanjut ke pengerjaan
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
