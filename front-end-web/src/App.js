import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
// Import halaman login dan registrasi
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/Registration';

// Import Unified Dashboard Layout (Layout gabungan untuk semua role dashboard)
import DashboardLayout from './components/protected/DashboardLayout'
import ProtectedRoute from './components/protected/ProtectedRoute'; // Untuk melindungi rute

// Import Halaman Dashboard Intern
import InternDashboard from './pages/intern/InternDashboard';
import BiodataPage from './pages/intern/Biodata'
import SubmissionStatusPage from './pages/intern/SubmissionStatus';
import ActivitiesPage from './pages/intern/Activities';
import InternReportPage from './pages/intern/InternReports';
import CertificatePage from './pages/intern/Certificate';

// Import Halaman Dashboard Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAccountsPage from './pages/admin/AdminAccounts';


// Import Halaman Dashboard Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffAssignments from './pages/staff/StaffAssigments';


function App() {
  // State global untuk menyimpan role pengguna.
  // Di aplikasi nyata, ini akan diatur melalui konteks autentikasi atau Redux.
  // Saat ini, nilai awal diambil dari localStorage (simulasi).
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));

  // Fungsi untuk memperbarui role pengguna secara global (dipanggil dari LoginPage)
  const updateGlobalUserRole = (role) => {
    setUserRole(role);
    if (role) {
      localStorage.setItem('userRole', role); // Simpan role ke localStorage
    } else {
      localStorage.removeItem('userRole'); // Hapus role dari localStorage saat logout
    }
  };

  return (
    
      <Routes>
        {/* Rute Publik (dapat diakses tanpa login) */}
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<LoginPage setUserRole={updateGlobalUserRole} />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Rute Dashboard Peserta Magang (Intern) - Dilindungi */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['intern']}>
            {/* UnifiedDashboardLayout akan menerima userRole dan merender sidebar yang sesuai */}
            <DashboardLayout userRole={userRole} />
          </ProtectedRoute>
        }>
          <Route index element={<InternDashboard />} /> {/* Halaman default /dashboard */}
          <Route path="biodata" element={<BiodataPage />} />
          <Route path="submissions" element={<SubmissionStatusPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="intern-reports" element={<InternReportPage />} />
          <Route path="certificate" element={<CertificatePage />} />
        </Route>

        {/* Rute Dashboard Admin - Dilindungi */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            {/* UnifiedDashboardLayout akan menerima userRole dan merender sidebar yang sesuai */}
            <DashboardLayout userRole={userRole} />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} /> {/* Halaman default /admin */}
          {/* Tambahkan rute khusus Admin lainnya di sini */}
          <Route path="accounts" element={<AdminAccountsPage />} />
          {/* <Route path="settings" element={<AdminSettingsPage />} /> */}
          {/* <Route path="applicants" element={<AdminApplicantsPage />} /> */}
          {/* <Route path="monitoring" element={<AdminMonitoringPage />} /> */}
          {/* <Route path="assignments" element={<AdminAssignmentsPage />} /> */}
          {/* <Route path="final-reviews" element={<AdminFinalReviewsPage />} /> */}
          {/* <Route path="graduation" element={<AdminGraduationPage />} /> */}
          {/* <Route path="reports" element={<AdminReportsPage />} /> */}
          {/* <Route path="master-docs" element={<AdminMasterDocsPage />} /> */}
          {/* <Route path="cert-settings" element={<AdminCertSettingsPage />} /> */}
        </Route>

        {/* Rute Dashboard Staff BPS - Dilindungi */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={['staff']}>
            {/* DashboardLayout akan menerima userRole dan merender sidebar yang sesuai */}
            <DashboardLayout userRole={userRole} />
          </ProtectedRoute>
        }>
          <Route index element={<StaffDashboard />} /> {/* Halaman default /staff */}
          {/* Tambahkan rute khusus Staff BPS lainnya di sini */}
          <Route path="assignments" element={<StaffAssignments />} />
        </Route>

        {/* Rute Catch-all untuk halaman tidak ditemukan (opsional) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}

      </Routes>
    
  );
}

export default App;
