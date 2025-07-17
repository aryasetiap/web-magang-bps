import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertDialog from "../components/AlertDialog";
import BrandLogo from "../components/BrandLogo";
import kantorBPS from "../assets/kantor-bps-3.jpg";
import { jwtDecode } from "jwt-decode";

function LoginPage({ setUserRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // ✅ Menangkap token dari redirect Google OAuth
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");

    if (token && role) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      setUserRole(role);

      setAlert({
        isOpen: true,
        title: "Login Google Berhasil!",
        message: `Selamat datang, ${role}! Anda akan diarahkan ke dashboard.`,
        type: "success",
        autoCloseDelay: 1500,
      });

      setTimeout(() => {
        closeAlert();
        navigate(
          role === "admin"
            ? "/admin"
            : role === "staff"
            ? "/staff/dashboard"
            : "/dashboard"
        );
      }, 1500);
    }
  }, [location, navigate, setUserRole]);

  // ✅ Login Email/Password
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem("authToken", data.access_token);
        localStorage.setItem("userId", data.user.id);
        // Ambil role dari data.user.role.name
        const role = data.user.role?.name || "Mahasiswa";
        localStorage.setItem("userRole", role);
        if (setUserRole) setUserRole(role);

        // Redirect sesuai role
        if (role === "Intern") {
          navigate("/dashboard");
        } else if (role === "Admin") {
          navigate("/admin");
        } else if (role === "Staff BPS") {
          navigate("/staff");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Login gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan");
    }
    setLoading(false);
  };

  // ✅ Handle klik tombol Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4"
      style={{
        backgroundImage: `url(${kantorBPS})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: -1,
      }}
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
              <BrandLogo textClassName="text-xl" />
            </a>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Masuk</h2>
        </div>

        <form onSubmit={handleLogin}>
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
            {loading ? "Memuat..." : "Masuk"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">ATAU</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* ✅ Tombol Google Login via Backend */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleGoogleLogin}
            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Masuk dengan Google
          </button>
        </div>

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
          <a href="/forgot-password" className="text-bps-blue hover:underline">
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
