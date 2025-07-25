import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { formatDate } from "../../utils/formatDateTime"; // Assuming you have a utility for formatting dates

function AdminApplicantsPage() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [applicants, setApplicants] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingApplicant, setReviewingApplicant] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await fetch(`${baseUrl}/internship-applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.data)) {
          const transformedApplicants = data.data.map((item) => ({
            id: item.id,
            name: item.applicant?.namaLengkap || item.applicant?.name || "-",
            email: item.applicant?.email || "-",
            nimNisn: item.applicant?.nimNisn || "-",
            asalInstitusi: item.applicant?.asalInstitusi || "-",
            jurusanProdi: item.applicant?.jurusanProdi || "-",
            alamat: item.applicant?.alamat || "-",
            noTelepon: item.applicant?.nomorTelepon || "-",
            educationStatus: item.applicant?.educationStatus || "-",
            activityType: item.applicant?.activityType || "-",
            activityStart: item.applicant?.activityStart || "-",
            activityEnd: item.applicant?.activityEnd || "-",
            status:
              item.status === "pending"
                ? "Pending"
                : item.status === "diterima"
                ? "Accepted"
                : "Rejected",
            documents: {
              cv: item.cvPath
                ? {
                    name: "CV.pdf",
                    url: `${baseUrl}/${item.cvPath.replace(/\\/g, "/")}`,
                  }
                : null,
              transkrip: item.transcriptPath
                ? {
                    name: "Transkrip.pdf",
                    url: `${baseUrl}/${item.transcriptPath.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }
                : null,
              suratPermohonan: item.requestLetterPath
                ? {
                    name: "Surat Permohonan.pdf",
                    url: `${baseUrl}/${item.requestLetterPath.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }
                : null,
            },
            reviewNotes: item.feedback || "",
          }));
          setApplicants(transformedApplicants);
        }
      } catch (err) {
        console.error("Gagal mengambil data pendaftar:", err);
      }
    };

    fetchApplicants();
  }, [token]);

  // --- Search, Filter, Pagination ---
  const filteredApplicants = applicants.filter((app) => {
    const matchName = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All" ? true : app.status === statusFilter;
    return matchName && matchStatus;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApplicants = filteredApplicants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // --- Review Pendaftar ---
  function openReviewModal(applicant) {
    setReviewingApplicant(applicant);
    setReviewNotes(applicant.reviewNotes || ""); // Isi catatan jika sudah ada
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewingApplicant(null);
    setReviewNotes("");
  }

  // Ubah fungsi handleUpdateApplicantStatus
  const handleUpdateApplicantStatus = async (status) => {
    if (!reviewingApplicant) return;

    const confirm = window.confirm(
      `Apakah Anda yakin ingin mengubah status pendaftar ${reviewingApplicant.name} menjadi ${status}?`
    );

    if (!confirm) return;

    // Konversi status ke format backend
    const statusMap = {
      Accepted: "diterima",
      Rejected: "ditolak",
      Pending: "pending",
    };
    const statusToSend = statusMap[status];

    try {
      const res = await fetch(
        `${baseUrl}/internship-applications/${reviewingApplicant.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: statusToSend,
            feedback: reviewNotes,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setApplicants((prev) =>
          prev.map((app) =>
            app.id === reviewingApplicant.id
              ? { ...app, status, reviewNotes }
              : app
          )
        );
        alert(
          `Status pendaftar ${reviewingApplicant.name} berhasil diubah menjadi ${status}.`
        );
        closeReviewModal();
      } else {
        throw new Error(
          data.message || "Terjadi kesalahan saat mengubah status."
        );
      }
    } catch (error) {
      console.error("PATCH error:", error);
      alert("Terjadi kesalahan saat mengubah status. Coba lagi nanti.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Manajemen Pendaftar
      </h2>
      <p className="text-gray-700 mb-6">
        Verifikasi pendaftaran calon peserta magang dan tentukan status
        penerimaan.
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
          className="border rounded-lg p-3 w-full md:w-48"
        >
          <option value="All">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Diterima</option>
          <option value="Rejected">Ditolak</option>
        </select>
      </div>

      {/* Daftar Pendaftar */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Institusi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jurusan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Kegiatan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Mulai - Selesai
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
            {currentApplicants.map((applicant) => (
              <tr
                key={applicant.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {applicant.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {applicant.asalInstitusi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {applicant.jurusanProdi}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {applicant.activityType}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(applicant.activityStart)} -{" "}
                  {formatDate(applicant.activityEnd)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      applicant.status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : applicant.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {applicant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openReviewModal(applicant)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Review Pendaftar"
                  >
                    <EyeIcon className="h-5 w-5 inline-block" /> Review
                  </button>
                </td>
              </tr>
            ))}
            {currentApplicants.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                  Belum ada pendaftar baru.
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

      {/* Modal Review Pendaftar */}
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
                    Review Pendaftar: {reviewingApplicant?.name}
                  </Dialog.Title>

                  <div className="mb-4 text-gray-700">
                    <p>
                      <strong>Email:</strong> {reviewingApplicant?.email}
                    </p>
                    <p>
                      <strong>NIM/NISN:</strong> {reviewingApplicant?.nimNisn}
                    </p>
                    <p>
                      <strong>Institusi:</strong>{" "}
                      {reviewingApplicant?.asalInstitusi}
                    </p>
                    <p>
                      <strong>Jurusan:</strong>{" "}
                      {reviewingApplicant?.jurusanProdi}
                    </p>
                    <p>
                      <strong>Alamat:</strong> {reviewingApplicant?.alamat}
                    </p>
                    <p>
                      <strong>No. Telepon:</strong>{" "}
                      {reviewingApplicant?.noTelepon}
                    </p>
                    <p>
                      <strong>Status Pendidikan:</strong>{" "}
                      {reviewingApplicant?.educationStatus}
                    </p>
                    <p>
                      <strong>Jenis Kegiatan :</strong>{" "}
                      {reviewingApplicant?.activityType}
                    </p>
                    <p>
                      <strong>Tanggal Mulai - Selesai:</strong>{" "}
                      {formatDate(reviewingApplicant?.activityStart)} -{" "}
                      {formatDate(reviewingApplicant?.activityEnd)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Dokumen Pendaftar:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      <li>
                        CV:{" "}
                        {reviewingApplicant?.documents?.cv ? (
                          <a
                            href={reviewingApplicant.documents.cv.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {reviewingApplicant.documents.cv.name}
                          </a>
                        ) : (
                          "Tidak ada"
                        )}
                      </li>
                      <li>
                        Transkrip/Rapor:{" "}
                        {reviewingApplicant?.documents?.transkrip ? (
                          <a
                            href={reviewingApplicant.documents.transkrip.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {reviewingApplicant.documents.transkrip.name}
                          </a>
                        ) : (
                          "Tidak ada"
                        )}
                      </li>
                      <li>
                        Surat Permohonan:{" "}
                        {reviewingApplicant?.documents?.suratPermohonan ? (
                          <a
                            href={
                              reviewingApplicant.documents.suratPermohonan.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {reviewingApplicant.documents.suratPermohonan.name}
                          </a>
                        ) : (
                          "Tidak ada"
                        )}
                      </li>
                    </ul>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="reviewNotes"
                      className="block text-gray-700 text-sm font-bold mb-2"
                    >
                      Catatan Review:
                    </label>
                    <textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                      rows="3"
                      placeholder="Tulis catatan review Anda di sini..."
                    ></textarea>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    {reviewingApplicant?.status === "Pending" && (
                      <>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                          onClick={() =>
                            handleUpdateApplicantStatus("Rejected")
                          }
                        >
                          <XCircleIcon className="h-5 w-5 mr-2" /> Tolak
                        </button>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                          onClick={() =>
                            handleUpdateApplicantStatus("Accepted")
                          }
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" /> Terima
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeReviewModal}
                    >
                      Tutup
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default AdminApplicantsPage;
