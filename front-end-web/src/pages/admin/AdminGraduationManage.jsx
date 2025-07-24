import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"; // Menambahkan ikon

function AdminGraduationManage() {
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [reviewingIntern, setReviewingIntern] = useState(null); // Peserta yang sedang di-review
  const [newGraduationStatus, setNewGraduationStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [finalProjectsRes, certificatesRes] = await Promise.all([
          fetch("http://localhost:3000/final-projects/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/certificates", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const finalProjectsData = await finalProjectsRes.json();
        const certificatesData = await certificatesRes.json();

        // Gabungkan data berdasarkan userId
        const acceptedProjects = finalProjectsData.data.filter(
          (item) => item.status === "accepted"
        );

        const combined = acceptedProjects.map((project) => {
          const cert = certificatesData.find(
            (c) => c.userId === project.userId && c.status === "signed"
          );
          return {
            id: project.user.id,
            name: project.user.name,
            email: project.user.email,
            laporan_status: project.status,
            finalReportStatus: project.status, // ⬅️ ini ditambahkan
            laporan_path: project.filePath,
            isGraduated: !!cert,
            graduatedAt: cert?.signedAt || null,
            certificateId: cert?.id,
          };
        });

        setInterns(combined);
        setLoading(false);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const toggleGraduationStatus = async (userId, isGraduated) => {
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isGraduated: !isGraduated }),
      });

      if (res.ok) {
        setInterns((prev) =>
          prev.map((i) =>
            i.id === userId ? { ...i, isGraduated: !isGraduated } : i
          )
        );
      } else {
        console.error("Gagal memperbarui status kelulusan.");
      }
    } catch (err) {
      console.error("Error patch graduation:", err);
    }
  };

  const handleSubmitGraduation = async (e) => {
    e.preventDefault();
    if (!reviewingIntern) return;

    await toggleGraduationStatus(
      reviewingIntern.id,
      reviewingIntern.isGraduated
    );
    closeGraduationModal();
  };

  if (loading) return <p>Memuat data...</p>;

  // --- Manajemen Kelulusan ---
  function openGraduationModal(intern) {
    if (!intern) return;
    setReviewingIntern(intern);
    setNewGraduationStatus(intern.isGraduated ? "Lulus" : "Belum Lulus");
    setIsGraduationModalOpen(true);
  }

  function closeGraduationModal() {
    setIsGraduationModalOpen(false);
    setReviewingIntern(null);
    setNewGraduationStatus("");
  }

  const filteredInterns = interns.filter((intern) => {
    if (filterStatus === "Lulus") return intern.isGraduated === true;
    if (filterStatus === "Belum Lulus") return intern.isGraduated === false;
    return true;
  });

  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInterns.slice(indexOfFirstItem, indexOfLastItem);

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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Nama Peserta
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Laporan Akhir
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Status Kelulusan
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Tgl. Kelulusan
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((intern) => (
              <tr
                key={intern.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150 text-center"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {intern.name}
                </td>
                <td className="px-6 py-4 text-sm break-words text-center">
                  <div className="flex items-center gap-2 items-center justify-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${
                          intern.laporan_status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : intern.laporan_status === "revisi"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {/* {intern.laporan_status} */}
                      {/* kalo accepted = Disetujui */}
                      {/* kalo revisi = Perlu Revisi */}
                      {intern.laporan_status === "accepted"
                        ? "Disetujui"
                        : intern.laporan_status === "revisi"
                        ? "Perlu Revisi"
                        : intern.laporan_status === "review"
                        ? "Reviewed"
                        : "Belum Dikirim"}
                    </span>

                    {/* Tampilkan ikon jika laporan bisa dilihat */}
                    {intern.laporan_status === "accepted" &&
                      intern.laporan_path && (
                        <a
                          href={`http://localhost:3000/${intern.laporan_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bps-blue hover:text-bps-dark"
                          title="Lihat Laporan"
                        >
                          <EyeIcon className="h-5 w-5 inline-block" />
                        </a>
                      )}
                  </div>
                </td>

                <td className="px-6 py-4 text-sm break-words">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      intern.isGraduated === "Lulus"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {intern.isGraduated ? "Lulus" : "Belum Lulus"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {intern.graduatedAt && (
                    <p className="text-sm text-gray-500 text-center">
                      {new Date(intern.graduatedAt).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  )}
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
        {/* Kontrol Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 inline-block" />
          </button>
          <span className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
          >
            <ChevronRightIcon className="h-5 w-5 inline-block" />
          </button>
        </div>
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
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${
                          reviewingIntern?.finalReportStatus === "accepted"
                            ? "bg-green-100 text-green-800" // Ubah ini
                            : reviewingIntern?.finalReportStatus === "revisi"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {/* {reviewingIntern?.finalReportStatus} */}
                        {reviewingIntern?.finalReportStatus === "accepted"
                          ? "Disetujui"
                          : reviewingIntern?.finalReportStatus === "revisi"
                          ? "Perlu Revisi"
                          : reviewingIntern?.finalReportStatus === "review"
                          ? "Reviewed"
                          : "Belum Dikirim"}
                      </span>
                    </p>
                    {reviewingIntern?.finalReportStatus !== "accepted" && (
                      <p className="text-sm text-red-500 mt-1">
                        Laporan akhir belum Disetujui. Peserta tidak dapat
                        diluluskan.
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmitGraduation}>
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
                        disabled={
                          reviewingIntern?.finalReportStatus !== "accepted"
                        }
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
                              reviewingIntern?.finalReportStatus !== "accepted"
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
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
