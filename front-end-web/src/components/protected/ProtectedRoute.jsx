import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  // Dalam aplikasi nyata, Anda akan mendapatkan role pengguna dari konteks autentikasi global
  // atau dari token di localStorage/sessionStorage.
  const userRole = localStorage.getItem('userRole'); // Mengambil role dari localStorage

  if (!userRole) {
    // Jika tidak ada role (belum login), arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Jika role tidak diizinkan untuk rute ini, arahkan ke halaman login atau halaman "Akses Ditolak"
    // Untuk demo, kita arahkan ke login. Di produksi, bisa ke halaman khusus "akses ditolak".
    alert(`Akses ditolak. Role Anda (${userRole}) tidak diizinkan di sini.`);
    return <Navigate to="/login" replace />;
  }

  // Jika role diizinkan, render komponen anak (layout dashboard)
  return children;
}

export default ProtectedRoute;