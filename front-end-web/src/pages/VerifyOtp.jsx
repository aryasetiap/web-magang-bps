import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import kantorBPSBg from "../assets/kantor-bps-3.jpg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

function VerifyOtpPage({ onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Ambil email dari state router
  const email = location.state?.email || "";

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Verifikasi berhasil! Mengarahkan ke halaman login...");
        if (onVerified) onVerified();
        setTimeout(() => {
          navigate("/login");
        }, 1500); // Tunggu 1.5 detik sebelum redirect
      } else {
        setError(data.message || "OTP salah atau sudah kadaluarsa.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Kode OTP baru telah dikirim ke email Anda.");
      } else {
        setError(data.message || "Gagal mengirim ulang kode OTP.");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setResendLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url('${kantorBPSBg}')` }}
    >
      {/* Overlay untuk keterbacaan */}
      <div className="absolute inset-0 bg-white bg-opacity-70 z-0"></div>
      <div className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-10"></div>
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow z-20 relative">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Verifikasi Email
        </h2>
        <p className="mb-2 text-gray-700 text-center">
          Masukkan kode OTP yang dikirim ke{" "}
          <span className="font-semibold">{email}</span>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan OTP"
            required
          />
          <button
            type="submit"
            className="w-full bg-bps-blue text-white py-2 rounded font-semibold hover:bg-blue-900 transition"
            disabled={loading}
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>
        <button
          onClick={handleResend}
          className="mt-4 w-full text-bps-blue hover:underline"
          disabled={resendLoading}
          type="button"
        >
          {resendLoading ? "Mengirim ulang..." : "Kirim ulang kode"}
        </button>
        {message && (
          <p className="mt-4 text-green-600 text-center">{message}</p>
        )}
        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}

export default VerifyOtpPage;
