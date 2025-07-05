import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertDialog from '../components/AlertDialog';
import BrandLogo from '../components/BrandLogo';
import kantorBPS from '../assets/kantor-bps-3.jpg'

// Terima setUserRole dari App.js
function LoginPage({ setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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

  const handleEmailLogin = (e) => {
    e.preventDefault();

    const users = [
      { email: 'admin@example.com', password: 'admin123', role: 'admin', redirectPath: '/admin' },
      { email: 'intern@example.com', password: 'intern123', role: 'intern', redirectPath: '/dashboard' },
      { email: 'staff@example.com', password: 'staff123', role: 'staff', redirectPath: '/staff' },
    ];

    let authenticatedUser = null;
    for (const user of users) {
      if (user.email === email && user.password === password) {
        authenticatedUser = user;
        break;
      }
    }

    if (authenticatedUser) {
      // Set role in localStorage for persistence across refreshes
      localStorage.setItem('userRole', authenticatedUser.role);
      // Also update the global userRole state in App.js
      if (setUserRole) {
        setUserRole(authenticatedUser.role);
      }

      setAlert({
        isOpen: true,
        title: 'Login Berhasil!',
        message: `Selamat datang, ${authenticatedUser.role}! Anda akan diarahkan ke dashboard ${authenticatedUser.role}.`,
        type: 'success',
        autoCloseDelay: 1500,
      });

      setTimeout(() => {
        closeAlert();
        navigate(authenticatedUser.redirectPath);
      }, 1500);
    } else {
      setAlert({
        isOpen: true,
        title: 'Login Gagal!',
        message: 'Email atau password salah. Silakan coba lagi.',
        type: 'error',
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{ backgroundImage: `url(${kantorBPS})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: -1}}
    >
      <div className="absolute inset-0 bg-black bg-opacity-45 backdrop-blur-sm"></div>
      <div className="bg-white bg-opacity-50 backdrop-blur-sm p-8 rounded-lg shadow-xl w-full max-w-md relative z-10">
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 17l-5-5m0 0l5-5m-5 5h12"
            />
          </svg>
        </a>

        <div className="text-center mb-8 mt-4">
          <div className="container mx-auto flex justify-center text-left">
            <a href="/">
              <BrandLogo textClassName='text-xl'/>
            </a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Masuk</h2>
        </div>

        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          Belum punya akun?{" "}
          <a
            href="/register"
            className="text-bps-blue hover:underline font-semibold"
          >
            Daftar di sini
          </a>
        </p>
        <p className="text-center text-gray-600 text-sm mt-2">
          <a href="/lupa-password" className="text-bps-blue hover:underline">
            Lupa Password?
          </a>
        </p>
      </div>

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
    </div>
  );
}

export default LoginPage;
