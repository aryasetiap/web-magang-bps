import React from 'react';
import { Menu } from '@headlessui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/24/outline'; // Import Bars3Icon

// Menerima prop isCollapsed dan userRole dari parent layout
function HeadBar({ toggleSidebar, isCollapsed, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    alert('Anda telah logout!');
    localStorage.removeItem('userRole'); // Clear role on logout
    navigate('/login');
  };

  // Determine the root path for the current user's role
  const getRoleRootPath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'staff': return '/staff';
      case 'intern': return '/dashboard'; // Peserta Magang uses /dashboard
      default: return '/';
    }
  };

  const roleRootPath = getRoleRootPath(userRole);
  const currentPath = location.pathname;

  // Logika Breadcrumbs
  // Filter out the role root segment, and then process
  const pathnames = currentPath.split('/').filter(x => x);
  const breadcrumbs = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    // Construct 'to' path correctly relative to root
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

    return (
      <span key={to} className="flex items-center">
        <a href={to} className={`text-gray-600 hover:text-bps-blue ${last ? 'font-semibold' : ''}`}>
          {displayName}
        </a>
        {!last && <span className="mx-2 text-gray-400">/</span>}
      </span>
    );
  });

  return (
    <header
      className={`bg-white shadow-sm p-4 flex justify-between items-center rounded-lg fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'ml-2 left-24' : 'ml-6 left-64'}`} // Mengatur posisi kiri HeadBar berdasarkan state sidebar
    >
      <div className="flex items-center h-full">
        {/* Toggle Button untuk Sidebar (Sekarang selalu terlihat di HeadBar) */}
        {/* <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bps-blue"
          aria-label="Toggle Sidebar"
        >
          <Bars3Icon className="h-6 w-6" /> 
        </button> */}

        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="flex text-sm">
          {/* Tampilkan root dashboard sesuai role */}
          {currentPath === roleRootPath || (userRole === 'intern' && currentPath === '/dashboard') ? (
            <span className="text-gray-600 font-semibold">Dashboard</span>
          ) : (
            <>
              {/* Link ke root dashboard role masing-masing */}
              <a href={roleRootPath} className="text-gray-600 hover:text-bps-blue mr-2">
                {userRole === 'admin' ? 'Admin Dashboard' : userRole === 'staff' ? 'Staff Dashboard' : 'Dashboard'}
              </a>
              <span className="text-gray-400 mr-2">/</span>
              {/* Filter out the role's root segment from breadcrumbs */}
              {breadcrumbs.filter(crumb => crumb.props.children[0].props.href !== roleRootPath)}
            </>
          )}
        </nav>
      </div>

      {/* User Avatar and Dropdown Menu */}
      <Menu as="div" className="relative">
        <div>
          <Menu.Button className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bps-blue focus-visible:ring-opacity-75 rounded-full">
            <UserCircleIcon className="h-10 w-10 text-gray-500" />
            <span className="text-gray-700 font-medium hidden md:block">
              {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Pengguna'}
            </span> {/* Display user role */}
            <svg
              className="h-5 w-5 text-gray-500 hidden md:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Menu.Button>
        </div>

        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => alert('Profil saya (belum diimplementasikan)')}
                  className={`${
                    active ? 'bg-bps-blue text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Profil Saya
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-red-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>
    </header>
  );
}

export default HeadBar;