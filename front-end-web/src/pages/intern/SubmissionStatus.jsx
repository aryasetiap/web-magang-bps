import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StatusAjuanPage() {
  const navigate = useNavigate();
  // Menggunakan state untuk menyimpan status ajuan
  const [submissionStatus, setSubmissionStatus] = useState('initial');
  // State dummy untuk data biodata yang akan dikonfirmasi
  const [biodataDummy, setBiodataDummy] = useState(null);

  useEffect(() => {
    // Simulasi memuat data biodata dari "database" atau state global
    const dummyData = {
      namaLengkap: 'Budi Santoso',
      nimNis: '202312345',
      asalInstitusi: 'Universitas Pringsewu',
      jurusanProdi: 'Teknik Informatika',
      nomorTelepon: '081234567890',
      email: 'budi.santoso@example.com',
      alamat: 'Jl. Contoh Alamat No. 10, RT 01/RW 02, Kel. Pringkumpul, Kec. Pringsewu, Kabupaten Pringsewu, Lampung, 35373', // Contoh alamat lebih panjang
      // Status berkas: asumsi sudah diunggah di halaman biodata
      cvUploaded: true,
      transkripUploaded: true,
      suratPermohonanUploaded: true,
    };
    setBiodataDummy(dummyData);

    // Simulasi status ajuan yang sudah ada (misal dari API backend)
    // Untuk tujuan demo, Anda bisa mengganti ini:
    // setSubmissionStatus('pending');
    // setSubmissionStatus('accepted');
    // setSubmissionStatus('rejected');

  }, []);

  const handleAjukan = () => {
    // Logika untuk mengirim ajuan ke backend
    alert('Ajuan Anda telah berhasil dikirim! Menunggu verifikasi.');
    setSubmissionStatus('pending'); // Mengubah status di frontend
  };

  // Tampilan Berdasarkan Status
  const renderContent = () => {
    if (!biodataDummy) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Memuat data biodata...</p>
        </div>
      );
    }

    // Helper untuk item baris
    const BiodataItem = ({ label, value, isFullWidth = false }) => (
      <div className={`grid grid-cols-2 gap-4 py-2 border-b border-blue-100 last:border-b-0 ${isFullWidth ? 'md:grid-cols-[auto_1fr]' : ''}`}>
        <div className="font-semibold text-black-800">{label}</div>
        <div className="text-gray-700 break-words">: {value}</div>
      </div>
    );


    switch (submissionStatus) {
      case 'initial':
        return (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Konfirmasi Data Ajuan Magang</h3>
            <p className="text-gray-700 mb-6">
              Mohon periksa kembali data biodata dan kelengkapan berkasmu sebelum mengajukan permohonan magang.
            </p>

            {/* Ringkasan Biodata - Diubah menjadi tampilan mirip tabel */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 text-lg mb-3">Ringkasan Biodata:</h4>
              <div className="divide-y divide-blue-100"> {/* Garis pemisah antar baris */}
                <BiodataItem label="Nama Lengkap" value={biodataDummy.namaLengkap} />
                <BiodataItem label="NIM / NIS" value={biodataDummy.nimNis} />
                <BiodataItem label="Asal Institusi" value={biodataDummy.asalInstitusi} />
                <BiodataItem label="Jurusan/Prodi" value={biodataDummy.jurusanProdi} />
                <BiodataItem label="Nomor Telepon" value={biodataDummy.nomorTelepon} />
                <BiodataItem label="Email" value={biodataDummy.email} />
                {/* Alamat akan merentang penuh di mobile, dan tetap 2 kolom di desktop tapi dengan label di awal baris */}
                <div className="py-2 border-b border-blue-100 last:border-b-0">
                  <div className="font-semibold text-black-800 mb-1">Alamat</div>
                  <div className="text-gray-700 break-words">{biodataDummy.alamat}</div>
                </div>
              </div>
              
              <h4 className="font-bold text-blue-800 text-lg mt-6 mb-3">Kelengkapan Berkas:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li className={biodataDummy.cvUploaded ? 'text-green-700' : 'text-red-700'}>
                  CV: {biodataDummy.cvUploaded ? 'Sudah Diunggah' : 'Belum Diunggah!'}
                </li>
                <li className={biodataDummy.transkripUploaded ? 'text-green-700' : 'text-red-700'}>
                  Transkrip Nilai / Rapor: {biodataDummy.transkripUploaded ? 'Sudah Diunggah' : 'Belum Diunggah!'}
                </li>
                <li className={biodataDummy.suratPermohonanUploaded ? 'text-green-700' : 'text-red-700'}>
                  Surat Permohonan Magang: {biodataDummy.suratPermohonanUploaded ? 'Sudah Diunggah' : 'Belum Diunggah!'}
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Jika ada data yang belum benar atau berkas yang belum lengkap, silakan <a href="/dashboard/biodata" className="text-bps-blue hover:underline font-semibold">ubah di halaman Biodata</a>.
              </p>
            </div>

            <button
              onClick={handleAjukan}
              className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              // disabled={!(biodataDummy.cvUploaded && biodataDummy.transkripUploaded && biodataDummy.suratPermohonanUploaded)}
            >
              Ajukan Permohonan Magang
            </button>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-orange-600 mb-4">Status Ajuan: Menunggu Verifikasi</h3>
            <p className="text-gray-700 mb-4">
              Permohonan magang Anda telah berhasil diajukan. Kami akan segera memverifikasi data dan berkasmu.
            </p>
            <p className="text-gray-600">
              Mohon cek halaman ini secara berkala untuk mengetahui status terbaru ajuan kamu.
            </p>
            <div className="mt-6">
                <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 mt-2">Sedang diproses...</p>
            </div>
          </div>
        );

      case 'accepted':
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-green-600 mb-4">Status Ajuan: Telah Diterima! 🎉</h3>
            <p className="text-gray-700 mb-4">
              Selamat! Permohonan magang Anda di BPS Kabupaten Pringsewu telah **DITERIMA**.
            </p>
            <p className="text-gray-600">
              Informasi lebih lanjut mengenai jadwal dan langkah berikutnya akan disampaikan melalui sistem ini atau email Anda.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Kembali ke Dashboard
            </button>
          </div>
        );

      case 'rejected':
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-red-600 mb-4">Status Ajuan: Ditolak 😞</h3>
            <p className="text-gray-700 mb-4">
              Mohon maaf, permohonan magang Anda di BPS Kabupaten Pringsewu telah **DITOLAK**.
            </p>
            <p className="text-gray-600">
              Alasan penolakan: [Teks alasan penolakan, bisa dari data API]. Silakan periksa kembali kelengkapan atau kesesuaian persyaratan.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Kembali ke Dashboard
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-10">
            <p className="text-lg text-gray-700">Status tidak dikenali.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Status Ajuan Magang</h2>
      {renderContent()}
    </div>
  );
}

export default StatusAjuanPage;