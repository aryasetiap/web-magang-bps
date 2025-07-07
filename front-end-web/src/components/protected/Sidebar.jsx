import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserCircleIcon, // Untuk Biodata
  DocumentCheckIcon,// Untuk Status Ajuan
  CalendarDaysIcon, // Untuk Aktivitas
  DocumentTextIcon, // Untuk Laporan Akhir
  AcademicCapIcon, // Untuk Sertifikat (juga untuk Manajemen Kelulusan Admin)
  AdjustmentsHorizontalIcon,
  UserGroupIcon, // Untuk Manajemen Pendaftar Admin
  ClipboardDocumentCheckIcon, // Untuk Monitoring Aktivitas Admin/Staff
  FolderOpenIcon, // Untuk Manajemen Penugasan Admin/Staff
  DocumentMagnifyingGlassIcon, // Untuk Review Tugas Akhir Admin
  ChartPieIcon, // Untuk Laporan & Statistik Admin
  DocumentArrowUpIcon, // Untuk Master Dokumen Admin
  DocumentDuplicateIcon, // Untuk Pengaturan Sertifikat Admin
  Bars3Icon // Untuk toggle sidebar
} from '@heroicons/react/24/outline';
import BrandLogo from '../BrandLogo';

function Sidebar({ isCollapsed, toggleSidebar, userRole }) {
  // Definisikan semua menu untuk setiap role
  const internMenus = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon, exact: true },
    { name: 'Biodata', path: '/dashboard/biodata', icon: UserCircleIcon },
    { name: 'Status Ajuan', path: '/dashboard/submissions', icon: DocumentCheckIcon },
    { name: 'Aktivitas', path: '/dashboard/activities', icon: CalendarDaysIcon },
    { name: 'Laporan Akhir', path: '/dashboard/intern-reports', icon: DocumentTextIcon },
    { name: 'Sertifikat', path: '/dashboard/certificate', icon: AcademicCapIcon },
  ];

  const adminMenus = [
    { name: 'Dashboard', path: '/admin', icon: HomeIcon, exact: true },
    // { name: 'Manajemen Akun', path: '/admin/accounts', icon: UsersIcon },
    { name: 'Pengaturan Akun & Sistem', path: '/admin/settings', icon: AdjustmentsHorizontalIcon },
    { name: 'Manajemen Pendaftar', path: '/admin/applicants', icon: UserGroupIcon },
    { name: 'Monitoring Peserta', path: '/admin/monitoring', icon: ClipboardDocumentCheckIcon },
    { name: 'Manajemen Penugasan', path: '/admin/assignments', icon: FolderOpenIcon },
    { name: 'Review Tugas Akhir', path: '/admin/final-reviews', icon: DocumentMagnifyingGlassIcon },
    { name: 'Manajemen Kelulusan', path: '/admin/graduation', icon: AcademicCapIcon },
    { name: 'Laporan & Statistik', path: '/admin/reports', icon: ChartPieIcon },
    { name: 'Master Dokumen', path: '/admin/master-docs', icon: DocumentArrowUpIcon },
    { name: 'Pengaturan Sertifikat', path: '/admin/cert-settings', icon: DocumentDuplicateIcon },
  ];

  const staffMenus = [
    { name: 'Dashboard', path: '/staff', icon: HomeIcon, exact: true },
    { name: 'Manajemen Penugasan', path: '/staff/assignments', icon: FolderOpenIcon },
    // Tambahkan menu lain yang relevan untuk Staff BPS di sini
    { name: 'Monitoring Peserta', path: '/staff/monitoring', icon: ClipboardDocumentCheckIcon },
  ];

  // Pilih menu yang akan ditampilkan berdasarkan role
  let currentMenus = [];
  switch (userRole) {
    case 'intern':
      currentMenus = internMenus;
      break;
    case 'admin':
      currentMenus = adminMenus;
      break;
    case 'staff':
      currentMenus = staffMenus;
      break;
    default:
      currentMenus = []; // Tidak ada menu jika role tidak dikenal atau belum login
  }

  return (
    <aside
      className={`bg-white shadow-lg h-full fixed top-0 left-0 pt-4 pb-4 z-40 transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >

      {/* Logo dan Nama Sistem di Sidebar */}
      <div className={`flex items-center p-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <BrandLogo
          onClick={toggleSidebar} // Klik logo/text untuk toggle sidebar
          showText={!isCollapsed} // Sembunyikan teks saat collapsed
          logoSizeClass="h-8" // Ukuran logo di sidebar
          textClassName={isCollapsed ? 'text-xs text-center' : 'text-xs'} // Ukuran teks nama sistem
        />
        {/* Toggle button if it needs to be in the sidebar when expanded */}
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bps-blue md:hidden lg:inline-block" // Hide on medium, show on larger screens
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className={`p-4 flex-grow ${isCollapsed ? 'overflow-y-hidden' : 'overflow-y-auto'}`}>
        <ul>
          {currentMenus.map((menu, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={menu.path}
                end={menu.exact || false}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg text-gray-700 hover:bg-bps-blue hover:text-white transition-colors duration-200
                  ${isActive ? 'bg-bps-blue text-white' : 'bg-white'}
                  ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <menu.icon className={`h-6 w-6 ${!isCollapsed && 'mr-3'}`} />
                {!isCollapsed && <span className="font-medium text-sm">{menu.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;