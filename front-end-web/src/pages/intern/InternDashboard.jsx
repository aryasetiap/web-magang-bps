import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";

function InternDashboard() {
  const navigate = useNavigate();

  // State untuk menyimpan data tugas dan logbook dari localStorage
  const [internAssignments, setInternAssignments] = useState([]);
  const [internLogbookEntries, setInternLogbookEntries] = useState([]);

  useEffect(() => {
    // Simulasi memuat data tugas dan logbook dari localStorage
    // Di aplikasi nyata, ini akan diambil dari backend untuk intern yang sedang login
    const loadedAssignments = JSON.parse(
      localStorage.getItem("internAssignmentsData") || "[]"
    ); // Asumsi ada key ini dari AktivitasPage
    setInternAssignments(loadedAssignments);

    const today = new Date().toISOString().split("T")[0];
    const loadedLogbooks = JSON.parse(
      localStorage.getItem("logbookEntries_" + today) || "[]"
    ); // Logbook untuk hari ini
    setInternLogbookEntries(loadedLogbooks);
  }, []);

  // Hitung statistik penugasan
  const totalAssignmentsGiven = internAssignments.length;
  const totalCompletedAssignments = internAssignments.filter(
    (assign) => assign.status === "Selesai"
  ).length;

  const goToBiodata = () => {
    navigate("/dashboard/biodata");
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-4">
        Selamat Datang di Dashboard Peserta Magang!
      </h2>
      <p className="text-gray-700 mb-6">
        Di sini kamu dapat melihat ringkasan aktivitas magang kamu.
      </p>

      <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">
          Panduan Awal: Lengkapi Biodata Diri
        </h3>
        <p className="text-blue-700">
          Sebelum memulai, pastikan kamu telah melengkapi semua informasi
          biodata diri agar kami dapat memproses data magangmu dengan benar.
        </p>
        <button
          onClick={goToBiodata}
          className="mt-4 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Lengkapi Biodata Sekarang
        </button>
      </div>

      {/* Bagian Rekap Penugasan */}
      <div className="p-6 border rounded-lg bg-yellow-50 mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <DocumentChartBarIcon className="h-7 w-7 mr-2" /> Rekap Aktivitas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">Tugas Diberikan:</p>
            <p className="text-2xl font-bold text-yellow-700">
              {totalAssignmentsGiven} Tugas
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">Tugas Diselesaikan:</p>
            <p className="text-2xl font-bold text-yellow-700">
              {totalCompletedAssignments} Tugas
            </p>
          </div>
        </div>

        <h4 className="font-semibold text-lg text-gray-800 mt-6 mb-3">
          Tugas Belum Selesai (Beberapa):
        </h4>
        {internAssignments.filter((a) => a.status !== "Selesai").length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-gray-700 max-h-40 overflow-y-auto">
            {internAssignments
              .filter((a) => a.status !== "Selesai")
              .slice(0, 5)
              .map(
                (
                  assign // Tampilkan maksimal 5
                ) => (
                  <li key={assign.id}>
                    {assign.title} (Deadline: {assign.deadline})
                  </li>
                )
              )}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">
            Semua tugas telah diselesaikan atau belum ada tugas.
          </p>
        )}

        <h4 className="font-semibold text-lg text-gray-800 mt-6 mb-3">
          Logbook Hari Ini (Terakhir):
        </h4>
        {internLogbookEntries.length > 0 ? (
          <p className="text-gray-700 text-sm italic">
            "
            {internLogbookEntries[
              internLogbookEntries.length - 1
            ].activity.substring(0, 100)}
            ..." {/* Ambil entri terakhir */}
            <span className="ml-2 text-gray-500">
              ({internLogbookEntries[internLogbookEntries.length - 1].time})
            </span>
          </p>
        ) : (
          <p className="text-gray-600 text-sm">
            Belum ada entri logbook hari ini.
          </p>
        )}
        <p className="text-sm text-gray-600 mt-2">
          Lihat detail lengkap di halaman{" "}
          <a
            href="/dashboard/aktivitas"
            className="text-bps-blue hover:underline font-semibold"
          >
            Aktivitas Harian
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default InternDashboard;
