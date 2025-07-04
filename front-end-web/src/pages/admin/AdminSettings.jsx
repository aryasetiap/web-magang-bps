import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'; // Untuk ikon status

function AdminSettingsPage() {
  // State untuk pengaturan sistem, diinisialisasi dari localStorage
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      registrationOpenDate: '',
      registrationCloseDate: '',
      internQuota: 50, // Default kuota
      isSystemActive: true, // Default sistem aktif
    };
  });

  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  // Efek untuk menyimpan pengaturan ke localStorage setiap kali settings berubah
  useEffect(() => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validasi sederhana: tanggal buka tidak boleh setelah tanggal tutup
    if (settings.registrationOpenDate && settings.registrationCloseDate &&
        new Date(settings.registrationOpenDate) > new Date(settings.registrationCloseDate)) {
      setSaveStatus('error');
      alert('Tanggal buka pendaftaran tidak boleh setelah tanggal tutup pendaftaran!');
      return;
    }

    // Simulasi penyimpanan ke backend
    console.log('Pengaturan disimpan:', settings);
    setSaveStatus('success');
    alert('Pengaturan sistem berhasil disimpan!');

    // Reset status setelah beberapa detik
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Pengaturan Sistem</h2>
      <p className="text-gray-700 mb-6">
        Atur parameter global sistem seperti periode pendaftaran dan kuota peserta magang.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Status Sistem Aktif/Tidak Aktif */}
        <div className="mb-6 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Status & Aktivasi Sistem</h3>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isSystemActive"
              name="isSystemActive"
              checked={settings.isSystemActive}
              onChange={handleChange}
              className="h-5 w-5 text-bps-blue rounded border-gray-300 focus:ring-bps-blue"
            />
            <label htmlFor="isSystemActive" className="ml-2 block text-lg font-medium text-gray-900">
              Sistem Aktif
            </label>
          </div>
          <p className="text-sm text-gray-600">
            {settings.isSystemActive
              ? 'Sistem sedang aktif dan dapat diakses oleh semua pengguna.'
              : 'Sistem sedang tidak aktif. Pengguna tidak dapat melakukan pendaftaran atau aktivitas.'}
          </p>
        </div>

        {/* Periode Pendaftaran */}
        <div className="mb-6 p-6 border rounded-lg bg-blue-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Periode Pendaftaran Magang</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="registrationOpenDate" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Buka Pendaftaran:</label>
              <input
                type="date"
                id="registrationOpenDate"
                name="registrationOpenDate"
                value={settings.registrationOpenDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              />
            </div>
            <div>
              <label htmlFor="registrationCloseDate" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Tutup Pendaftaran:</label>
              <input
                type="date"
                id="registrationCloseDate"
                name="registrationCloseDate"
                value={settings.registrationCloseDate}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Peserta magang hanya dapat mengajukan pendaftaran dalam rentang tanggal ini.
          </p>
        </div>

        {/* Kuota Peserta */}
        <div className="mb-6 p-6 border rounded-lg bg-green-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Kuota Peserta Magang</h3>
          <div>
            <label htmlFor="internQuota" className="block text-gray-700 text-sm font-bold mb-2">Jumlah Kuota:</label>
            <input
              type="number"
              id="internQuota"
              name="internQuota"
              value={settings.internQuota}
              onChange={handleChange}
              min="0"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              required
            />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Jumlah maksimum peserta magang yang dapat diterima dalam satu periode.
          </p>
        </div>

        {/* Tombol Simpan */}
        <button
          type="submit"
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Simpan Pengaturan
        </button>

        {/* Indikator Status Simpan */}
        {saveStatus && (
          <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2
            ${saveStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {saveStatus === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
            <span className="font-medium">
              {saveStatus === 'success' ? 'Pengaturan berhasil disimpan!' : 'Gagal menyimpan pengaturan. Periksa kembali input Anda.'}
            </span>
          </div>
        )}
      </form>
    </div>
  );
}

export default AdminSettingsPage;