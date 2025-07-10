import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h2 className="text-6xl font-bold text-bps-blue mb-4">404</h2>
        <h3 className="text-3xl font-semibold text-gray-800 mb-4">Halaman Tidak Ditemukan</h3>
        <p className="text-gray-600 mb-6">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin URL salah atau halaman telah dihapus.
        </p>
        <Link
          to="/"
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;