import React from 'react';
import { Link } from 'react-router-dom';

function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full">
        <h2 className="text-6xl font-bold text-orange-600 mb-4">403</h2>
        <h3 className="text-3xl font-semibold text-gray-800 mb-4">Akses Ditolak</h3>
        <p className="text-gray-600 mb-6">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
        </p>
        <Link
          to="/login"
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Kembali ke Halaman Login
        </Link>
      </div>
    </div>
  );
}

export default ForbiddenPage;