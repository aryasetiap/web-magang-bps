import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../components/AlertDialog"; // Pastikan path ini sesuai dengan struktur proyek Anda
import BrandLogo from "../components/BrandLogo";
import kantorBPSBg from "../assets/kantor-bps-3.jpg";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi email sederhana
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setAlert({
        isOpen: true,
        title: "Input Tidak Valid",
        message: "Mohon masukkan alamat email yang valid.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }

    try {
      const apiResponse = await fetch(
        "http://localhost:3000/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        setAlert({
          isOpen: true,
          title: "Permintaan Terkirim!",
          message:
            "Jika email Anda terdaftar, tautan untuk mereset kata sandi telah dikirim ke email Anda.",
          type: "success",
          autoCloseDelay: 3000,
        });
        setTimeout(() => {
          closeAlert();
          navigate("/verify-otp", { state: { email: email } }); // Teruskan email via state
        }, 3000);
        setEmail("");
      } else {
        // Backend mengirimkan status error (misal 404 jika email tidak ditemukan, 500 server error)
        throw new Error(
          data.message || "Gagal mengirim tautan reset kata sandi."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setAlert({
        isOpen: true,
        title: "Terjadi Kesalahan",
        message:
          error.message ||
          "Terjadi masalah saat memproses permintaan Anda. Mohon coba lagi.",
        type: "error",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('${kantorBPSBg}')` }}
    >
      {/* Overlay untuk keterbacaan */}
      <div className="absolute inset-0 bg-white bg-opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>

      {/* Konten formulir lupa password */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative z-20">
        {/* Tombol Kembali */}
        <a
          href="/login" // Kembali ke halaman login
          className="absolute top-4 left-4 text-gray-600 hover:text-bps-blue transition-colors duration-200"
          aria-label="Kembali ke Login"
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
              <BrandLogo textClassName="text-xl" />
            </a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            Lupa Kata Sandi
          </h2>
        </div>

        <p className="text-gray-600 text-center mb-6">
          Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan
          tautan untuk mereset kata sandi.
        </p>

        <form onSubmit={handleSubmit}>
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
          <button
            type="submit"
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
          >
            Kirim
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Sudah ingat?{" "}
          <a
            href="/login"
            className="text-bps-blue hover:underline font-semibold"
          >
            Masuk di sini
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
      />
    </div>
  );
}

export default ForgotPasswordPage;
