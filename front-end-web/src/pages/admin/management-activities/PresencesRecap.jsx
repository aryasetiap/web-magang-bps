import React, { useEffect, useState } from "react";
import { fetchPresensiData, formatTime } from "../../../utils/attendance";

function PresencesRecap() {
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPresensiData(token);
      setRecapData(data);
      setLoading(false);
    };

    fetchData();
  }, [token]);

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
                </tr>
              ))}
              {recapData.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
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
