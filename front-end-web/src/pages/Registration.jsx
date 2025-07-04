import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import BrandLogo from '../components/BrandLogo';
import kantorBPS from '../assets/kantor-bps-3.jpg'


function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullname] = useState('');

  const navigate = useNavigate();

  const handleEmailRegistration = (e) => {
    e.preventDefault();
    // Simulasi logika registrasi (tanpa backend sungguhan)
    // Di aplikasi nyata, Anda akan mengirim data formulir ke API backend
    // untuk membuat akun baru.

    if (password !== confirmPassword) {
      alert("Konfirmasi password tidak cocok.");
      return;
    }

    if (email && password) { // Validasi sederhana
      alert("Registrasi Berhasil! Anda akan diarahkan ke dashboard.");
      // Di sini, setelah registrasi berhasil, Anda bisa mengarahkan langsung ke dashboard
      // atau ke halaman login agar pengguna login dengan akun barunya.
      navigate('/dashboard'); // Atau navigate('/login')
    } else {
      alert("Mohon lengkapi semua bidang.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{ backgroundImage: `url(${kantorBPS})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1}}
    >
      <div className="absolute inset-0 bg-black bg-opacity-45 backdrop-blur-sm"></div>
      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md relative">
        {/* Tombol Kembali */}
        <a
          href="/"
          className="absolute top-4 left-4 text-gray-600 hover:text-bps-blue transition-colors duration-200"
          aria-label="Kembali ke Beranda"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
        </a>

        <div className="text-center mb-8 mt-4">
           <div className="container mx-auto flex justify-center text-left">
            <a href="/">
              <BrandLogo textClassName='text-xl'/>
            </a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Daftar Akun Baru</h2>
        </div>

        <form onSubmit={handleEmailRegistration}>
          <div className="mb-4">
            <label htmlFor="regEmail" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="regEmail"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            {/* buat form nama lengkap */}
            <label htmlFor="regName" className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap:</label>
            <input
              type="text"
              id="regName"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="regPassword" className="block text-gray-700 text-sm font-bold mb-2">Kata Sandi:</label>
            <input
              type="password"
              id="regPassword"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
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
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
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

        <p className="text-center text-gray-600 text-sm mt-6">
          Sudah punya akun? <a href="/login" className="text-bps-blue hover:underline font-semibold">Login di sini</a>
        </p>
      </div>
    </div>
  );
}

export default Registration;