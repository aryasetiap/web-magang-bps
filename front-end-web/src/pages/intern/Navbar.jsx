import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeadBar from '../../components/protected/HeadBar'; // Adjust path if needed
import Sidebar from '../../components/protected/Sidebar'; // Adjust path if needed

function Navbar() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Default: TIDAK COLLAPSE

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Meneruskan isCollapsed ke HeadBar */}
      <HeadBar toggleSidebar={toggleSidebar} isCollapsed={isSidebarCollapsed} />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-grow p-6 mt-16 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Outlet/>
      </main>
    </div>
  );
}

export default Navbar;