import React from 'react';

function AdminDashboard() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">Selamat Datang di Dashboard Admin!</h2>
      <p className="text-gray-700 mb-6">
        Di sini Anda dapat mengelola seluruh aspek sistem manajemen magang.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contoh Widget/Informasi Cepat */}
        <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-lg text-blue-800">Pendaftar Baru</h3>
          <p className="text-2xl font-bold text-blue-700">12</p>
          <p className="text-sm text-gray-600">Perlu diverifikasi</p>
        </div>
        <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h3 className="font-semibold text-lg text-green-800">Peserta Aktif</h3>
          <p className="text-2xl font-bold text-green-700">35</p>
          <p className="text-sm text-gray-600">Sedang magang</p>
        </div>
        <div className="p-5 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
          <h3 className="font-semibold text-lg text-yellow-800">Tugas Belum Dinilai</h3>
          <p className="text-2xl font-bold text-yellow-700">7</p>
          <p className="text-sm text-gray-600">Menunggu review</p>
        </div>
        {/* Tambahkan widget lain sesuai kebutuhan */}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Panduan Cepat Admin:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Gunakan "Manajemen Akun" untuk menambahkan atau mengelola Staff dan Koordinator.</li>
          <li>Cek "Manajemen Pendaftar" untuk memverifikasi calon peserta magang.</li>
          <li>"Monitoring Peserta" memberikan gambaran presensi dan logbook harian semua peserta.</li>
          <li>Atur periode pendaftaran dan kuota di "Pengaturan Sistem".</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;