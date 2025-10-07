import React, { Fragment, useEffect, useState } from "react";
import { fetchPresensiData } from "../../../utils/attendance";
import { formatTime } from "../../../utils/formatDateTime";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  PrinterIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import AlertDialog from "../../../components/AlertDialog";

function PresencesRecap() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModeId, setEditModeId] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [filterStatus, setFilterStatus] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5; // Jumlah item per halaman
  const token = localStorage.getItem("authToken");

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPresensiData(token);
      console.log("recapData fetched:", data);
      setRecapData(data);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const openValidationModal = (attendance) => {
    setSelectedAttendance(attendance);
    setEditModeId(attendance.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedAttendance(null);
    setEditModeId(null);
    setShowModal(false);
  };

  const validateAttendance = async (attendanceId, newStatus) => {
    try {
      const res = await fetch(
        `${baseUrl}/attendances/${attendanceId}/validate`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Gagal memvalidasi presensi");

      setRecapData((prev) =>
        prev.map((r) =>
          r.id === attendanceId ? { ...r, status: newStatus } : r
        )
      );
      closeModal();
      // alert("Status kehadiran berhasil diperbarui.");
      setAlert({
        isOpen: true,
        title: "Berhasil!",
        message: "Status kehadiran berhasil diperbarui.",
        type: "success",
      });
    } catch (err) {
      // alert("Gagal memperbarui status kehadiran: " + err.message);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: "Gagal memperbarui status kehadiran: " + err.message,
        type: "error",
      });
    }
  };

  const handlePrintAll = async () => {
    if (!startDate || !endDate) {
      // alert("Harap isi tanggal awal dan akhir.");
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: "Harap isi tanggal awal dan akhir terlebih dahulu.",
        type: "error",
      });
      return;
    }

    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
      });

      if (institutionFilter) {
        query.append("institution", institutionFilter);
      }

      const res = await fetch(
        `${baseUrl}/attendances/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mencetak rekap PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rekap-presensi-${startDate}-${endDate}.pdf`;
      if (institutionFilter) {
        a.download = `rekap-presensi-${startDate}-${endDate}-${institutionFilter}.pdf`;
      }

      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // alert("Gagal mencetak PDF: " + err.message);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: "Gagal mencetak PDF: " + err.message,
        type: "error",
      });
    }
  };

  const handlePrintIndividual = async (userId) => {
    if (!startDate || !endDate) {
      // alert("Harap isi tanggal awal dan akhir.");
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: "Harap isi tanggal awal dan akhir terlebih dahulu.",
        type: "error",
      });
      return;
    }

    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
      });

      const res = await fetch(
        `${baseUrl}/attendances/${userId}/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mencetak PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `presensi-intern-${userId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // alert("Gagal mencetak PDF: " + err.message);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: "Gagal mencetak PDF: " + err.message,
        type: "error",
      });
    }
  };

  const filteredData = recapData.filter((row) => {
    const isStatusMatch = filterStatus ? row.status === filterStatus : true;
    const isInstitutionMatch = institutionFilter
      ? row.institution?.toLowerCase().includes(institutionFilter.toLowerCase())
      : true;
    const attendanceDate =
      row.status === "hadir" ? row.checkIn : row.submittedAt;
    const isDateMatch =
      (!startDate || new Date(attendanceDate) >= new Date(startDate)) &&
      (!endDate || new Date(attendanceDate) <= new Date(endDate));

    return isStatusMatch && isInstitutionMatch && isDateMatch;
  });

  const searchedData = filteredData.filter((row) =>
    row.internName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(searchedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchedData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="mb-8 p-6 border rounded-lg bg-blue-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Rekap Presensi Peserta
      </h3>

      {/* 🔍 Baris filter gabungan */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Pencarian Nama
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
            placeholder="Masukkan nama peserta"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700">
            Institusi
          </label>
          <input
            type="text"
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
            placeholder="Nama institusi lengkap"
          />
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          >
            <option value="">Semua</option>
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="tanpa_keterangan">Tanpa Keterangan</option>
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => handlePrintAll()}
          className="bg-bps-blue hover:bg-bps-dark text-white px-4 py-2 rounded text-sm font-medium"
        >
          <PrinterIcon className="h-5 w-5 inline-block mr-2" />
          Cetak Semua
        </button>
      </div>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Peserta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asal Institusi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kehadiran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Presensi Pulang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Kehadiran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentItems.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.internName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.institution || "Tidak diketahui"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.status !== "hadir"
                      ? formatTime(row.submittedAt)
                      : formatTime(row.checkIn)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(row.checkOut)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {row.checkIn && row.checkOut ? 1 : 0}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full font-medium text-xs
                        ${
                          row.status === "hadir"
                            ? "bg-green-100 text-green-700"
                            : row.status === "izin"
                            ? "bg-yellow-100 text-yellow-700"
                            : row.status === "sakit"
                            ? "bg-purple-100 text-purple-700"
                            : row.status === "tanpa_keterangan"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                        }
                      `}
                    >
                      {row.status === "hadir"
                        ? "Hadir"
                        : row.status === "izin"
                        ? "Izin"
                        : row.status === "sakit"
                        ? "Sakit"
                        : row.status === "tanpa_keterangan"
                        ? "Tanpa Keterangan"
                        : "-"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      {["izin", "sakit"].includes(row.status) && (
                        <button
                          onClick={() => openValidationModal(row)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Validasi kehadiran"
                        >
                          <PencilSquareIcon className="h-5 w-5 inline-block" />
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintIndividual(row.userId)}
                        className="text-bps-blue hover:text-bps-dark"
                        title="Cetak Presensi"
                      >
                        <PrinterIcon className="h-5 w-5 inline-block" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentItems.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Belum ada data presensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Modal Validasi */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                leave="ease-in duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-800">
                      Validasi Kehadiran
                    </Dialog.Title>
                    <button onClick={closeModal}>
                      <XMarkIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-700">Alasan:</p>
                      <p className="text-sm bg-gray-100 rounded p-2">
                        {selectedAttendance?.reasonDescription ||
                          "Tidak ada keterangan"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-700">File Bukti:</p>
                      {selectedAttendance?.proofFilePath ? (
                        <a
                          href={`${baseUrl}/${selectedAttendance.proofFilePath}`}
                          target="_blank"
                          className="text-sm text-blue-600 underline"
                        >
                          Lihat File
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">Tidak ada file</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubah Status
                      </label>
                      <select
                        value={selectedAttendance?.status}
                        onChange={(e) =>
                          validateAttendance(
                            selectedAttendance.id,
                            e.target.value
                          )
                        }
                        className="w-full border rounded px-3 py-2 text-sm"
                      >
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="hadir">Hadir</option>
                        <option value="tanpa_keterangan">
                          Tanpa Keterangan
                        </option>
                      </select>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
        onConfirm={alert.onConfirm}
        showCancelButton={alert.showCancelButton}
      />
    </div>
  );
}

export default PresencesRecap;
