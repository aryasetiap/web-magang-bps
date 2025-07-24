import React, { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  XCircleIcon,
  InformationCircleIcon, // Untuk pesan jika tidak ada tugas
} from "@heroicons/react/24/outline"; // Menyesuaikan ikon yang digunakan

function StaffDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const fetchWithAuth = async (url) => {
          const response = await fetch(url, { headers });
          if (!response.ok) {
            if (response.status === 401) {
              localStorage.removeItem("authToken"); // Bersihkan token kadaluarsa
              throw new Error(
                "Sesi Anda telah berakhir atau tidak terotentikasi. Silakan login kembali."
              );
            }
            throw new Error(
              `Gagal mengambil data dari ${url}: ${response.statusText}`
            );
          }
          return response.json();
        };

        const tasksRes = await fetchWithAuth(`${baseUrl}/tasks`);
        // Pastikan Anda mengakses properti 'data' jika respons API membungkusnya dalam { "data": [...] }
        setTasks(tasksRes.data);

        setLoading(false);
      } catch (err) {
        setError(
          err.message ||
            "Gagal memuat data. Pastikan server berjalan di localhost:3000 dan Anda terautentikasi."
        );
        setLoading(false);
        console.error("Error fetching staff data:", err);
      }
    };

    fetchData();
  }, []);

  // Hitung statistik tugas yang tersedia dari data endpoint /tasks
  const totalTasks = tasks.length;
  // Menghitung tugas yang sudah melewati deadline saat ini
  const overdueTasks = tasks.filter(
    (task) => new Date(task.deadline) < new Date()
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">
          Memuat data dashboard Staff...
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
            Pastikan Anda masuk sebagai Staff dan server backend berjalan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white rounded-lg shadow-lg p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-bps-blue mb-8 text-left">
          Dashboard Staff
        </h1>
        <p className="text-gray-700 mb-6">
          Di sini Anda dapat mengelola penugasan untuk peserta magang.
        </p>

        {/* Overview Tugas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard
            title="Total Tugas Diberikan"
            value={totalTasks}
            icon={
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
            }
            color="bg-blue-100"
          />
          <StatCard
            title="Tugas Terlambat"
            value={overdueTasks}
            icon={<XCircleIcon className="h-8 w-8 text-red-500" />}
            color="bg-red-100"
          />
          {/* Stat card untuk tugas selesai/menunggu review dihilangkan karena data tidak tersedia */}
        </div>

        {/* Daftar Detail Tugas */}
        <SectionCard title="Daftar Tugas yang Diberikan">
          {tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Judul Tugas
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Deskripsi
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Deadline
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Dibuat Oleh (ID)
                    </th>
                    {/* Kolom status terakhir dihilangkan karena data submission tidak tersedia di sini */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks
                    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline)) // Urutkan berdasarkan deadline terdekat
                    .map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {task.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p className="truncate w-48">{task.description}</p>{" "}
                          {/* truncate long descriptions */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(task.deadline).toLocaleDateString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.createdBy || "N/A"}{" "}
                          {/* Menampilkan ID pembuat */}
                        </td>
                        {/* Data status terakhir dihilangkan */}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center p-4 bg-blue-100 text-blue-800 rounded-lg shadow-sm">
              <InformationCircleIcon className="h-6 w-6 mr-3" />
              <p className="text-base font-medium">
                Belum ada tugas yang diberikan.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

// Reusable Stat Card Component (tidak ada perubahan)
const StatCard = ({ title, value, icon, color }) => (
  <div className={`flex items-center p-6 rounded-xl shadow-lg ${color}`}>
    <div className="flex-shrink-0 mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
  </div>
);

// Reusable Section Card Component (tidak ada perubahan)
const SectionCard = ({ title, children, className }) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-lg border border-gray-200 ${
      className || ""
    }`}
  >
    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default StaffDashboard;
