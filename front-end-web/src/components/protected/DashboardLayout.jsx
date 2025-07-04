import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeadBar from './HeadBar';
import Sidebar from './Sidebar';

function DashboardLayout({ userRole }) { // Terima userRole dari App.js
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <HeadBar toggleSidebar={toggleSidebar} isCollapsed={isSidebarCollapsed} userRole={userRole} />
      
      {/* Gunakan UnifiedSidebar dan teruskan props yang diperlukan */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} userRole={userRole} />
      
      <main
        className={`flex-grow p-6 mt-16 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;