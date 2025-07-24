import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AcademicCapIcon } from "@heroicons/react/24/outline"; // Menambahkan ikon

function AdminGraduationManage() {
  // Dummy data peserta magang dengan status laporan dan kelulusan
  const [internsGraduationData, setInternsGraduationData] = useState(() => {
    const savedGraduationData = localStorage.getItem("adminGraduationData");
    if (savedGraduationData) {
      return JSON.parse(savedGraduationData);
    }
    return [
      {
        id: "int001",
        name: "Budi Santoso",
        email: "budi.santoso@example.com",
        finalReportStatus: "Disetujui", // Ubah dari 'Lulus' ke 'Disetujui'
        overallGraduationStatus: "Belum Lulus", // Status kelulusan akhir: Belum Lulus, Lulus
        completionDate: null, // Tanggal kelulusan
        notes: "", // Catatan admin
      },
      {
        id: "int002",
        name: "Siti Aminah",
        email: "siti.aminah@example.com",
        finalReportStatus: "Perlu Revisi",
        overallGraduationStatus: "Belum Lulus",
        completionDate: null,
        notes: "",
      },
      {
        id: "int003",
        name: "Dedi Kurniawan",
        email: "dedi.kurniawan@example.com",
        finalReportStatus: "Belum Diperiksa",
        overallGraduationStatus: "Belum Lulus",
        completionDate: null,
        notes: "",
      },
      {
        id: "int004",
        name: "Nurul Hidayah",
        email: "nurul.hidayah@example.com",
        finalReportStatus: "Disetujui", // Ubah dari 'Lulus' ke 'Disetujui'
        overallGraduationStatus: "Lulus",
        completionDate: "2025-07-01",
        notes: "Lulus dengan nilai sangat baik.",
      },
    ];
  });

  // State untuk modal Manajemen Kelulusan
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [reviewingIntern, setReviewingIntern] = useState(null); // Peserta yang sedang di-review
  const [newGraduationStatus, setNewGraduationStatus] = useState("");
  // Efek untuk menyimpan data kelulusan ke localStorage
  useEffect(() => {
    localStorage.setItem(
      "adminGraduationData",
      JSON.stringify(internsGraduationData)
    );
  }, [internsGraduationData]);

  // --- Manajemen Kelulusan ---
  function openGraduationModal(intern) {
    setReviewingIntern(intern);
    setNewGraduationStatus(intern.overallGraduationStatus); // Set status default
    setIsGraduationModalOpen(true);
  }

  function closeGraduationModal() {
    setIsGraduationModalOpen(false);
    setReviewingIntern(null);
    setNewGraduationStatus("");
  }

  const handleUpdateGraduationStatus = (e) => {
    e.preventDefault();
    if (!reviewingIntern) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin mengubah status kelulusan ${reviewingIntern.name} menjadi "${newGraduationStatus}"?`
      )
    ) {
      const updatedData = internsGraduationData.map((intern) =>
        intern.id === reviewingIntern.id
          ? {
              ...intern,
              overallGraduationStatus: newGraduationStatus,
              // Ubah kondisi di sini: kelulusan terjadi jika laporan akhir 'Disetujui' DAN status kelulusan diubah jadi 'Lulus'
              completionDate:
                newGraduationStatus === "Lulus" &&
                reviewingIntern.finalReportStatus === "Disetujui"
                  ? new Date().toISOString().slice(0, 10)
                  : null,
            }
          : intern
      );
      setInternsGraduationData(updatedData);
      alert(
        `Status kelulusan ${reviewingIntern.name} berhasil diubah menjadi ${newGraduationStatus}.`
      );
      closeGraduationModal();
    }
  };

  // Filter untuk melihat peserta berdasarkan status
  const [filterStatus, setFilterStatus] = useState("All"); // 'All', 'Belum Lulus', 'Lulus'

  const filteredInterns = internsGraduationData.filter((intern) => {
    if (filterStatus === "All") return true;
    return intern.overallGraduationStatus === filterStatus;
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Manajemen Kelulusan
      </h2>
      <p className="text-gray-700 mb-6">
        Ubah status kelulusan akhir peserta magang setelah semua persyaratan
        terpenuhi.
      </p>

      {/* Filter Status Kelulusan */}
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="filterStatus" className="text-gray-700 font-bold">
          Tampilkan:
        </label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
        >
          <option value="All">Semua Peserta</option>
          <option value="Belum Lulus">Belum Lulus</option>
          <option value="Lulus">Sudah Lulus</option>
        </select>
      </div>

      {/* Daftar Peserta */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Nama Peserta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Laporan Akhir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Status Kelulusan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Tgl. Kelulusan
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInterns.map((intern) => (
              <tr
                key={intern.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {intern.name}
                </td>
                <td className="px-6 py-4 text-sm break-words">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      intern.finalReportStatus === "Disetujui"
                        ? "bg-green-100 text-green-800" // Ubah ini
                        : intern.finalReportStatus === "Perlu Revisi"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {intern.finalReportStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm break-words">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      intern.overallGraduationStatus === "Lulus"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {intern.overallGraduationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {intern.completionDate || "-"}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openGraduationModal(intern)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Atur Kelulusan"
                  >
                    <AcademicCapIcon className="h-5 w-5 inline-block" /> Atur
                  </button>
                </td>
              </tr>
            ))}
            {filteredInterns.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada peserta magang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Manajemen Kelulusan */}
      <Transition appear show={isGraduationModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={closeGraduationModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Manajemen Kelulusan: {reviewingIntern?.name}
                  </Dialog.Title>

                  <div className="mb-4 text-gray-700">
                    <p>
                      <strong>Email:</strong> {reviewingIntern?.email}
                    </p>
                    <p>
                      <strong>Status Laporan Akhir:</strong>{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold
                        ${
                          reviewingIntern?.finalReportStatus === "Disetujui"
                            ? "bg-green-100 text-green-800" // Ubah ini
                            : reviewingIntern?.finalReportStatus ===
                              "Perlu Revisi"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {reviewingIntern?.finalReportStatus}
                      </span>
                    </p>
                    {reviewingIntern?.finalReportStatus !== "Disetujui" && ( // Ubah ini
                      <p className="text-sm text-red-500 mt-1">
                        Laporan akhir belum Disetujui. Peserta tidak dapat
                        diluluskan.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleUpdateGraduationStatus}>
                    <div className="mb-4">
                      <label
                        htmlFor="newGraduationStatus"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Status Kelulusan Akhir:
                      </label>
                      <select
                        id="newGraduationStatus"
                        value={newGraduationStatus}
                        onChange={(e) => setNewGraduationStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        // Hanya bisa diubah jika laporan akhir sudah Disetujui
                        disabled={
                          reviewingIntern?.finalReportStatus !== "Disetujui"
                        } // Ubah ini
                      >
                        <option value="Belum Lulus">Belum Lulus</option>
                        <option value="Lulus">Lulus</option>
                      </select>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeGraduationModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200
                            ${
                              reviewingIntern?.finalReportStatus !== "Disetujui"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`} // Ubah ini
                        // Tombol submit hanya aktif jika laporan akhir sudah Disetujui
                        disabled={
                          reviewingIntern?.finalReportStatus !== "Disetujui"
                        } // Ubah ini
                      >
                        Simpan Status
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default AdminGraduationManage;
