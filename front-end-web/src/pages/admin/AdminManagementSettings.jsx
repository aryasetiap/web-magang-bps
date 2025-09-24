import React from "react";
import AdminAccountsPage from "./management-settings/AdminAccounts";
import AdminSettingsPage from "./management-settings/AdminSettings";

function AdminManagementSettingsPage() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6">
        <AdminAccountsPage />
      </div>
    </div>
  );
}

export default AdminManagementSettingsPage;
