import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline"; // Mengimpor ikon dari Heroicons

function AdminDashboard() {
  const [internshipApplications, setInternshipApplications] = useState([]);
  const [finalProjects, setFinalProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "http://localhost:3000"; // URL dasar API Anda

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsRes, projectsRes, tasksRes, attendancesRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/internship-applications`).then((res) =>
              res.json()
            ),
            fetch(`${API_BASE_URL}/final-projects/all`).then((res) =>
              res.json()
            ),
            fetch(`${API_BASE_URL}/tasks`).then((res) => res.json()),
            fetch(`${API_BASE_URL}/attendances/all`).then((res) => res.json()),
          ]);

        setInternshipApplications(
          Array.isArray(applicationsRes.data) ? applicationsRes.data : []
        );
        setFinalProjects(
          Array.isArray(projectsRes.data) ? projectsRes.data : []
        );
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setAttendances(
          Array.isArray(attendancesRes.data) ? attendancesRes.data : []
        );
        setLoading(false);
      } catch (err) {
        setError(
          "Gagal memuat data. Pastikan server berjalan di localhost:3000."
        );
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // Hitung statistik
  const totalApplicants = internshipApplications.length;
  const acceptedApplicants = internshipApplications.filter(
    (app) => app.status === "diterima"
  ).length;
  const pendingApplicants = internshipApplications.filter(
    (app) => app.status === "pending"
  ).length;
  const rejectedApplicants = internshipApplications.filter(
    (app) => app.status === "ditolak"
  ).length;

  const totalFinalProjects = finalProjects.length;
  const acceptedFinalProjects = finalProjects.filter(
    (project) => project.status === "accepted"
  ).length;
  const pendingFinalProjects = finalProjects.filter(
    (project) => project.status === "pending"
  ).length; // Asumsi status 'pending'

  const totalTasks = tasks.length;

  const totalAttendances = attendances.length;
  const presentAttendances = attendances.filter(
    (att) => att.status === "hadir"
  ).length;
  const absentAttendances = attendances.filter(
    (att) => att.status === "izin" || att.status === "alpha"
  ).length; // Asumsi 'izin' atau 'alpha' untuk tidak hadir

  // Kelompokkan pendaftar berdasarkan institusi dan jenis kegiatan
  const applicantsByInstitution = internshipApplications.reduce((acc, app) => {
    if (app.applicant && app.applicant.asalInstitusi) {
      const institution = app.applicant.asalInstitusi;
      acc[institution] = (acc[institution] || 0) + 1;
    }
    return acc;
  }, {});

  const applicantsByActivityType = internshipApplications.reduce((acc, app) => {
    if (app.applicant && app.applicant.activityType) {
      const activityType = app.applicant.activityType;
      acc[activityType] = (acc[activityType] || 0) + 1;
    }
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Memuat data statistik...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50 p-4">
        <div className="text-center text-red-700 font-medium">
          <p className="text-lg mb-2">Terjadi kesalahan:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white shadow-md rounded-lg p-6 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-bps-blue mb-8 text-left">
          Dashboard Admin Sistem Magang Kabupaten Pringsewu
        </h1>

        {/* Statistik Gambaran Umum */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Pendaftar"
            value={totalApplicants}
            icon={<UserGroupIcon className="h-8 w-8 text-blue-500" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Pendaftar Diterima"
            value={acceptedApplicants}
            icon={<CheckCircleIcon className="h-8 w-8 text-green-500" />}
            color="bg-green-100"
          />
          <StatCard
            title="Pendaftar Pending"
            value={pendingApplicants}
            icon={<ClockIcon className="h-8 w-8 text-yellow-500" />}
            color="bg-yellow-100"
          />
          <StatCard
            title="Proyek Akhir Diterima"
            value={acceptedFinalProjects}
            icon={<DocumentTextIcon className="h-8 w-8 text-purple-500" />}
            color="bg-purple-100"
          />
        </div>

        {/* Bagian Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status Aplikasi Magang */}
          <SectionCard title="Status Pendaftar Magang">
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">
                  Total Pendaftar:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalApplicants}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-green-50">
                <span className="font-medium text-green-700">Diterima:</span>
                <span className="text-lg font-bold text-green-700">
                  {acceptedApplicants}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-yellow-50">
                <span className="font-medium text-yellow-700">Pending:</span>
                <span className="text-lg font-bold text-yellow-700">
                  {pendingApplicants}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-red-50">
                <span className="font-medium text-red-700">Ditolak:</span>
                <span className="text-lg font-bold text-red-700">
                  {rejectedApplicants}
                </span>
              </li>
            </ul>
          </SectionCard>

          {/* Status Proyek Akhir */}
          <SectionCard title="Status Proyek Akhir">
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">
                  Total Proyek Akhir:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalFinalProjects}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-green-50">
                <span className="font-medium text-green-700">Diterima:</span>
                <span className="text-lg font-bold text-green-700">
                  {acceptedFinalProjects}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-yellow-50">
                <span className="font-medium text-yellow-700">
                  Pending/Belum Dinilai:
                </span>
                <span className="text-lg font-bold text-yellow-700">
                  {pendingFinalProjects}
                </span>
              </li>
            </ul>
          </SectionCard>

          {/* Ikhtisar Kehadiran */}
          <SectionCard title="Rekapitulasi Kehadiran">
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">
                  Total Catatan Kehadiran:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalAttendances}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-green-50">
                <span className="font-medium text-green-700">Hadir:</span>
                <span className="text-lg font-bold text-green-700">
                  {presentAttendances}
                </span>
              </li>
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-red-50">
                <span className="font-medium text-red-700">
                  Tidak Hadir (Izin/Alpha):
                </span>
                <span className="text-lg font-bold text-red-700">
                  {absentAttendances}
                </span>
              </li>
            </ul>
          </SectionCard>

          {/* Ikhtisar Tugas */}
          <SectionCard title="Daftar Tugas Aktif">
            <ul className="space-y-2">
              <li className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">
                  Total Tugas Aktif:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {totalTasks}
                </span>
              </li>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className="py-2 px-4 rounded-lg bg-indigo-50 flex items-center justify-between"
                  >
                    <span className="font-medium text-indigo-700">
                      <ClipboardDocumentListIcon className="inline-block h-5 w-5 mr-2" />
                      {task.title}
                    </span>
                    <span className="text-sm text-indigo-600">
                      <CalendarDaysIcon className="inline-block h-4 w-4 mr-1" />
                      Deadline:{" "}
                      {new Date(task.deadline).toLocaleDateString("id-ID")}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-600 italic">Tidak ada tugas aktif.</li>
              )}
            </ul>
          </SectionCard>

          {/* Pendaftar berdasarkan Institusi */}
          <SectionCard title="Pendaftar Berdasarkan Asal Institusi">
            {Object.keys(applicantsByInstitution).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(applicantsByInstitution).map(
                  ([institution, count]) => (
                    <li
                      key={institution}
                      className="flex justify-between items-center py-2 px-4 rounded-lg bg-purple-50"
                    >
                      <span className="font-medium text-purple-700">
                        {institution}:
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {count}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-600 italic">Tidak ada data institusi.</p>
            )}
          </SectionCard>

          {/* Pendaftar berdasarkan Jenis Kegiatan */}
          <SectionCard title="Pendaftar Berdasarkan Jenis Kegiatan">
            {Object.keys(applicantsByActivityType).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(applicantsByActivityType).map(
                  ([activityType, count]) => (
                    <li
                      key={activityType}
                      className="flex justify-between items-center py-2 px-4 rounded-lg bg-orange-50"
                    >
                      <span className="font-medium text-orange-700">
                        {activityType}:
                      </span>
                      <span className="text-lg font-bold text-orange-700">
                        {count}
                      </span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <p className="text-gray-600 italic">
                Tidak ada data jenis kegiatan.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

// Komponen Stat Card yang Dapat Digunakan Kembali
const StatCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center p-6 rounded-xl shadow-lg ${color}`}>
    <div className="flex-shrink-0 mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  </div>
);

// Komponen Section Card yang Dapat Digunakan Kembali
const SectionCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default AdminDashboard;
