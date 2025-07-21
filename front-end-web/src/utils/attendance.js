// src/utils/attendance.js

// Utility functions for handling attendance data (admin side)
export const fetchPresensiData = async (token) => {
  try {
    const res = await fetch("http://localhost:3000/attendances/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Gagal fetch presensi");

    return result.data.map((item) => ({
      id: item.id,
      internName: item.user?.name || "Tanpa Nama",
      checkIn: item.clockIn,
      checkOut: item.clockOut,
      status: item.status,
      reasonDescription: item.reasonDescription || "Tidak ada keterangan",
      proofFilePath: item.proofFilePath || null,
    }));
  } catch (err) {
    console.error("Gagal memuat presensi:", err);
    return [];
  }
};

// Fungsi untuk ambil presensi user tertentu pada tanggal tertentu
export const fetchUserDailyAttendance = async (token, selectedDateObject) => {
  try {
    const res = await fetch("http://localhost:3000/attendances", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const attendance = (data.data || []).find((item) => {
      const date = new Date(item.clockIn);
      return (
        date.getFullYear() === selectedDateObject.getFullYear() &&
        date.getMonth() === selectedDateObject.getMonth() &&
        date.getDate() === selectedDateObject.getDate()
      );
    });

    return attendance || null;
  } catch (err) {
    console.error("Gagal memuat presensi harian:", err);
    return null;
  }
};

// Kirim presensi masuk (intern)
export const postCheckIn = async (token, location) => {
  const res = await fetch("http://localhost:3000/attendances/clock-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(location),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal presensi masuk.");
  return data.attendance;
};

// Kirim presensi keluar (intern)
export const postCheckOut = async (token, location) => {
  const res = await fetch("http://localhost:3000/attendances/clock-out", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(location),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Gagal presensi pulang.");
  return data.attendance;
};

// Fungsi untuk data perizinan
export async function requestLeave(token, { type, description, proof }) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("description", description);
  formData.append("proof", proof);

  const res = await fetch("http://localhost:3000/attendances/request-leave", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Pengajuan izin/sakit gagal.");
  }

  return data;
}

// Fungsi untuk format waktu dari string ISO
export const formatTime = (isoString) => {
  if (!isoString) return "-";
  const date = new Date(isoString);

  const time = date.toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  });

  const offset = date.getTimezoneOffset();
  const timeOffset = -offset / 60;

  let zone = "WIB";
  if (timeOffset === 8) zone = "WITA";
  else if (timeOffset === 9) zone = "WIT";

  return `${time} ${zone}`;
};

// Fungsi hitung jarak (dalam meter) antara dua koordinat
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
