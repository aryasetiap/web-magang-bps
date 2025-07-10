import React, { useState, useEffect } from 'react';
import { ChartBarIcon, DocumentChartBarIcon, UserGroupIcon, CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // Ikon

function AdminDashboard() {
  // --- State untuk Data Sumber (dari berbagai localStorage) ---
  const [allInterns, setAllInterns] = useState([]);
  const [allDailyActivities, setAllDailyActivities] = useState({});
  const [allAssignments, setAllAssignments] = useState([]);
  const [allFinalReports, setAllFinalReports] = useState([]);
  const [allGraduationData, setAllGraduationData] = useState([]);

  // State untuk menyimpan hasil statistik yang dihitung
  const [stats, setStats] = useState({
    totalRegisteredInterns: 0,
    attendance: { totalCheckIns: 0, totalCheckOuts: 0, totalDaysActive: 0 },
    assignment: { totalAssignmentsGiven: 0, totalSubmittedAssignments: 0, totalReviewedAssignments: 0, totalNotSubmittedAssignments: 0 },
    finalReportGraduation: { totalFinalReportsSubmitted: 0, finalReportsPending: 0, finalReportsRevised: 0, finalReportsApproved: 0, totalGraduatedInterns: 0 },
    internPerformance: [],
  });

  // --- Efek untuk Memuat Data dari localStorage ---
  useEffect(() => {
    const loadedApplicants = JSON.parse(localStorage.getItem('adminApplicants') || '[]').filter(app => app.status === 'Accepted');
    setAllInterns(loadedApplicants);

    const loadedDailyActivities = JSON.parse(localStorage.getItem('adminDailyActivities') || '{}');
    setAllDailyActivities(loadedDailyActivities);

    const loadedAssignments = JSON.parse(localStorage.getItem('adminAssignmentsData') || '[]');
    setAllAssignments(loadedAssignments);

    const loadedFinalReports = JSON.parse(localStorage.getItem('adminFinalReports') || '[]');
    setAllFinalReports(loadedFinalReports);

    const loadedGraduationData = JSON.parse(localStorage.getItem('adminGraduationData') || '[]');
    setAllGraduationData(loadedGraduationData);

  }, []); // Dependensi kosong agar hanya jalan sekali saat mount

  // --- Logika Rekapitulasi & Statistik (Dijalankan setelah data dimuat/berubah) ---
  useEffect(() => {
    const totalRegisteredInterns = allInterns.length;

    const attendanceStats = (() => {
      let totalCheckIns = 0;
      let totalCheckOuts = 0;
      let totalDaysActive = 0;
      Object.values(allDailyActivities).forEach(internActivities => {
        internActivities.forEach(activity => {
          totalDaysActive++;
          if (activity.checkIn) totalCheckIns++;
          if (activity.checkOut) totalCheckOuts++;
        });
      });
      return { totalCheckIns, totalCheckOuts, totalDaysActive };
    })();

    const assignmentStats = (() => {
      let totalAssignmentsGiven = 0;
      let totalSubmittedAssignments = 0;
      let totalReviewedAssignments = 0;
      let totalNotSubmittedAssignments = 0;

      allAssignments.forEach(assignment => {
        totalAssignmentsGiven += Object.keys(assignment.submissions).length;
        Object.values(assignment.submissions).forEach(submission => {
          if (submission.status === 'Submitted') totalSubmittedAssignments++;
          if (submission.status === 'Reviewed') totalReviewedAssignments++;
          if (submission.status === 'Not Submitted') totalNotSubmittedAssignments++;
        });
      });
      return { totalAssignmentsGiven, totalSubmittedAssignments, totalReviewedAssignments, totalNotSubmittedAssignments };
    })();

    const finalReportGraduationStats = (() => {
      let totalFinalReportsSubmitted = allFinalReports.length;
      let finalReportsPending = 0;
      let finalReportsRevised = 0;
      let finalReportsApproved = 0;

      allFinalReports.forEach(report => {
        if (report.status === 'Belum Diperiksa') finalReportsPending++;
        if (report.status === 'Perlu Revisi') finalReportsRevised++;
        if (report.status === 'Disetujui') finalReportsApproved++;
      });

      const totalGraduatedInterns = allGraduationData.filter(intern => intern.overallGraduationStatus === 'Lulus').length;

      return { totalFinalReportsSubmitted, finalReportsPending, finalReportsRevised, finalReportsApproved, totalGraduatedInterns };
    })();

    const internPerformanceRecap = allInterns.map(intern => {
      const internActivities = allDailyActivities[intern.id] || [];
      const internFinalReport = allFinalReports.find(report => report.internId === intern.id);
      const internGraduationStatus = allGraduationData.find(grad => grad.id === intern.id)?.overallGraduationStatus || 'Belum Lulus';
      
      let internTotalAssignments = 0;
      let internCompletedAssignments = 0;
      allAssignments.forEach(assign => {
        if (assign.assignedTo.includes(intern.id)) {
          internTotalAssignments++;
          if (assign.submissions[intern.id]?.status === 'Reviewed') {
            internCompletedAssignments++;
          }
        }
      });

      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        totalPresensiHari: internActivities.length,
        presensiPenuh: internActivities.filter(act => act.checkIn && act.checkOut).length,
        totalTugasDiberikan: internTotalAssignments,
        tugasDiselesaikan: internCompletedAssignments,
        statusLaporanAkhir: internFinalReport?.status || 'Belum Mengunggah',
        statusKelulusan: internGraduationStatus,
      };
    });

    setStats({
      totalRegisteredInterns,
      attendance: attendanceStats,
      assignment: assignmentStats,
      finalReportGraduation: finalReportGraduationStats,
      internPerformance: internPerformanceRecap,
    });

  }, [allInterns, allDailyActivities, allAssignments, allFinalReports, allGraduationData]);


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">Selamat Datang di Dashboard Admin!</h2>
      <p className="text-gray-700 mb-6">
        Di sini Anda dapat mengelola seluruh aspek sistem manajemen magang.
      </p>

      {/* Statistik Umum (dari AdminReportsPage) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex items-center space-x-3">
          <UserGroupIcon className="h-8 w-8 text-blue-700" />
          <div>
            <h3 className="font-semibold text-lg text-blue-800">Total Peserta Diterima</h3>
            <p className="text-2xl font-bold text-blue-700">{stats.totalRegisteredInterns}</p>
          </div>
        </div>
        <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500 flex items-center space-x-3">
          <CalendarDaysIcon className="h-8 w-8 text-green-700" />
          <div>
            <h3 className="font-semibold text-lg text-green-800">Total Presensi Masuk</h3>
            <p className="text-2xl font-bold text-green-700">{stats.attendance.totalCheckIns}</p>
          </div>
        </div>
        <div className="p-5 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 flex items-center space-x-3">
          <DocumentChartBarIcon className="h-8 w-8 text-yellow-700" />
          <div>
            <h3 className="font-semibold text-lg text-yellow-800">Tugas Diselesaikan</h3>
            <p className="text-2xl font-bold text-yellow-700">{stats.assignment.totalReviewedAssignments} / {stats.assignment.totalAssignmentsGiven}</p>
          </div>
        </div>
        <div className="p-5 bg-purple-50 rounded-lg border-l-4 border-purple-500 flex items-center space-x-3">
          <DocumentChartBarIcon className="h-8 w-8 text-purple-700" />
          <div>
            <h3 className="font-semibold text-lg text-purple-800">Laporan Akhir Disetujui</h3>
            <p className="text-2xl font-bold text-purple-700">{stats.finalReportGraduation.finalReportsApproved}</p>
          </div>
        </div>
        <div className="p-5 bg-indigo-50 rounded-lg border-l-4 border-indigo-500 flex items-center space-x-3">
          <AcademicCapIcon className="h-8 w-8 text-indigo-700" />
          <div>
            <h3 className="font-semibold text-lg text-indigo-800">Total Peserta Lulus</h3>
            <p className="text-2xl font-bold text-indigo-700">{stats.finalReportGraduation.totalGraduatedInterns}</p>
          </div>
        </div>
      </div>

      {/* Rekap Performa Detail Per Peserta (dari AdminReportsPage) */}
      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <ChartBarIcon className="h-7 w-7 mr-2" /> Rekap Performa Peserta
        </h3>
        <p className="text-gray-700 mb-4">
          Lihat detail performa setiap peserta magang secara individu.
        </p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Nama Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Total Presensi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Presensi Penuh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tugas Diberikan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tugas Diselesaikan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Status Laporan Akhir</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.internPerformance.map((intern) => (
                <tr key={intern.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{intern.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{intern.totalPresensiHari} Hari</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{intern.presensiPenuh} Hari</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{intern.totalTugasDiberikan}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{intern.tugasDiselesaikan}</td>
                  <td className="px-6 py-4 text-sm break-words">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${intern.statusLaporanAkhir === 'Disetujui' ? 'bg-green-100 text-green-800' :
                        intern.statusLaporanAkhir === 'Perlu Revisi' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {intern.statusLaporanAkhir}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm break-words">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${intern.statusKelulusan === 'Lulus' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {intern.statusKelulusan}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.internPerformance.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Belum ada data performa peserta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Panduan Cepat Admin (dari AdminDashboard.jsx asli) */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Panduan Cepat Admin:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Gunakan "Manajemen Akun" untuk menambahkan atau mengelola Staff dan Koordinator.</li>
          <li>Cek "Manajemen Pendaftar" untuk memverifikasi calon peserta magang.</li>
          <li>"Monitoring Peserta" memberikan gambaran presensi dan logbook harian semua peserta.</li>
          <li>Atur periode pendaftaran dan kuota di "Pengaturan Sistem".</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;