// File: components/PresenceSection.jsx
import React, { useState, useEffect } from "react";
import {
  getDistance,
  postCheckIn,
  postCheckOut,
  fetchUserDailyAttendance,
} from "../../../utils/attendance";
import AlertDialog from "../../../components/AlertDialog";
function PresenceSection() {
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

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

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

  return (
    <div className="mb-8 p-6 border rounded-lg bg-white shadow-md">
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
          <p className="text-sm text-gray-400 italic">Lokasi belum diambil.</p>
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
