import React, { useState, useEffect } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  DocumentArrowUpIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  BookOpenIcon,
  ArrowRightCircleIcon, // Menambahkan ikon untuk tombol "Lengkapi Biodata"
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function InternDashboard({ userId = 4 }) {
  const [internshipApplication, setInternshipApplication] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [finalProject, setFinalProject] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const fetchWithAuth = async (url) => {
          const response = await fetch(url, { headers });
          if (!response.ok) {
            if (response.status === 401) {
              // Jika 401, bersihkan token dan arahkan ke login
              localStorage.removeItem("authToken");
              // Atau window.location.href = "/login"; jika ada halaman login
              throw new Error(
                "Sesi telah berakhir atau tidak terotentikasi. Silakan login kembali."
              );
            }
            throw new Error(
              `Gagal mengambil data dari ${url}: ${response.statusText}`
            );
          }
          return response.json();
        };

        // Fetch data aplikasi magang
        const appRes = await fetchWithAuth(
          `${API_BASE_URL}/internship-applications/me`
        );
        let userApplication = null;
        if (Array.isArray(appRes.data)) {
          userApplication =
            appRes.data.find((app) => Number(app.userId) === Number(userId)) ||
            null;
        } else if (appRes.data && typeof appRes.data === "object") {
          userApplication = appRes.data;
        }
        setInternshipApplication(userApplication);
        console.log("Status aplikasi magang:", userApplication?.status);

        // Hanya fetch data aktivitas jika status aplikasi adalah 'diterima'
        if (userApplication && userApplication.status === "diterima") {
          const [attendancesRes, tasksRes, finalProjectRes, logbooksRes] =
            await Promise.all([
              fetchWithAuth(`${API_BASE_URL}/attendances`),
              fetchWithAuth(`${API_BASE_URL}/tasks/my-tasks`),
              fetchWithAuth(`${API_BASE_URL}/final-projects`),
              fetchWithAuth(`${API_BASE_URL}/logbooks`),
            ]);

          const userAttendances = attendancesRes.data.filter(
            (att) => att.userId === userId
          );
          setAttendances(userAttendances);

          setTasks(tasksRes); // Asumsi tasks/my-tasks sudah memfilter by user

          const userFinalProject = finalProjectRes.find(
            (fp) => fp.userId === userId
          );
          setFinalProject(userFinalProject);

          const userLogbooks = logbooksRes.filter(
            (log) => log.userId === userId
          );
          setLogbooks(userLogbooks);
        } else {
          // Jika aplikasi belum diterima, kosongkan data aktivitas
          setAttendances([]);
          setTasks([]);
          setFinalProject(null);
          setLogbooks([]);
        }

        setLoading(false);
      } catch (err) {
        setError(
          err.message ||
            "Gagal memuat data. Pastikan server berjalan di localhost:3000 dan terautentikasi."
        );
        setLoading(false);
        console.error("Error fetching intern data:", err);
      }
    };

    fetchData();
  }, [userId]);

  const goToBiodata = () => {
    navigate("/dashboard/biodata");
  };

  // Calculate activity statistics
  // Perhitungan ini tetap ada karena state akan dikosongkan jika aplikasi belum diterima
  const totalAttendances = attendances.length;
  const presentCount = attendances.filter(
    (att) => att.status === "hadir"
  ).length;
  const izinCount = attendances.filter((att) => att.status === "izin").length;
  const alphaCount = attendances.filter(
    (att) => att.status === "tanpa_keterangan"
  ).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.submission && task.submission.status === "reviewed"
  ).length;
  const pendingTasks = tasks.filter((task) => !task.submission).length;
  const revisionTasks = tasks.filter(
    (task) => task.submission && task.submission.status === "revisi"
  ).length;

  const totalLogbooks = logbooks.length;
  const submittedLogbooks = logbooks.filter(
    (log) => log.status === "submitted"
  ).length;
  const draftLogbooks = logbooks.filter((log) => log.status === "draft").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Memuat data dashboard...
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
          <p className="text-sm mt-4 text-gray-600">
            Pastikan kamu masuk sebagai intern dan server backend berjalan.
          </p>
        </div>
      </div>
    );
  }

  // Kondisi untuk menampilkan rekapitulasi aktivitas
  const showActivitySummary =
    internshipApplication && internshipApplication.status === "diterima";

  return (
    <div className="min-h-screen bg-white shadow-md rounded-lg p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-bps-blue mb-8 text-left">
          Dashboard Peserta Magang
        </h1>

        {/* Status Pengajuan Magang */}
        <SectionCard title="Status Pengajuan Magang">
          {internshipApplication && internshipApplication.status ? (
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              {internshipApplication.status === "pending" && (
                <div className="flex items-center p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm w-full">
                  <ClockIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-semibold">
                      Menunggu Persetujuan
                    </p>
                    <p className="text-sm mt-1">
                      Pengajuan magang kamu sedang dalam proses peninjauan.
                      Mohon bersabar.
                    </p>
                  </div>
                </div>
              )}
              {internshipApplication.status === "diterima" && (
                <div className="flex items-center p-4 bg-green-100 text-green-800 rounded-lg shadow-sm w-full">
                  <CheckCircleIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-semibold">
                      Pengajuan Diterima! 🎉
                    </p>
                    <p className="text-sm mt-1">
                      {internshipApplication.feedback ||
                        "Selamat! Pengajuan kamu telah disetujui."}
                    </p>
                    {internshipApplication.startDate &&
                    internshipApplication.endDate ? (
                      <p className="text-sm mt-1">
                        Periode Magang:{" "}
                        {new Date(
                          internshipApplication.startDate
                        ).toLocaleDateString("id-ID")}{" "}
                        -{" "}
                        {new Date(
                          internshipApplication.endDate
                        ).toLocaleDateString("id-ID")}
                      </p>
                    ) : (
                      <p className="text-sm mt-1 text-yellow-700">
                        Periode magang belum ditentukan.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {internshipApplication.status === "ditolak" && (
                <div className="flex items-center p-4 bg-red-100 text-red-800 rounded-lg shadow-sm w-full">
                  <XCircleIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xl font-semibold">Pengajuan Ditolak</p>
                    <p className="text-sm mt-1">
                      {internshipApplication.feedback ||
                        "Maaf, pengajuan kamu tidak dapat diproses saat ini."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start p-4 bg-blue-100 text-blue-800 rounded-lg shadow-sm w-full space-y-3">
              <div className="flex items-center">
                <InformationCircleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                <p className="text-base font-medium">
                  Kamu belum mengajukan permohonan magang.
                </p>
              </div>
              <p className="text-sm">
                Silakan lengkapi biodata dan unggah berkas di halaman Biodata
                untuk mengajukan permohonan.
              </p>
              <button
                onClick={() => goToBiodata()}
                className="inline-flex items-center px-4 py-2 bg-bps-blue rounded-md text-white font-semibold text-sm hover:bg-blue-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Lengkapi Biodata{" "}
                <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
              </button>
            </div>
          )}
        </SectionCard>

        {/* --- Rekapitulasi Aktivitas Magang --- */}
        {showActivitySummary && (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-10 mb-6 text-center">
              Rekapitulasi Aktivitas Magang
            </h2>

            {/* Rekap Kehadiran */}
            <SectionCard title="Rekap Kehadiran">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Kehadiran"
                  value={totalAttendances}
                  icon={
                    <CalendarDaysIcon className="h-6 w-6 text-indigo-500" />
                  }
                  color="bg-indigo-50"
                />
                <StatCard
                  title="Hadir"
                  value={presentCount}
                  icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
                  color="bg-green-50"
                />
                <StatCard
                  title="Izin / Alpha"
                  value={izinCount + alphaCount}
                  icon={<XCircleIcon className="h-6 w-6 text-red-500" />}
                  color="bg-red-50"
                />
              </div>
              {attendances.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Detail Kehadiran Terakhir:
                  </h3>
                  <ul className="space-y-2">
                    {attendances
                      .sort(
                        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                      ) // Urutkan terbaru
                      .slice(0, 5) // Tampilkan 5 terakhir
                      .map((att) => (
                        <li
                          key={att.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 text-gray-700"
                        >
                          <div className="flex items-center">
                            {att.status === "hadir" && (
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                            )}
                            {att.status === "izin" && (
                              <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                            )}
                            {att.status === "alpha" && (
                              <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                            )}
                            <span>
                              {new Date(att.createdAt).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                          </div>
                          <span
                            className={`font-medium ${
                              att.status === "hadir"
                                ? "text-green-600"
                                : att.status === "izin"
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {att.status.toUpperCase()}
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {attendances.length === 0 && (
                <p className="text-gray-600 italic mt-4">
                  Belum ada catatan kehadiran.
                </p>
              )}
            </SectionCard>

            {/* Rekap Tugas */}
            <SectionCard title="Rekap Tugas" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Tugas"
                  value={totalTasks}
                  icon={
                    <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
                  }
                  color="bg-blue-50"
                />
                <StatCard
                  title="Selesai"
                  value={completedTasks}
                  icon={
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-500" />
                  }
                  color="bg-green-50"
                />
                <StatCard
                  title="Menunggu Review / Belum Dikerjakan"
                  value={pendingTasks + revisionTasks}
                  icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
                  color="bg-yellow-50"
                />
              </div>
              {tasks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Detail Tugas:
                  </h3>
                  <ul className="space-y-2">
                    {tasks.map((task) => (
                      <li
                        key={task.id}
                        className="p-3 rounded-lg bg-gray-50 text-gray-700 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">
                            Deadline:{" "}
                            {new Date(task.deadline).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold
                            ${
                              task.submission &&
                              task.submission.status === "reviewed"
                                ? "bg-green-200 text-green-800"
                                : task.submission &&
                                  task.submission.status === "revisi"
                                ? "bg-orange-200 text-orange-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                        >
                          {task.submission
                            ? task.submission.status === "reviewed"
                              ? "Selesai"
                              : `Revisi (${task.submission.grade})`
                            : "Belum Submit"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tasks.length === 0 && (
                <p className="text-gray-600 italic mt-4">Belum ada tugas.</p>
              )}
            </SectionCard>

            {/* Rekap Logbooks Harian */}
            <SectionCard title="Rekap Logbook Harian" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                  title="Total Logbook"
                  value={totalLogbooks}
                  icon={<BookOpenIcon className="h-6 w-6 text-purple-500" />}
                  color="bg-purple-50"
                />
                <StatCard
                  title="Telah Disubmit"
                  value={submittedLogbooks}
                  icon={<CheckCircleIcon className="h-6 w-6 text-green-500" />}
                  color="bg-green-50"
                />
                <StatCard
                  title="Draft"
                  value={draftLogbooks}
                  icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
                  color="bg-yellow-50"
                />
              </div>
              {logbooks.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Detail Logbooks Terakhir:
                  </h3>
                  <ul className="space-y-2">
                    {logbooks
                      .sort((a, b) => new Date(b.logDate) - new Date(a.logDate))
                      .slice(0, 5)
                      .map((log) => (
                        <li
                          key={log.id}
                          className="p-3 rounded-lg bg-gray-50 text-gray-700"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-800">
                              {new Date(log.logDate).toLocaleDateString(
                                "id-ID"
                              )}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold
                                ${
                                  log.status === "submitted"
                                    ? "bg-green-200 text-green-800"
                                    : "bg-yellow-200 text-yellow-800"
                                }`}
                            >
                              {log.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {log.content}
                          </p>
                        </li>
                      ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-600 italic mt-4">
                  Belum ada logbook yang dicatat.
                </p>
              )}
            </SectionCard>

            {/* Status Proyek Akhir */}
            <SectionCard title="Status Proyek Akhir" className="mt-8">
              {finalProject ? (
                <div className="flex items-center space-x-4">
                  {finalProject.status === "accepted" && (
                    <div className="flex items-center p-4 bg-green-100 text-green-800 rounded-lg shadow-sm w-full">
                      <AcademicCapIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xl font-semibold">
                          Proyek Akhir Diterima! 🎓
                        </p>
                        <p className="text-sm mt-1">
                          Nilai: {finalProject.grade}
                        </p>
                        <p className="text-sm mt-1">
                          Feedback: {finalProject.feedback}
                        </p>
                      </div>
                    </div>
                  )}
                  {finalProject.status === "pending" && (
                    <div className="flex items-center p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow-sm w-full">
                      <ClockIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xl font-semibold">
                          Proyek Akhir Menunggu Review
                        </p>
                        <p className="text-sm mt-1">
                          Proyek akhir kamu sedang dalam proses peninjauan.
                        </p>
                      </div>
                    </div>
                  )}
                  {finalProject.status === "rejected" && (
                    <div className="flex items-center p-4 bg-red-100 text-red-800 rounded-lg shadow-sm w-full">
                      <XCircleIcon className="h-8 w-8 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-xl font-semibold">
                          Proyek Akhir Ditolak
                        </p>
                        <p className="text-sm mt-1">
                          Feedback:{" "}
                          {finalProject.feedback ||
                            "Silakan periksa kembali proyek kamu."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center p-4 bg-blue-100 text-blue-800 rounded-lg shadow-sm">
                  <DocumentArrowUpIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                  <p className="text-base font-medium">
                    Kamu belum mengunggah proyek akhir.
                  </p>
                </div>
              )}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center p-4 rounded-xl shadow-md ${color}`}>
    <div className="flex-shrink-0 mr-3">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// Reusable Section Card Component
const SectionCard = ({ title, children, className }) => (
  <div
    className={`bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200 ${
      className || ""
    }`}
  >
    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default InternDashboard;
