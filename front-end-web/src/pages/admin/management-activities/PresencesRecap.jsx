import React, { useEffect, useState } from "react";

function PresencesRecap() {
  const [recapData, setRecapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchPresensi = async () => {
      try {
        const res = await fetch("http://localhost:3000/attendances/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (res.ok) {
          const recap = result.data.map((item) => ({
            internName: item.user?.name || "Tanpa Nama",
            checkIn: item.clockIn,
            checkOut: item.clockOut,
          }));

          setRecapData(recap);
        }
      } catch (err) {
        console.error("Gagal memuat presensi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPresensi();
  }, [token]);

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    // Format jam lokal
    const time = date.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
      //   hour: "2-digit",
      //   minute: "2-digit",
    });

    // Deteksi zona waktu
    const offset = date.getTimezoneOffset(); // dalam menit
    const timeOffset = -offset / 60;

    let zone = "WIB"; // default
    if (timeOffset === 8) zone = "WITA";
    else if (timeOffset === 9) zone = "WIT";
    else if (timeOffset === 7) zone = "WIB"; // biasanya JavaScript berjalan di zona waktu UTC+7

    return `${time} ${zone}`;
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
