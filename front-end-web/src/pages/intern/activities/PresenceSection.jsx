// File: components/PresenceSection.jsx
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  getDistance,
  postCheckIn,
  postCheckOut,
  fetchUserDailyAttendance,
  requestLeave,
  fetchUserAllAttendances,
} from "../../../utils/attendance";
import AlertDialog from "../../../components/AlertDialog";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

function PresenceSection() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const today = new Date();
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );
  const selectedDateObject = new Date(selectedDate);

  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [isInRange, setIsInRange] = useState(false);

  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("izin");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveProof, setLeaveProof] = useState(null);

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(attendanceHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAttendanceHistory = attendanceHistory.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const allowedLat = -5.371143050410507;
  const allowedLng = 105.04952785299278;
  const radiusInMeters = 50;

  const isToday =
    selectedDateObject.toDateString() === todayDateOnly.toDateString();

  // Ambil status presensi dari backend saat mount/selectedDate berubah
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    fetchUserDailyAttendance(token, selectedDateObject).then((attendance) => {
      if (attendance) {
        setCheckInTime(
          attendance.clockIn
            ? new Date(attendance.clockIn).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null
        );
        setCheckOutTime(
          attendance.clockOut
            ? new Date(attendance.clockOut).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : null
        );
      } else {
        setCheckInTime(null);
        setCheckOutTime(null);
      }
    });

    setCurrentLocation(null);
    setLocationError("");
    setIsInRange(false);
  }, [selectedDate]);

  // Tambahkan useEffect untuk update data presensi setelah checkIn/checkOut berubah
  useEffect(() => {
    if (checkInTime !== null) {
      const token = localStorage.getItem("authToken");
      fetchUserDailyAttendance(token, selectedDateObject).then((attendance) => {
        if (attendance) {
          setCheckInTime(
            attendance.clockIn
              ? new Date(attendance.clockIn).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null
          );
          setCheckOutTime(
            attendance.clockOut
              ? new Date(attendance.clockOut).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null
          );
        }
      });
    }
  }, [checkInTime]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetchUserAllAttendances(token).then((allAttendances) => {
      const userAttendances = allAttendances.sort(
        (a, b) =>
          new Date(b.clockIn || b.submittedAt) -
          new Date(a.clockIn || a.submittedAt)
      );
      setAttendanceHistory(userAttendances);
    });
  }, []);

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung oleh browser Anda.");
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setLocationError("Mencari lokasi...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(
          latitude,
          longitude,
          allowedLat,
          allowedLng
        );
        const withinRange = distance <= radiusInMeters;
        setCurrentLocation({ latitude, longitude });
        setIsInRange(withinRange);
        setLocationError("");

        setAlert({
          isOpen: true,
          title: "Lokasi Ditemukan",
          message: `Lokasi ditemukan! Lat: ${latitude}, Long: ${longitude}. Jarak:${distance.toFixed(
            2
          )} meter.`,
        });
      },
      (error) => {
        let errorMessage = "Gagal mendapatkan lokasi. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Akses lokasi ditolak oleh pengguna.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Informasi lokasi tidak tersedia.";
            break;
          case error.TIMEOUT:
            errorMessage += "Waktu permintaan lokasi habis.";
            break;
          default:
            errorMessage += "Terjadi kesalahan tidak dikenal.";
            break;
        }
        setLocationError(errorMessage);
        setAlert({
          isOpen: true,
          title: "Gagal Mendapatkan Lokasi",
          message: errorMessage,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = async () => {
    if (!isToday) {
      setAlert({
        isOpen: true,
        title: "Presensi Tidak Dapat Dilakukan",
        message: "Presensi hanya dapat dilakukan untuk tanggal hari ini.",
      });
      return;
    }
    if (!currentLocation || !isInRange) {
      setAlert({
        isOpen: true,
        title: "Lokasi Tidak Diizinkan",
        message: "Lokasi kamu di luar area yang diizinkan untuk presensi.",
      });
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const attendance = await postCheckIn(token, currentLocation);

      setCheckInTime(
        attendance.clockIn
          ? new Date(attendance.clockIn).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null
      );
      // Reset lokasi agar tombol "Dapatkan Lokasi" pada presensi pulang langsung aktif
      setCurrentLocation(null);
      setIsInRange(false);
      setLocationError("");

      setAlert({
        isOpen: true,
        title: "Presensi Berhasil",
        message: `Kamu berhasil presensi masuk pada pukul ${
          attendance.clockIn
            ? new Date(attendance.clockIn).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"
        } .`,
        type: "success",
        autoCloseDelay: 3000,
      });

      window.location.reload(); // Tambahkan ini agar halaman reload otomatis
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Gagal Presensi",
        message: error.message,
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  const handleCheckOut = async () => {
    if (!isToday) {
      setAlert({
        isOpen: true,
        title: "Presensi Tidak Dapat Dilakukan",
        message: "Presensi hanya dapat dilakukan untuk tanggal hari ini.",
      });
      return;
    }
    if (!currentLocation || !isInRange) {
      setAlert({
        isOpen: true,
        title: "Lokasi Tidak Diizinkan",
        message: "Lokasi kamu di luar area yang diizinkan untuk presensi.",
      });
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const attendance = await postCheckOut(token, currentLocation);
      // Gunakan waktu dari backend
      setCheckOutTime(
        attendance.clockOut
          ? new Date(attendance.clockOut).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : null
      );
      setAlert({
        isOpen: true,
        title: "Presensi Berhasil",
        message: `Kamu berhasil presensi pulang pada pukul ${
          attendance.clockOut
            ? new Date(attendance.clockOut).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"
        } .`,
      });
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Gagal Presensi",
        message: error.message,
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");

    if (!leaveType || !leaveReason || !leaveProof) {
      setAlert({
        isOpen: true,
        title: "Gagal Mengajukan",
        message: "Lengkapi semua data sebelum mengirim pengajuan.",
        type: "error",
      });
      return;
    }

    try {
      await requestLeave(token, {
        type: leaveType,
        description: leaveReason,
        proof: leaveProof,
      });

      setAlert({
        isOpen: true,
        title: "Berhasil Mengajukan",
        message: `Pengajuan ${leaveType} berhasil dikirim.`,
        type: "success",
        autoCloseDelay: 3000,
      });
      setIsLeaveModalOpen(false);
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Gagal Mengajukan",
        message: error.message,
        type: "error",
      });
    }
  };

  return (
    <div>
      <div className="mb-8 p-6 border rounded-lg bg-blue-50 shadow-md">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Presensi Kehadiran
        </h3>
        {/* Tanggal (opsional) */}
        <div className="mb-4">
          <label
            htmlFor="selectedDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tanggal
          </label>
          <input
            type="date"
            id="selectedDate"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
          />
        </div>

        {/* Lokasi Dinamis */}
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">
            Lokasi Saat Ini
          </h4>
          {currentLocation ? (
            <p className="text-sm text-gray-700">
              Latitude: {currentLocation.latitude.toFixed(5)}, Longitude:{" "}
              {currentLocation.longitude.toFixed(5)}
            </p>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Lokasi belum diambil.
            </p>
          )}
          {locationError && (
            <p className="text-sm text-red-600 mt-1">{locationError}</p>
          )}
        </div>

        {/* Waktu Masuk & Pulang */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-center flex-1">
            <p className="text-sm text-gray-600">Presensi Masuk</p>
            <p className="text-green-600 text-xl font-semibold">
              {checkInTime || "-- : --"}
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-sm text-gray-600">Presensi Pulang</p>
            <p className="text-red-600 text-xl font-semibold">
              {checkOutTime || "-- : --"}
            </p>
          </div>
        </div>

        {/* Tombol Aksi Presensi */}
        <div className="text-center">
          {!currentLocation ? (
            <button
              onClick={getGeoLocation}
              className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Dapatkan Lokasi
            </button>
          ) : (
            <button
              onClick={checkInTime ? handleCheckOut : handleCheckIn}
              className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200
            ${
              checkInTime
                ? "bg-red-500 hover:bg-red-600"
                : "bg-bps-blue hover:bg-bps-light-blue"
            }
            ${
              !isInRange || !isToday || (checkInTime && checkOutTime)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
              disabled={!isInRange || !isToday || (checkInTime && checkOutTime)}
            >
              {checkInTime ? "Presensi Pulang" : "Presensi Masuk"}
            </button>
          )}
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="mt-4 w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition duration-200"
        >
          Ajukan Izin/Sakit
        </button>
      </div>

      <div className="overflow-x-auto mt-6 mb-8 p-6 border rounded-lg bg-blue-50 shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Riwayat Presensi
        </h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Jam Hadir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Presensi Pulang
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Keterangan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bukti
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {attendanceHistory.length > 0 ? (
              attendanceHistory.map((item, index) => {
                const date = new Date(
                  item.clockIn || item.submittedAt
                ).toLocaleDateString("id-ID");
                const jamMasuk = item.clockIn
                  ? new Date(item.clockIn).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : item.submittedAt
                  ? new Date(item.submittedAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";

                const jamKeluar = item.clockOut
                  ? new Date(item.clockOut).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-";

                const keterangan =
                  item.status === "hadir" ? "-" : item.reasonDescription || "-";

                const proof = item.proofFilePath ? (
                  <a
                    href={`${baseUrl}/${item.proofFilePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Lihat
                  </a>
                ) : (
                  "-"
                );

                return (
                  <tr
                    key={index}
                    className="bg-white hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {jamMasuk}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {jamKeluar}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {keterangan}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{proof}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Belum ada data presensi.
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

      <Transition appear show={isLeaveModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsLeaveModalOpen(false)}
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
                    className="text-lg font-bold text-gray-900 mb-4"
                  >
                    Pengajuan Izin / Sakit
                  </Dialog.Title>
                  <form onSubmit={handleRequestLeave}>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Tipe Pengajuan
                      </label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Alasan
                      </label>
                      <textarea
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Tulis alasan tidak hadir..."
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Upload Bukti (JPG/PNG/PDF, max 5MB)
                      </label>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => setLeaveProof(e.target.files[0])}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bps-blue file:text-white hover:file:bg-bps-light-blue"
                        required
                      />
                    </div>
                    <div className="flex justify-end mt-6 gap-3">
                      <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(false)}
                        className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-bold hover:bg-gray-400"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-bps-blue text-white font-bold hover:bg-bps-light-blue"
                      >
                        Kirim Pengajuan
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </div>
  );
}

export default PresenceSection;
