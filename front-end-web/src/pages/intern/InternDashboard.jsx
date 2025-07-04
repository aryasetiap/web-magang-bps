import React from 'react';
import { useNavigate } from 'react-router-dom';

function InternDashboard() {
  const navigate = useNavigate();

  const goToBiodata = () => {
    navigate('/dashboard/biodata');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">Selamat Datang di Dashboard Peserta Magang!</h2>
      <p className="text-gray-700 mb-6">
        Di sini kamu dapat melihat ringkasan aktivitas magang kamu di BPS Kab. Pringsewu.
      </p>

      <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Panduan Awal: Lengkapi Biodata Diri</h3>
        <p className="text-blue-700">
          Sebelum memulai, pastikan kamu telah melengkapi semua informasi biodata diri agar kami dapat memproses data magangmu dengan benar.
        </p>
        <button
          onClick={goToBiodata}
          className="mt-4 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Lengkapi Biodata Sekarang
        </button>
      </div>

      {/* Anda bisa menambahkan widget lain di sini nanti, contoh: */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
          <h4 className="font-semibold text-green-800">Tugas Terbaru</h4>
          <p className="text-gray-600">Belum ada tugas baru.</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
          <h4 className="font-semibold text-yellow-800">Status Presensi Hari Ini</h4>
          <p className="text-gray-600">Belum presensi masuk.</p>
        </div>
      </div> */}
    </div>
  );
}

export default InternDashboard;