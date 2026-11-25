/**
 * Komponen hasil disiapkan tetapi sengaja TIDAK didaftarkan sebagai route:
 * aturan visibilitas hasil (Q04) belum diputuskan. Tidak ada nilai maupun
 * kunci jawaban yang ditampilkan di sini.
 */
export default function HasilUjianPage({ waktu }) {
  return (
    <div className="min-h-screen bg-[#F4F7F6] px-5 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
        <h1 className="text-[18px] font-extrabold text-[#1E293B]">
          Pengumpulan ujian
        </h1>
        <p className="text-[13px] text-gray-500 mt-2">
          Jawaban Anda telah dikumpulkan. Hasil belum tersedia.
        </p>
        {waktu && (
          <p className="text-[12px] text-gray-400 mt-4">
            Waktu pengumpulan: {new Date(waktu).toLocaleString('id-ID')}
          </p>
        )}
      </div>
    </div>
  );
}
