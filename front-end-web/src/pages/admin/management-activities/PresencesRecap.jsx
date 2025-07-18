import React, { useEffect, useState } from "react";
import { fetchPresensiData, formatTime } from "../../../utils/attendance";
import {
  PencilSquareIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function PresencesRecap() {
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModeId, setEditModeId] = useState(null); // ID yang sedang diedit
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPresensiData(token);
      setRecapData(data);
      setLoading(false);
    };
    fetchData();
  }, [token]);

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
          r.attendanceId === attendanceId ? { ...r, status: newStatus } : r
        )
      );
      setEditModeId(null);
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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <select
                      disabled={editModeId !== row.attendanceId}
                      value={row.status || ""}
                      onChange={(e) =>
                        validateAttendance(row.attendanceId, e.target.value)
                      }
                      className={`border rounded px-2 py-1 text-sm ${
                        editModeId === row.attendanceId
                          ? "bg-white"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <option value="">- Pilih Status -</option>
                      <option value="hadir">Hadir</option>
                      <option value="izin">Izin</option>
                      <option value="alpha">Alpha</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {editModeId === row.attendanceId ? (
                      <button
                        onClick={() => setEditModeId(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Batal
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditModeId(row.attendanceId)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
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
    </div>
  );
}

export default PresencesRecap;
