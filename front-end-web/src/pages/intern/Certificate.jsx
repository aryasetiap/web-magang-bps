import React, { useState, useEffect } from 'react';

function CertificatePage() {
  const [sertifikatInfo, setSertifikatInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi pengambilan status kelulusan dan info sertifikat dari backend/localStorage
    // Di aplikasi nyata, Anda akan memanggil API untuk mendapatkan data ini
    const fetchSertifikatStatus = () => {
      setIsLoading(true);
      const finalReportStatus = localStorage.getItem('finalReportStatus');
      
      // Jika status laporan akhir adalah 'Lulus', simulasikan sertifikat tersedia
      if (finalReportStatus === 'Lulus') {
        setSertifikatInfo({
          idSertifikat: 'BPS-PRINGSEWU-2025-001-Budi', // Contoh ID unik
          fileName: 'Sertifikat_Magang_BPS_Pringsewu_Budi_Santoso.pdf',
          downloadUrl: '/assets/dummy-sertifikat.pdf', // URL dummy untuk file PDF
        });
      } else {
        setSertifikatInfo(null); // Sertifikat belum tersedia
      }
      setIsLoading(false);
    };

    fetchSertifikatStatus();
    // Anda bisa menambahkan interval atau trigger lain jika status sertifikat bisa berubah real-time
  }, []);

  const handleDownloadSertifikat = () => {
    if (sertifikatInfo && sertifikatInfo.downloadUrl) {
      // Dalam aplikasi nyata, Anda bisa memicu download file langsung
      // Atau, jika perlu otorisasi, panggil API yang mengembalikan file
      window.open(sertifikatInfo.downloadUrl, '_blank');
      alert(`Mulai mengunduh: ${sertifikatInfo.fileName}`);
    } else {
      alert('Sertifikat tidak tersedia untuk diunduh.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Sertifikat Kelulusan</h2>
      <p className="text-gray-700 mb-6">
        Halaman ini menampilkan sertifikat kelulusan magangmu di BPS Kabupaten Pringsewu.
      </p>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Memuat status sertifikat...</p>
          <svg className="animate-spin h-8 w-8 text-bps-blue mx-auto mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        sertifikatInfo ? (
          <div className="p-6 border rounded-lg bg-green-50 text-center">
            <h3 className="text-2xl font-semibold text-green-800 mb-4">Selamat! Kamu telah Lulus Magang! 🎉</h3>
            <p className="text-gray-700 mb-2">
              Sertifikat kelulusanmu sudah tersedia.
            </p>
            <div className="mb-4">
              <p className="text-gray-800 font-medium">ID Sertifikat:</p>
              <p className="text-xl font-bold text-bps-blue">{sertifikatInfo.idSertifikat}</p>
            </div>
            <button
              onClick={handleDownloadSertifikat}
              className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Unduh Sertifikat ({sertifikatInfo.fileName})
            </button>
            <p className="text-gray-600 text-sm mt-3">Pastikan kamu memiliki pembaca PDF untuk melihat sertifikat.</p>
          </div>
        ) : (
          <div className="p-6 border rounded-lg bg-yellow-50 text-center">
            <h3 className="text-2xl font-semibold text-yellow-800 mb-4">Sertifikat Belum Tersedia</h3>
            <p className="text-gray-700 mb-4">
              Sertifikat kelulusan akan tersedia setelah kamu menyelesaikan laporan akhir magang dan dinyatakan **Lulus** oleh Koordinator Magang.
            </p>
            <p className="text-gray-600">
              Silakan cek halaman <a href="/dashboard/laporan-akhir" className="text-bps-blue hover:underline font-semibold">Laporan Akhir</a> untuk memantau status laporanmu.
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default CertificatePage;