import React, { useState } from 'react'; // Import useState
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import BPSLogo from '../assets/logo-sistem-magang.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const handleEmailLogin = (e) => {
    e.preventDefault();
    // Simulasi logika login (tanpa backend sungguhan)
    // Di aplikasi nyata, Anda akan mengirim email dan password ke API backend
    // dan menunggu respons autentikasi.

    if (email === 'user@example.com' && password === 'password123') { // Contoh kredensial dummy
      alert("Login Berhasil!");
      navigate('/dashboard'); // Redirect ke halaman dashboard
    } else {
      alert("Email atau password salah. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
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
          <img src={BPSLogo} alt="Logo BPS Pringsewu" className="h-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Masuk</h2>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="nama@contoh.com"
              value={email} // Hubungkan input dengan state
              onChange={(e) => setEmail(e.target.value)} // Update state saat input berubah
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={password} // Hubungkan input dengan state
              onChange={(e) => setPassword(e.target.value)} // Update state saat input berubah
              required
            />
          </div>
          <button
            type="submit"
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Belum punya akun? <a href="/register" className="text-bps-blue hover:underline font-semibold">Daftar di sini</a>
        </p>
        <p className="text-center text-gray-600 text-sm mt-2">
          <a href="/lupa-password" className="text-bps-blue hover:underline">Lupa Password?</a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;