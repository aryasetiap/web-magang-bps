// Fungsi fetch registrasi pengguna baru
const baseUrl = process.env.REACT_APP_BASE_URL;
export async function registerUser({ email, name, password }) {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Registrasi gagal.");
  }
  return result;
}

export function redirectToGoogleOAuth() {
  window.location.href = `${baseUrl}/auth/google`;
}

// Fungsi untuk login
export async function loginUser({ email, password }) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login gagal");
  }

  return data;
}

export function handlGoogleLoginRedirect({
  location,
  setUserRole,
  navigate,
  setAlert,
  closeAlert,
}) {
  const params = new URLSearchParams(location.search);
  const role = params.get("role");
  const token = params.get("token");

  if (token && role) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);
    setUserRole(role);
    setAlert({
      isOpen: true,
      title: "Login Google Berhasil",
      message: `Selamat datang, ${role}! Anda akan diarahkan ke dashboard.`,
      type: "success",
      autoCloseDelay: 1500,
    });
    setTimeout(() => {
      closeAlert();
      if (role === "admin") navigate("/admin");
      else if (role === "staff") navigate("/staff/dashboard");
      else navigate("/dashboard");
    }, 1500);
  }
}

// Fungsi forgot password
// utils/auth.js

export async function forgotPasswordRequest(email) {
  const res = await fetch(`${baseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Gagal mengirim tautan reset kata sandi.");
  }

  return data;
}
