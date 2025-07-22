import React, { Fragment, useEffect, useState } from "react";
import { fetchPresensiData } from "../../../utils/attendance";
import { formatTime } from "../../../utils/formatDateTime";
import { PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";

function PresencesRecap() {
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModeId, setEditModeId] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPresensiData(token);
      console.log("recapData fetched:", data); // ⬅ tambahkan ini
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
        `http://localhost:3000/attendances/${attendanceId}/validate`,
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
      alert("Status kehadiran berhasil diperbarui.");
    } catch (err) {
      alert("Gagal memperbarui status kehadiran: " + err.message);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-blue-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Rekap Presensi Peserta
      </h3>
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
                  Presensi Hadir
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
              {recapData.map((row, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.internName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatTime(row.checkIn)}
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
                            ? "bg-blue-100 text-blue-700"
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
                    {["izin", "sakit"].includes(row.status) && (
                      <button
                        onClick={() => openValidationModal(row)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Validasi kehadiran"
                      >
                        <PencilSquareIcon className="h-5 w-5 inline-block" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {recapData.length === 0 && (
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
                          href={`http://localhost:3000/${selectedAttendance.proofFilePath}`}
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
    </div>
  );
}

export default PresencesRecap;
