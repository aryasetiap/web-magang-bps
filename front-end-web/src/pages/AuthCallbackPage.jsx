import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AlertDialog from "../components/AlertDialog";

const AuthCallbackPage = ({ setUserRole }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get("token");
      const userString = searchParams.get("user");
      const error = searchParams.get("error");

      if (error) {
        setAlert({
          isOpen: true,
          title: "Login Google Gagal!",
          message: `Terjadi kesalahan: ${error}`,
          type: "error",
        });
        setTimeout(() => {
          closeAlert();
          navigate("/login");
        }, 3000);
        return;
      }

      if (token && userString) {
        try {
          const userData = JSON.parse(decodeURIComponent(userString));
          localStorage.setItem("authToken", token);
          localStorage.setItem("userRole", userData.role?.name || "Mahasiswa");
          if (setUserRole) setUserRole(userData.role?.name || "Mahasiswa");
          setAlert({
            isOpen: true,
            title: "Login Google Berhasil!",
            message: `Selamat datang, ${userData.name}! Anda akan diarahkan ke dashboard.`,
            type: "success",
            autoCloseDelay: 1500,
          });
          setTimeout(() => {
            closeAlert();
            const role = userData.role?.name;
            navigate(
              role === "Admin"
                ? "/admin"
                : role === "Staff"
                ? "/staff"
                : "/dashboard"
            );
          }, 1500);
        } catch {
          setAlert({
            isOpen: true,
            title: "Login Gagal!",
            message: "Data user tidak valid",
            type: "error",
          });
          setTimeout(() => {
            closeAlert();
            navigate("/login");
          }, 3000);
        }
      } else {
        setAlert({
          isOpen: true,
          title: "Login Gagal!",
          message: "Data login tidak lengkap dari Google",
          type: "error",
        });
        setTimeout(() => {
          closeAlert();
          navigate("/login");
        }, 3000);
      }
    };
    handleOAuthCallback();
  }, [searchParams, navigate, setUserRole]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #7db5d5ff 100%)",
      }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-sm p-8 rounded-lg shadow-xl text-center max-w-md w-full mx-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Memproses Login Google
        </h2>

        <p className="text-gray-600 mb-4">
          Mohon tunggu sebentar, kami sedang memverifikasi akun Anda...
        </p>

        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
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
};

export default AuthCallbackPage;
