import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  Send,
} from 'lucide-react';
import SoalInput from '../../components/peserta/SoalInput.jsx';
import { useAutoSave } from '../../hooks/useAutoSave.js';
import { useProctorEvents } from '../../hooks/useProctorEvents.js';
import { cbtAdapter } from '../../services/cbt/index.js';

const LABEL_STATUS = {
  idle: 'Belum ada jawaban yang dikirim',
  menyimpan: 'Menyimpan…',
  tersimpan: 'Tersimpan',
  gagal: 'Gagal tersimpan',
};

function formatSisaWaktu(detik) {
  const jam = Math.floor(detik / 3600);
  const menit = Math.floor((detik % 3600) / 60);
  const d = detik % 60;
  return [jam, menit, d].map((nilai) => String(nilai).padStart(2, '0')).join(':');
}

export default function PengerjaanUjianPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);
  const [aktif, setAktif] = useState(false);
  const [indeksSoal, setIndeksSoal] = useState(0);
  const [jawaban, setJawaban] = useState({});
  const [terakhir, setTerakhir] = useState(null);
  const [sedangMengumpulkan, setSedangMengumpulkan] = useState(false);
  const [selesai, setSelesai] = useState(null);
  const [pesanGagalKumpulkan, setPesanGagalKumpulkan] = useState(null);

  const { status, waktuTersimpan, simpan, cobaLagi, flush } = useAutoSave({
    idAttempt: id,
  });
  useProctorEvents({ idAttempt: id, aktif: aktif && !selesai });

  useEffect(() => {
    let masihTerpasang = true;

    cbtAdapter
      .getAttempt({ idAttempt: id })
      .then((data) => {
        if (!masihTerpasang) return;
        setAttempt(data);
        if (!data) return;

        const awal = {};
        data.soal.forEach((soal) => {
          awal[soal.id] = soal.jawabanTersimpan ?? null;
        });
        setJawaban(awal);
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

  const mulaiUjian = () => {
    // Penolakan fullscreen tidak menghentikan ujian dan tidak dicatat.
    if (typeof document.documentElement.requestFullscreen === 'function') {
      document.documentElement
        .requestFullscreen()
        .catch(() => {
          // Ujian tetap berjalan tanpa fullscreen.
        });
    }
    setAktif(true);
  };

  const ubahJawaban = (idSoal, nilai) => {
    setJawaban((sebelumnya) => ({ ...sebelumnya, [idSoal]: nilai }));
    setTerakhir({ idSoal, jawaban: nilai });
    simpan({ idSoal, jawaban: nilai });
  };

  const kumpulkan = async () => {
    if (sedangMengumpulkan || selesai) return;
    setSedangMengumpulkan(true);
    setPesanGagalKumpulkan(null);
    try {
      try {
        await flush();
      } catch {
        setPesanGagalKumpulkan(
          'Jawaban belum berhasil disimpan. Pengumpulan dibatalkan. Silakan coba lagi.',
        );
        return;
      }

      const hasil = await cbtAdapter.submitAttempt({ idAttempt: id });
      setSelesai(hasil);
    } catch {
      setPesanGagalKumpulkan('Pengumpulan gagal. Silakan coba lagi.');
    } finally {
      setSedangMengumpulkan(false);
    }
  };

  const daftarSoal = attempt?.soal ?? [];
  const soalSekarang = daftarSoal[indeksSoal];

  return (
    <div className="min-h-screen bg-[#F4F7F6] px-5 py-10">
      <div className="max-w-3xl mx-auto flex flex-col gap-5">
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
          <>
            <header className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-[18px] font-extrabold text-[#1E293B]">
                  {attempt.judul}
                </h1>
                <p className="text-[12px] text-gray-500 mt-1">
                  {daftarSoal.length} soal
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#167A61]/10 text-[#167A61]">
                <Clock size={16} />
                <span className="text-[13px] font-bold">
                  Sisa waktu: {formatSisaWaktu(attempt.sisaDetik)}
                </span>
              </div>
            </header>

            {!aktif ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex flex-col gap-5">
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Ujian akan ditampilkan dalam mode layar penuh bila browser
                  mengizinkan. Jika tidak, Anda tetap dapat mengerjakan ujian.
                </p>
                <button
                  type="button"
                  onClick={mulaiUjian}
                  className="w-fit px-6 py-3 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] transition-colors"
                >
                  Mulai
                </button>
              </div>
            ) : selesai ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 text-center">
                <p className="text-[16px] font-bold text-[#167A61]">
                  Jawaban berhasil dikumpulkan.
                </p>
                <p className="text-[13px] text-gray-500 mt-2">
                  Waktu pengumpulan: {new Date(selesai.waktu).toLocaleString('id-ID')}
                </p>
              </div>
            ) : (
              <>
                <nav className="flex flex-wrap gap-2" aria-label="Navigasi soal">
                  {daftarSoal.map((soal, indeks) => (
                    <button
                      key={soal.id}
                      type="button"
                      onClick={() => setIndeksSoal(indeks)}
                      aria-current={indeks === indeksSoal ? 'step' : undefined}
                      className={`w-9 h-9 rounded-lg text-[12px] font-bold transition-colors ${
                        indeks === indeksSoal
                          ? 'bg-[#167A61] text-white'
                          : jawaban[soal.id] != null
                            ? 'bg-[#167A61]/10 text-[#167A61]'
                            : 'bg-white text-gray-500 border border-gray-200'
                      }`}
                    >
                      {soal.nomor}
                    </button>
                  ))}
                </nav>

                {soalSekarang ? (
                  <SoalInput
                    soal={soalSekarang}
                    jawaban={jawaban[soalSekarang.id]}
                    onChange={(nilai) => ubahJawaban(soalSekarang.id, nilai)}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 text-center text-[13px] text-gray-500">
                    Tidak ada soal pada ujian ini.
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div aria-live="polite" className="text-[13px]">
                    <span
                      className={`font-bold ${
                        status === 'gagal' ? 'text-red-600' : 'text-[#167A61]'
                      }`}
                    >
                      {LABEL_STATUS[status] ?? status}
                    </span>
                    {status === 'tersimpan' && waktuTersimpan && (
                      <span className="ml-2 text-gray-400">
                        {new Date(waktuTersimpan).toLocaleTimeString('id-ID')}
                      </span>
                    )}
                    {status === 'gagal' && terakhir && (
                      <button
                        type="button"
                        onClick={() => cobaLagi(terakhir)}
                        className="ml-3 underline font-semibold text-red-600 hover:text-red-700"
                      >
                        Coba lagi
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIndeksSoal((n) => Math.max(0, n - 1))}
                      disabled={indeksSoal === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ArrowLeft size={14} />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setIndeksSoal((n) => Math.min(daftarSoal.length - 1, n + 1))
                      }
                      disabled={indeksSoal >= daftarSoal.length - 1}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                    >
                      Selanjutnya
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={kumpulkan}
                      disabled={sedangMengumpulkan}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#167A61] text-white text-[13px] font-bold hover:bg-[#0E5C46] disabled:opacity-60"
                    >
                      <Send size={14} />
                      Kumpulkan
                    </button>
                  </div>
                </div>

                {pesanGagalKumpulkan && (
                  <p role="alert" className="text-[13px] text-red-600 text-right">
                    {pesanGagalKumpulkan}
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
