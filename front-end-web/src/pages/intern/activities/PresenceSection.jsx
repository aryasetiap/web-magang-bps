// File: components/PresenceSection.jsx
import React, { useState, useEffect } from 'react';

function PresenceSection() {
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);
  const selectedDateObject = new Date(selectedDate);

  const [checkInTime, setCheckInTime] = useState(localStorage.getItem('checkInTime_' + selectedDate) || null);
  const [checkOutTime, setCheckOutTime] = useState(localStorage.getItem('checkOutTime_' + selectedDate) || null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isInRange, setIsInRange] = useState(false);

  const allowedLat = -5.371143050410507;
  const allowedLng = 105.04952785299278;
  const radiusInMeters = 100; // 100 meter radius

  const isPastDate = selectedDateObject < todayDateOnly;
  const isFutureDate = selectedDateObject > todayDateOnly;
  const isToday = selectedDateObject.toDateString() === todayDateOnly.toDateString();

  useEffect(() => {
    setCheckInTime(localStorage.getItem('checkInTime_' + selectedDate));
    setCheckOutTime(localStorage.getItem('checkOutTime_' + selectedDate));
    setCurrentLocation(null);
    setLocationError('');
    setIsInRange(false);
  }, [selectedDate]);

  useEffect(() => {
    if (checkInTime) localStorage.setItem('checkInTime_' + selectedDate, checkInTime);
    else localStorage.removeItem('checkInTime_' + selectedDate);

    if (checkOutTime) localStorage.setItem('checkOutTime_' + selectedDate, checkOutTime);
    else localStorage.removeItem('checkOutTime_' + selectedDate);
  }, [checkInTime, checkOutTime, selectedDate]);

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda.');
      alert('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLocationError('Mencari lokasi...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, allowedLat, allowedLng);
        const withinRange = distance <= radiusInMeters;
        setCurrentLocation({ latitude, longitude });
        setIsInRange(withinRange);
        setLocationError('');
        alert(`Lokasi ditemukan! Lat: ${latitude}, Long: ${longitude}. Jarak: ${distance.toFixed(2)} meter.`);
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Akses lokasi ditolak oleh pengguna.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Waktu permintaan lokasi habis.';
            break;
          default:
            errorMessage += 'Terjadi kesalahan tidak dikenal.';
            break;
        }
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = async () => {
    if (!isToday) {
      alert('Presensi hanya dapat dilakukan untuk tanggal hari ini.');
      return;
    }
    if (!currentLocation || !isInRange) {
      alert('Lokasi Anda di luar area yang diizinkan untuk presensi.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3000/attendances/clock-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal mengirim presensi.');
      }

      setCheckInTime(timeString);
      alert(`Anda berhasil presensi masuk pada pukul ${timeString}.`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCheckOut = () => {
    if (!isToday) {
      alert('Presensi hanya dapat dilakukan untuk tanggal hari ini.');
      return;
    }
    if (!currentLocation || !isInRange) {
      alert('Lokasi Anda di luar area yang diizinkan untuk presensi.');
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(timeString);
    alert(`Anda berhasil presensi pulang pada pukul ${timeString}.`);
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-blue-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Presensi Kehadiran</h3>

      {/* Filter tanggal */}
      <div className="mb-4">
        <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal Aktivitas</label>
        <input
          type="date"
          id="selectedDate"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-lg text-gray-700 mb-2">Presensi Masuk</h4>
          <button
            onClick={getGeoLocation}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors duration-200 text-sm mb-3"
          >
            Dapatkan Lokasi
          </button>
          <br />
          {!checkInTime ? (
            <button
              onClick={handleCheckIn}
              className={`bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
                ${(!isToday || !currentLocation || !isInRange) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isToday || !currentLocation || !isInRange}
            >
              Presensi Masuk Sekarang
            </button>
          ) : (
            <p className="text-lg text-green-700 font-medium">
              Masuk: <span className="font-bold">{checkInTime}</span>
            </p>
          )}
          {currentLocation && <p className="text-sm text-gray-600 mt-2">Lat {currentLocation.latitude.toFixed(4)}, Long {currentLocation.longitude.toFixed(4)}</p>}
          {!isInRange && currentLocation && <p className="text-sm text-red-600 mt-2">Anda berada di luar area presensi.</p>}
          {locationError && <p className="text-sm text-red-600 mt-2">{locationError}</p>}
        </div>

        <div>
          <h4 className="font-semibold text-lg text-gray-700 mb-2">Presensi Pulang</h4>
          {!checkOutTime ? (
            <button
              onClick={handleCheckOut}
              className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
                ${(!checkInTime || !currentLocation || !isInRange || !isToday) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!checkInTime || !currentLocation || !isInRange || !isToday}
            >
              Presensi Pulang Sekarang
            </button>
          ) : (
            <p className="text-lg text-green-700 font-medium">
              Pulang: <span className="font-bold">{checkOutTime}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PresenceSection;
