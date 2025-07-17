import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UserCircleIcon,
  DocumentCheckIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  FolderOpenIcon,
  DocumentMagnifyingGlassIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import BrandLogo from "../BrandLogo";

function Sidebar({ isCollapsed, userRole }) {
  const [internshipAccepted, setInternshipAccepted] = useState(false);

  useEffect(() => {
    if (userRole === "Intern" || userRole === "Mahasiswa") {
      const token = localStorage.getItem("authToken");
      fetch("http://localhost:3000/internship-applications/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((result) => {
          if (
            result.data &&
            result.data.length > 0 &&
            result.data[0].status === "diterima"
          ) {
            setInternshipAccepted(true);
          } else {
            setInternshipAccepted(false);
          }
        })
        .catch(() => setInternshipAccepted(false));
    }
  }, [userRole]);

  // Definisikan semua menu untuk setiap role
  const internMenus = [
    { name: "Dashboard", path: "/dashboard", icon: HomeIcon, exact: true },
    { name: "Biodata", path: "/dashboard/biodata", icon: UserCircleIcon },
    {
      name: "Status Ajuan",
      path: "/dashboard/submissions",
      icon: DocumentCheckIcon,
    },
    internshipAccepted && {
      name: "Aktivitas",
      path: "/dashboard/activities",
      icon: CalendarDaysIcon,
    },
    internshipAccepted && {
      name: "Laporan Akhir",
      path: "/dashboard/intern-reports",
      icon: DocumentTextIcon,
    },
    internshipAccepted && {
      name: "Sertifikat",
      path: "/dashboard/certificate",
      icon: AcademicCapIcon,
    },
  ].filter(Boolean);

  const adminMenus = [
    { name: "Dashboard", path: "/admin", icon: HomeIcon, exact: true },
    // { name: 'Manajemen Akun', path: '/admin/accounts', icon: UsersIcon },
    {
      name: "Pengaturan Akun & Sistem",
      path: "/admin/settings",
      icon: AdjustmentsHorizontalIcon,
    },
    {
      name: "Manajemen Pendaftar",
      path: "/admin/applicants",
      icon: UserGroupIcon,
    },
    {
      name: "Monitoring Peserta",
      path: "/admin/monitoring",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      name: "Manajemen Penugasan",
      path: "/admin/assignments",
      icon: FolderOpenIcon,
    },
    {
      name: "Review Tugas Akhir",
      path: "/admin/final-reviews",
      icon: DocumentMagnifyingGlassIcon,
    },
    // {
    //   name: "Manajemen Kelulusan",
    //   path: "/admin/graduation",
    //   icon: AcademicCapIcon,
    // },
    // { name: 'Laporan & Statistik', path: '/admin/reports', icon: ChartPieIcon },
    // {
    //   name: "Master Dokumen",
    //   path: "/admin/master-docs",
    //   icon: DocumentArrowUpIcon,
    // },
    {
      name: "Pengaturan Sertifikat",
      path: "/admin/cert-settings",
      icon: DocumentDuplicateIcon,
    },
  ];

  const staffMenus = [
    { name: "Dashboard", path: "/staff", icon: HomeIcon, exact: true },
    {
      name: "Manajemen Penugasan",
      path: "/staff/assignments",
      icon: FolderOpenIcon,
    },
  ];

  // Pilih menu yang akan ditampilkan berdasarkan role
  let currentMenus = [];
  switch (userRole) {
    case "Intern":
      currentMenus = internMenus;
      break;
    case "Admin":
      currentMenus = adminMenus;
      break;
    case "Staff BPS":
      currentMenus = staffMenus;
      break;
    default:
      currentMenus = []; // Tidak ada menu jika role tidak dikenal atau belum login
  }

  return (
    <aside
      className={`bg-white shadow-lg h-full fixed top-0 left-0 pt-4 pb-4 z-40 transition-all duration-300 ease-in-out flex flex-col
        ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Logo dan Nama Sistem di Sidebar */}
      <div
        className={`flex items-center p-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <BrandLogo
          // onclick ke homepage
          onClick={() => (window.location.href = "/")}
          className={`cursor-pointer ${
            isCollapsed ? "w-10 h-10" : "w-12 h-12"
          }`}
          showText={!isCollapsed} // Sembunyikan teks saat collapsed
          logoSizeClass="h-8" // Ukuran logo di sidebar
          textClassName={isCollapsed ? "text-xs text-center" : "text-sm"} // Ukuran teks nama sistem
        />
      </div>

      <nav
        className={`p-4 flex-grow ${
          isCollapsed ? "overflow-y-hidden" : "overflow-y-auto"
        }`}
      >
        <ul>
          {currentMenus.map((menu, index) => (
            <li key={index} className="mb-2">
              <NavLink
                to={menu.path}
                end={menu.exact || false}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg text-gray-700 hover:bg-bps-blue hover:text-white transition-colors duration-200
                  ${isActive ? "bg-bps-blue text-white" : "bg-white"}
                  ${isCollapsed ? "justify-center" : ""}`
                }
              >
                <menu.icon className={`h-6 w-6 ${!isCollapsed && "mr-3"}`} />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{menu.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
