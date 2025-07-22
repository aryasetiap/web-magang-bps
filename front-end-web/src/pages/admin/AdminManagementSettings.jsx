import React from "react";
import AdminAccountsPage from "./management-settings/AdminAccounts";
import AdminSettingsPage from "./management-settings/AdminSettings";

function AdminManagementSettingsPage() {
  return (
    <div>
      <div className="bg-white p-8 mb-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-bps-blue">
          Manajemen & Pengaturan Admin
        </h2>
        <p className="text-gray-700">
          Kelola akun staff dan koordinator, serta atur parameter umum sistem
          magang.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <AdminAccountsPage />
      </div>
    </div>
  );
}

export default AdminManagementSettingsPage;
