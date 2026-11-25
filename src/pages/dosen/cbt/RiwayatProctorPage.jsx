import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, History, Loader2 } from 'lucide-react';
import { cbtAdapter } from '../../../services/cbt/index.js';

export default function RiwayatProctorPage() {
  const { id } = useParams();
  const [events, setEvents] = useState([]);
  const [memuat, setMuat] = useState(true);
  const [gagal, setGagal] = useState(false);

  useEffect(() => {
    let masihTerpasang = true;

    cbtAdapter
      .listProctorEvents({ idAttempt: id })
      .then((data) => {
        if (masihTerpasang) setEvents(data);
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
          <History size={24} />
        </div>
        <div>
          <h1 className="text-[19px] font-extrabold text-[#1E293B]">
            Riwayat Proktor
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Riwayat peristiwa yang tercatat
          </p>
        </div>
      </header>

      {memuat ? (
        <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 size={28} className="animate-spin text-[#167A61]" />
          <p className="text-[13px] text-gray-400">Memuat riwayat...</p>
        </div>
      ) : gagal ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Riwayat proktor tidak dapat dimuat.
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[14px] font-semibold text-gray-600">
            Belum ada peristiwa yang tercatat.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-[12px] font-bold text-gray-500">
                  Tipe peristiwa
                </th>
                <th className="px-6 py-3 text-[12px] font-bold text-gray-500">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event, indeks) => (
                <tr key={`${event.waktu}-${indeks}`}>
                  <td className="px-6 py-4 text-[13px] text-[#1E293B]">
                    {event.tipe}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-500">
                    {new Date(event.waktu).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
