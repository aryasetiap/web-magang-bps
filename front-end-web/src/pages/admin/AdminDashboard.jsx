// File: AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

function AdminDashboard() {
  const [recapData, setRecapData] = useState({
    allInterns: [],
    finalReports: [],
    tasks: [],
    attendances: [],
  });

  const [stats, setStats] = useState({
    totalRegisteredInterns: 0,
    finalReportGraduation: {
      totalFinalReportsSubmitted: 0,
      finalReportsPending: 0,
      finalReportsRevised: 0,
      finalReportsApproved: 0,
      totalGraduatedInterns: 0,
    },
    internPerformance: [],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [internAppsRes, reportsRes, tasksRes, presensiRes] =
          await Promise.all([
            fetch("http://localhost:3000/internship-applications"),
            fetch("http://localhost:3000/final-projects"),
            fetch("http://localhost:3000/tasks"),
            fetch("http://localhost:3000/attendance/all"),
          ]);

        const [internApps, reports, tasks, presensi] = await Promise.all([
          internAppsRes.json(),
          reportsRes.json(),
          tasksRes.json(),
          presensiRes.json(),
        ]);

        // Ambil peserta diterima dari internship-applications
        const acceptedInterns = Array.isArray(internApps.data)
          ? internApps.data
              .filter((app) => app.status === "diterima" && app.applicant)
              .map((app) => ({
                ...app.applicant,
                applicationId: app.id,
                status: app.status,
              }))
          : [];

        setRecapData({
          allInterns: acceptedInterns,
          finalReports: reports,
          tasks: tasks,
          attendances: presensi,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const { allInterns, finalReports, tasks, attendances } = recapData;
    const totalRegisteredInterns = allInterns.length;

    // Pastikan finalReports adalah array
    const reportsArr = Array.isArray(finalReports)
      ? finalReports
      : finalReports?.data || [];

    let finalReportsPending = 0;
    let finalReportsRevised = 0;
    let finalReportsApproved = 0;

    reportsArr.forEach((r) => {
      if (r.status === "not_submitted") finalReportsPending++;
      if (r.status === "revisi") finalReportsRevised++;
      if (r.status === "accepted") finalReportsApproved++;
    });

    const internPerformance = allInterns.map((intern) => {
      const internAttendances = attendances.filter(
        (a) => a.internId === intern.id
      );
      const internTasks = tasks.filter((t) => t.internId === intern.id);
      const internFinalReport = reportsArr.find(
        (r) => r.internId === intern.id
      );

      const totalPresensiHari = new Set(internAttendances.map((a) => a.date))
        .size;
      const presensiPenuh = internAttendances.filter(
        (a) => a.checkIn && a.checkOut
      ).length;

      const totalTugasDiberikan = internTasks.length;
      const tugasDiselesaikan = internTasks.filter(
        (t) => t.status === "accepted"
      ).length;

      const statusLaporanAkhir =
        internFinalReport?.status || "Belum Mengunggah";
      const statusKelulusan =
        statusLaporanAkhir === "accepted" ? "Lulus" : "Belum Lulus";

      return {
        id: intern.id,
        name: intern.name,
        email: intern.email,
        totalPresensiHari,
        presensiPenuh,
        totalTugasDiberikan,
        tugasDiselesaikan,
        statusLaporanAkhir,
        statusKelulusan,
      };
    });

    setStats({
      totalRegisteredInterns,
      finalReportGraduation: {
        totalFinalReportsSubmitted: reportsArr.length,
        finalReportsPending,
        finalReportsRevised,
        finalReportsApproved,
        totalGraduatedInterns: internPerformance.filter(
          (i) => i.statusKelulusan === "Lulus"
        ).length,
      },
      internPerformance,
    });
  }, [recapData]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">
        Selamat Datang di Dashboard Admin!
      </h2>
      <p className="text-gray-700 mb-6">
        Di sini Anda dapat mengelola seluruh aspek sistem manajemen magang.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500 flex items-center space-x-3">
          <UserGroupIcon className="h-8 w-8 text-blue-700" />
          <div>
            <h3 className="font-semibold text-lg text-blue-800">
              Total Peserta Diterima
            </h3>
            <p className="text-2xl font-bold text-blue-700">
              {stats.totalRegisteredInterns}
            </p>
          </div>
        </div>
        <div className="p-5 bg-purple-50 rounded-lg border-l-4 border-purple-500 flex items-center space-x-3">
          <DocumentChartBarIcon className="h-8 w-8 text-purple-700" />
          <div>
            <h3 className="font-semibold text-lg text-purple-800">
              Laporan Akhir Disetujui
            </h3>
            <p className="text-2xl font-bold text-purple-700">
              {stats.finalReportGraduation.finalReportsApproved}
            </p>
          </div>
        </div>
        <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500 flex items-center space-x-3">
          <AcademicCapIcon className="h-8 w-8 text-green-700" />
          <div>
            <h3 className="font-semibold text-lg text-green-800">
              Total Peserta Lulus
            </h3>
            <p className="text-2xl font-bold text-green-700">
              {stats.finalReportGraduation.totalGraduatedInterns}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <ChartBarIcon className="h-7 w-7 mr-2" /> Rekap Performa Peserta
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Nama Peserta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Total Presensi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                  Presensi Penuh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Tugas Diberikan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Tugas Diselesaikan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Status Laporan Akhir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                  Status Kelulusan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.internPerformance.map((intern) => (
                <tr
                  key={intern.id}
                  className="bg-white hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                    {intern.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {intern.totalPresensiHari} Hari
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {intern.presensiPenuh} Hari
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {intern.totalTugasDiberikan}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {intern.tugasDiselesaikan}
                  </td>
                  <td className="px-6 py-4 text-sm break-words">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        intern.statusLaporanAkhir === "Disetujui"
                          ? "bg-green-100 text-green-800"
                          : intern.statusLaporanAkhir === "Perlu Revisi"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {intern.statusLaporanAkhir}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm break-words">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        intern.statusKelulusan === "Lulus"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {intern.statusKelulusan}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.internPerformance.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Belum ada data performa peserta.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
