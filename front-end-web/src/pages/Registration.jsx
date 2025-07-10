import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import BrandLogo from '../components/BrandLogo';
import kantorBPS from '../assets/kantor-bps-3.jpg';
import AlertDialog from '../components/AlertDialog';

function Registration() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  // inisialisasikan alert
  
  const [alert, setAlert] = useState({
      isOpen: false,
      title: '',
      message: '',
      type: '',
      autoCloseDelay: 0,
      onConfirm: null,
      showCancelButton: false,
    });
  
    const closeAlert = () => {
      setAlert(prev => ({ ...prev, isOpen: false }));
    };


  const handleEmailRegistration = async (e) => {
    e.preventDefault();

    if (!email || !fullName || !password || !confirmPassword) {
      // Tampilkan alert jika ada bidang yang kosong
      setAlert({
        isOpen: true,
        title: 'Peringatan',
        message: 'Mohon lengkapi semua bidang.',
        type: 'warning',
        autoCloseDelay: 3000,
        onConfirm: closeAlert,
        showCancelButton: false,  
      });

      // alert('Mohon lengkapi semua bidang.');
      return;
    }

    if (password !== confirmPassword) {
      // Tampilkan alert jika konfirmasi password tidak cocok
      setAlert({
        isOpen: true,
        title: 'Peringatan',
        message: 'Konfirmasi password tidak cocok.',
        type: 'error',
        autoCloseDelay: 3000,
        onConfirm: closeAlert,
        showCancelButton: false,  
      });

      // alert('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Tampilkan alert sukses
        setAlert({
          isOpen: true,
          title: 'Berhasil',
          message: 'Registrasi berhasil! Silakan login.',
          type: 'success',
          onConfirm: () => {  
            closeAlert();
            navigate('/login'); 
          },
          showCancelButton: false,
          autoCloseDelay: 0,
        });
        // alert('Registrasi berhasil! Silakan login.');
        // navigate('/login');
      } else {
        // Tampilkan alert gagal
        setAlert({
          isOpen: true,
          title: 'Gagal',
          message: data?.message || 'Registrasi gagal.',
          type: 'error',
          autoCloseDelay: 3000,
          onConfirm: closeAlert,
          showCancelButton: false,
        });
        // alert(data?.message || 'Registrasi gagal.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      // Tampilkan alert jika terjadi kesalahan
      setAlert({
        isOpen: true,
        title: 'Kesalahan',
        message: 'Terjadi kesalahan saat registrasi.',
        type: 'error',
        autoCloseDelay: 3000,
        onConfirm: closeAlert,
        showCancelButton: false,
      });
      // alert('Terjadi kesalahan saat registrasi.');
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{
        backgroundImage: `url(${kantorBPS})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: -1
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-45 backdrop-blur-sm"></div>
      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md relative">
        
        {/* Tombol Kembali */}
        <a href="/" className="absolute top-4 left-4 text-gray-600 hover:text-bps-blue transition-colors duration-200">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
        </a>

        <div className="text-center mb-8 mt-4">
          <div className="container mx-auto flex justify-center text-left">
            <a href="/"><BrandLogo textClassName="text-xl" /></a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Daftar Akun Baru</h2>
        </div>

        <form onSubmit={handleEmailRegistration}>
          <div className="mb-4">
            <label htmlFor="regEmail" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="regEmail"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="regName" className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap:</label>
            <input
              type="text"
              id="regName"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="regPassword" className="block text-gray-700 text-sm font-bold mb-2">Kata Sandi:</label>
            <input
              type="password"
              id="regPassword"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Kata Sandi:</label>
            <input
              type="password"
              id="confirmPassword"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
          >
            Daftar
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">ATAU</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="mb-6 flex justify-center">
          <button
            onClick={handleGoogleRegister}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:shadow-md"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google Logo"
              className="w-5 h-5 mr-2"
            />
            Daftar dengan Google
          </button>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Sudah punya akun?{' '}
          <a href="/login" className="text-bps-blue hover:underline font-semibold">
            Masuk
          </a>
        </p>
      </div>
      <AlertDialog
      isOpen={alert.isOpen}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      autoCloseDelay={alert.autoCloseDelay}
      onConfirm={alert.onConfirm}
      showCancelButton={alert.showCancelButton}
      onClose={closeAlert}
    />
    </div>
    
  );
}

export default Registration;
