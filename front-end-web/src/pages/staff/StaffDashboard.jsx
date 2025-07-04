// src/pages/StaffDashboardHome.jsx
import React from 'react';

function StaffDashboard() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">Selamat Datang di Dashboard Staff BPS!</h2>
      <p className="text-gray-700 mb-6">
        Di sini Anda dapat mengelola penugasan untuk peserta magang.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contoh Widget/Informasi Cepat */}
        <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg text-blue-800">Tugas Saya yang Aktif</h3>
          <p className="text-2xl font-bold text-blue-700">5</p>
          <p className="text-sm text-gray-600">Menunggu penyelesaian dari peserta</p>
        </div>
        <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-lg text-green-800">Submission Baru</h3>
          <p className="text-2xl font-bold text-green-700">3</p>
          <p className="text-sm text-gray-600">Perlu review dan penilaian</p>
        </div>
        {/* Tambahkan widget lain sesuai kebutuhan Staff BPS */}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Panduan Cepat Staff BPS:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Gunakan "Manajemen Penugasan" untuk membuat tugas baru dan melihat progres peserta.</li>
          <li>Pastikan Anda memberikan *feedback* dan nilai untuk setiap tugas yang diselesaikan.</li>
        </ul>
      </div>
    </div>
  );
}

export default StaffDashboard;