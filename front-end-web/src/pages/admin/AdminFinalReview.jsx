import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

function AdminFinalReviewsPage() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [finalReports, setFinalReports] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingReport, setReviewingReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewGrade, setReviewGrade] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const token = localStorage.getItem("authToken");

  // Fetch laporan akhir peserta
  useEffect(() => {
    const fetchFinalReports = async () => {
      try {
        const res = await fetch(`${baseUrl}/final-projects/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setFinalReports(data.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil laporan akhir:", err);
      }
    };
    if (token) fetchFinalReports();
  }, [token]);

  // --- Search, Filter, Pagination ---
  const filteredFinalReports = finalReports.filter((app) => {
    const matchesSearchTerm =
      app.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter =
      statusFilter === "All" || app.status === statusFilter;
    return matchesSearchTerm && matchesStatusFilter;
  });

  const totalPages = Math.ceil(filteredFinalReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFinalReports = filteredFinalReports.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Modal logic
  function openReviewModal(report) {
    setReviewingReport(report);
    setReviewStatus(
      report.status === "submitted"
        ? "Belum Diperiksa"
        : report.status === "accepted"
        ? "Disetujui"
        : report.status === "revisi"
        ? "Perlu Revisi"
        : report.status
    );
    setReviewNotes(report.feedback || "");
    setReviewGrade(
      report.grade !== null && report.grade !== undefined ? report.grade : ""
    );
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewingReport(null);
    setReviewStatus("");
    setReviewGrade("");
    setReviewNotes("");
  }

  // Submit review ke backend
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingReport) return;
    try {
      const res = await fetch(
        `${baseUrl}/final-projects/${reviewingReport.id}/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status:
              reviewStatus === "Disetujui"
                ? "accepted"
                : reviewStatus === "Perlu Revisi"
                ? "revisi"
                : "submitted",
            feedback: reviewNotes,
            grade: reviewGrade === "" ? null : Number(reviewGrade),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setFinalReports(
          finalReports.map((report) =>
            report.id === reviewingReport.id ? { ...report, ...data } : report
          )
        );
        alert(`Status laporan "${reviewingReport.title}" berhasil diubah.`);
        closeReviewModal();
      } else {
        alert(data.message || "Gagal menyimpan review.");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menyimpan review.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Review Tugas Akhir
      </h2>
      <p className="text-gray-700 mb-6">
        Periksa dan berikan penilaian akhir untuk laporan/proyek akhir magang
        peserta.
      </p>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama pendaftar..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-48"
        >
          <option value="All">Semua Status</option>
          <option value="submitted">Belum Diperiksa</option>
          <option value="accepted">Disetujui</option>
          <option value="revisi">Perlu Revisi</option>
        </select>
      </div>

      {/* Daftar Laporan Akhir */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul Laporan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peserta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Unggah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentFinalReports.map((report) => (
              <tr
                key={report.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {report.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">
                  {report.user?.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {report.submittedAt
                    ? new Date(report.submittedAt).toLocaleDateString("id-ID")
                    : "-"}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      report.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : report.status === "revisi"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {report.status === "accepted"
                      ? "Disetujui"
                      : report.status === "revisi"
                      ? "Perlu Revisi"
                      : "Belum Diperiksa"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openReviewModal(report)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Review Laporan"
                  >
                    <EyeIcon className="h-5 w-5 inline-block" /> Review
                  </button>
                </td>
              </tr>
            ))}
            {currentFinalReports.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Belum ada laporan akhir untuk diperiksa.
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

      {/* Modal Review Laporan Akhir */}
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Review Laporan: {reviewingReport?.title}
                  </Dialog.Title>

                  <div className="mb-4 text-gray-700">
                    <p>
                      <strong>Peserta:</strong> {reviewingReport?.user?.name}
                    </p>
                    <p>
                      <strong>Tanggal Unggah:</strong>{" "}
                      {reviewingReport?.submittedAt
                        ? new Date(
                            reviewingReport.submittedAt
                          ).toLocaleDateString("id-ID")
                        : "-"}
                    </p>
                    <p className="mt-2">
                      <strong>File Laporan:</strong>{" "}
                      {reviewingReport?.filePath ? (
                        <a
                          href={`${baseUrl}/${reviewingReport.filePath.replace(
                            /\\/g,
                            "/"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {reviewingReport.title}
                        </a>
                      ) : (
                        <span className="text-gray-500">Tidak ada file.</span>
                      )}
                    </p>
                    {reviewingReport?.feedback && (
                      <p className="mt-2 text-red-600 text-sm">
                        Catatan Feedback: {reviewingReport.feedback}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label
                        htmlFor="reviewStatus"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Status Penilaian:
                      </label>
                      <select
                        id="reviewStatus"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                      >
                        <option value="Belum Diperiksa">Belum Diperiksa</option>
                        <option value="Perlu Revisi">Perlu Revisi</option>
                        <option value="Disetujui">Disetujui</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="reviewGrade"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Nilai (Grade):
                      </label>
                      <input
                        type="number"
                        id="reviewGrade"
                        value={reviewGrade}
                        onChange={(e) => setReviewGrade(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        min={0}
                        max={100}
                        step={1}
                        placeholder="Masukkan nilai (0-100)"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="reviewNotes"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Catatan Review/Revisi:
                      </label>
                      <textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="4"
                        placeholder="Tulis catatan atau instruksi revisi di sini..."
                      ></textarea>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeReviewModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Simpan Penilaian
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

export default AdminFinalReviewsPage;
