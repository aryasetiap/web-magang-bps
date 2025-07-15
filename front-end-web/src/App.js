import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
// Import halaman login dan registrasi
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/Registration";
import ForgotPasswordPage from "./pages/ForgotPassword";
import AuthCallbackPage from "./pages/AuthCallbackPage";

// Import Unified Dashboard Layout (Layout gabungan untuk semua role dashboard)
import DashboardLayout from "./components/protected/DashboardLayout";
import ProtectedRoute from "./components/protected/ProtectedRoute"; // Untuk melindungi rute
import ProtectedRouteInternAccepted from "./components/protected/ProtectedRouteInternAccepted";

// Import Halaman Dashboard Intern
import InternDashboard from "./pages/intern/InternDashboard";
import BiodataPage from "./pages/intern/Biodata";
import SubmissionStatusPage from "./pages/intern/SubmissionStatus";
import ActivitiesPage from "./pages/intern/Activities";
import InternReportPage from "./pages/intern/InternReports";
import CertificatePage from "./pages/intern/Certificate";

// Import Halaman Dashboard Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAccountsPage from "./pages/admin/management-settings/AdminAccounts";
// import AdminSettingsPage from './pages/admin/AdminSettings';
import AdminApplicantsPage from "./pages/admin/AdminApplicants";
import AdminMonitoringPage from "./pages/admin/AdminMonitoring";
import AdminManagementSettingsPage from "./pages/admin/AdminManagementSettings";
import AdminAssignmentsPage from "./pages/admin/AdminAssignments";
import AdminFinalReviewsPage from "./pages/admin/AdminFinalReview";
import AdminGraduationPage from "./pages/admin/AdminGraduation";
import AdminReportsPage from "./pages/admin/AdminReports";
import AdminMasterDocsPage from "./pages/admin/AdminMasterDocs";
import AdminCertSettingsPage from "./pages/admin/AdminCertSettings";

// Import Halaman Dashboard Staff
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffAssignments from "./pages/staff/StaffAssigments";

import NotFoundPage from "./pages/error/NotFound";
import ForbiddenPage from "./pages/error/Forbidden";
import ServerErrorPage from "./pages/error/ServerError";

function App() {
  // State global untuk menyimpan role pengguna.
  const [userRole, setUserRole] = useState(
    localStorage.getItem("userRole") || ""
  );

  // Fungsi untuk memperbarui role pengguna secara global (dipanggil dari LoginPage)
  const updateGlobalUserRole = (role) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem("userRole", role); // Simpan role ke localStorage
    } else {
      localStorage.removeItem("userRole"); // Hapus role dari localStorage saat logout
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rute Publik (dapat diakses tanpa login) */}
          <Route path="/" element={<Home />} />

          {/* Login & Register routes */}
          <Route
            path="/login"
            element={<LoginPage setUserRole={updateGlobalUserRole} />}
          />
          <Route path="/register" element={<RegistrationPage />} />

          {/* OAuth Callback route */}
          <Route
            path="/auth/callback"
            element={<AuthCallbackPage setUserRole={updateGlobalUserRole} />}
          />

          {/* Rute Dashboard Peserta Magang (Intern) - Dilindungi */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["Mahasiswa", "Intern"]}>
                <DashboardLayout userRole={userRole} />
              </ProtectedRoute>
            }
          >
            <Route index element={<InternDashboard />} />{" "}
            {/* Halaman default /dashboard */}
            <Route path="biodata" element={<BiodataPage />} />
            <Route path="submissions" element={<SubmissionStatusPage />} />
            <Route
              path="activities"
              element={
                <ProtectedRouteInternAccepted>
                  <ActivitiesPage />
                </ProtectedRouteInternAccepted>
              }
            />
            <Route
              path="intern-reports"
              element={
                <ProtectedRouteInternAccepted>
                  <InternReportPage />
                </ProtectedRouteInternAccepted>
              }
            />
            <Route
              path="certificate"
              element={
                <ProtectedRouteInternAccepted>
                  <CertificatePage />
                </ProtectedRouteInternAccepted>
              }
            />
          </Route>

          {/* Rute Dashboard Admin - Dilindungi */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "Admin"]}>
                {/* DashboardLayout akan menerima userRole dan merender sidebar yang sesuai */}
                <DashboardLayout userRole={userRole} />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />{" "}
            {/* Halaman default /admin */}
            {/* Tambahkan rute khusus Admin lainnya di sini */}
            <Route path="accounts" element={<AdminAccountsPage />} />
            <Route path="settings" element={<AdminManagementSettingsPage />} />
            <Route path="applicants" element={<AdminApplicantsPage />} />
            <Route path="monitoring" element={<AdminMonitoringPage />} />
            <Route path="assignments" element={<AdminAssignmentsPage />} />
            <Route path="final-reviews" element={<AdminFinalReviewsPage />} />
            <Route path="graduation" element={<AdminGraduationPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="master-docs" element={<AdminMasterDocsPage />} />
            <Route path="cert-settings" element={<AdminCertSettingsPage />} />
          </Route>

          {/* Rute Dashboard Staff BPS - Dilindungi */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff", "Staff"]}>
                {/* DashboardLayout akan menerima userRole dan merender sidebar yang sesuai */}
                <DashboardLayout userRole={userRole} />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />{" "}
            {/* Halaman default /staff */}
            {/* Tambahkan rute khusus Staff BPS lainnya di sini */}
            <Route path="assignments" element={<StaffAssignments />} />
          </Route>

          {/* Rute Catch-all untuk halaman tidak ditemukan (opsional) */}
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
