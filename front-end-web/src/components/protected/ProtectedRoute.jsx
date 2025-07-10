import React, { useState, useEffect } from 'react'; // Tambahkan useEffect
import { Navigate, useNavigate } from 'react-router-dom'; // Tambahkan useNavigate
import AlertDialog from '../AlertDialog'; // Pastikan path ini sesuai dengan struktur proyek Anda

function ProtectedRoute({ children, allowedRoles }) {
  const navigate = useNavigate(); // Inisialisasi useNavigate
  const userRole = localStorage.getItem('userRole'); // Mengambil role dari localStorage

  // State untuk AlertDialog
  const [alert, setAlert] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: '',
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });

  // Fungsi untuk menutup AlertDialog
  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  // Efek untuk menangani logika proteksi rute
  useEffect(() => {
    if (!userRole) {
      // Jika tidak ada role (belum login), langsung arahkan ke halaman login
      // Tanpa alert karena ini adalah kondisi default untuk akses yang tidak diautentikasi
      navigate('/login', { replace: true });
      return;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Jika role tidak diizinkan untuk rute ini
      setAlert({
        isOpen: true,
        title: 'Akses Ditolak!',
        message: `Role Anda (${userRole}) tidak diizinkan mengakses halaman ini.`,
        type: 'error',
        autoCloseDelay: 2000, // Tampilkan alert sebentar sebelum redirect
      });

      // Redirect setelah alert ditampilkan
      const timer = setTimeout(() => {
        navigate('/forbidden', { replace: true }); // Arahkan kembali ke login
      }, 2000); // Durasi ini harus sama dengan autoCloseDelay

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [userRole, allowedRoles, navigate]); // Dependensi useEffect

  // Jika belum ada userRole atau role tidak diizinkan, jangan render children dulu
  // Biarkan useEffect yang menangani redirect
  if (!userRole || (allowedRoles && !allowedRoles.includes(userRole))) {
    return (
      <>
        {/* Render AlertDialog di sini */}
        <AlertDialog
          isOpen={alert.isOpen}
          onClose={closeAlert}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          autoCloseDelay={alert.autoCloseDelay}
          onConfirm={alert.onConfirm}
          showCancelButton={alert.showCancelButton}
        />
        {/* Opsional: Tampilkan loading spinner atau pesan sementara */}
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">Memverifikasi akses...</p>
        </div>
      </>
    );
  }

  // Jika role diizinkan, render komponen anak (layout dashboard)
  return children;
}

export default ProtectedRoute;