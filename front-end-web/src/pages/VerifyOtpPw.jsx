import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertDialog from "../components/AlertDialog";
import BrandLogo from "../components/BrandLogo";
import kantorBPSBg from "../assets/kantor-bps-3.jpg";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

function VerifyOtpPw() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Ambil email dari state lokasi jika diteruskan dari ForgotPasswordPage
  // Atau bisa juga dari URL params jika backend mengirimkannya di redirect
  const emailFromLocation = location.state?.email || "";
  // Atau token reset dari URL params jika backend mengirimkannya
  // const resetTokenFromParams = new URLSearchParams(location.search).get(
  //   "token"
  // );

  const handleVerifyOtpAndResetPassword = async (e) => {
    e.preventDefault();

    if (!otp.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setAlert({
        isOpen: true,
        title: "Validasi Input",
        message: "Semua bidang wajib diisi.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }
    if (newPassword.length < 6) {
      setAlert({
        isOpen: true,
        title: "Validasi Password",
        message: "Kata sandi baru minimal 6 karakter.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setAlert({
        isOpen: true,
        title: "Validasi Password",
        message: "Konfirmasi kata sandi baru tidak cocok.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }

    try {
      // --- Panggilan API ke Backend untuk Verifikasi OTP dan Reset Password ---
      // Asumsi backend memiliki endpoint seperti PATCH /auth/reset-password
      // yang menerima email (atau token), OTP, dan password baru.
      const apiResponse = await fetch(`${baseUrl}/auth/verify-reset-password`, {
        method: "POST", // Atau POST, sesuai implementasi backend Anda
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailFromLocation, // Kirim email yang didapat dari halaman sebelumnya
          otp: otp,
          newPassword: newPassword,
          // Jika backend menggunakan resetToken dari URL, kirim juga:
          // resetToken: resetTokenFromParams
        }),
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        setAlert({
          isOpen: true,
          title: "Reset Kata Sandi Berhasil!",
          message:
            "Kata sandi Anda telah berhasil diubah. Silakan login dengan kata sandi baru Anda.",
          type: "success",
          autoCloseDelay: 3000,
        });
        setTimeout(() => {
          closeAlert();
          navigate("/login"); // Arahkan ke halaman login
        }, 3000);
      } else {
        throw new Error(
          data.message || "Verifikasi OTP atau reset kata sandi gagal."
        );
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setAlert({
        isOpen: true,
        title: "Terjadi Kesalahan",
        message:
          error.message ||
          "Terjadi masalah saat mereset kata sandi. Mohon coba lagi.",
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

      {/* Konten formulir verifikasi OTP dan reset password */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative z-20">
        {/* Tombol Kembali */}
        {/* Tombol Kembali */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-gray-600 hover:text-bps-blue transition-colors duration-200"
          title="Kembali"
        >
          <ArrowLeftIcon className="h-7 w-7" />
        </button>

        <div className="text-center mb-8 mt-4">
          <div className="container mx-auto flex justify-center text-left">
            <a href="/">
              <BrandLogo textClassName="text-xl" />
            </a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            Verifikasi & Reset Kata Sandi
          </h2>
        </div>

        <p className="text-gray-600 text-center mb-6">
          Kode verifikasi telah dikirim ke email Anda (
          {emailFromLocation || "email tidak tersedia"}). Masukkan kode dan kata
          sandi baru Anda.
        </p>

        <form onSubmit={handleVerifyOtpAndResetPassword}>
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Kode Verifikasi (OTP):
            </label>
            <input
              type="text"
              id="otp"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="Masukkan kode OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Kata Sandi Baru:
            </label>
            <input
              type="password"
              id="newPassword"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirmNewPassword"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Konfirmasi Kata Sandi Baru:
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="••••••••"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
          >
            Reset Kata Sandi
          </button>
        </form>
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

export default VerifyOtpPw;
