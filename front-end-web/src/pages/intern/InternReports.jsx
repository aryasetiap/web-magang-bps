import React, { useState, useEffect } from 'react';

function InternReportPage() {
  // Dummy Data Rekap Aktivitas
  const [recapData, setRecapData] = useState({
    totalPresensiMasuk: 45, // Contoh: total hari presensi masuk
    totalPresensiPulang: 42, // Contoh: total hari presensi pulang
    logbookEntries: [ // Contoh entri logbook
      { date: '2025-06-01', activity: 'Mempelajari sistem internal BPS dan membaca panduan magang.' },
      { date: '2025-06-02', activity: 'Membantu input data survei lapangan.' },
      { date: '2025-06-03', activity: 'Mengikuti rapat koordinasi tim pengolahan data.' },
      { date: '2025-06-04', activity: 'Melakukan verifikasi data sensus ekonomi.' },
      { date: '2025-06-05', activity: 'Menyiapkan materi untuk presentasi internal.' },
    ],
    completedAssignments: [ // Contoh tugas yang sudah selesai
      { id: 1, title: 'Mempelajari Struktur Organisasi BPS', submission: 'Laporan Ringkasan.pdf', type: 'file' },
      { id: 3, title: 'Menyusun Laporan Mingguan', submission: 'Laporan_Mingguan_Budi.pdf', type: 'file' },
      { id: 5, title: 'Analisis Data Penjualan (Teks)', submission: 'Ringkasan analisis teks', type: 'text' },
    ],
    totalAssignments: 8, // Contoh: total penugasan yang diberikan
    submittedFinalReport: null, // Untuk menyimpan status laporan akhir yang diunggah
    finalReportStatus: 'Belum Diperiksa', // Bisa 'Belum Diperiksa', 'Perlu Revisi', 'Lulus'
    revisiNotes: '', // Catatan revisi jika statusnya 'Perlu Revisi'
  });

  const [finalReportFile, setFinalReportFile] = useState(null); // State untuk file laporan akhir yang akan diunggah

  // Simulasi memuat data rekap dari backend saat komponen dimuat
  useEffect(() => {
    // Di sini Anda akan melakukan fetch data rekap aktivitas dan status laporan akhir dari backend
    // const fetchRecap = async () => { ... }
    // Untuk demo, kita pakai data dummy
    const savedReport = localStorage.getItem('finalReportFile');
    const savedReportStatus = localStorage.getItem('finalReportStatus');
    const savedRevisiNotes = localStorage.getItem('revisiNotes');

    if (savedReport) {
        setRecapData(prev => ({
            ...prev,
            submittedFinalReport: JSON.parse(savedReport),
            finalReportStatus: savedReportStatus || 'Belum Diperiksa',
            revisiNotes: savedRevisiNotes || ''
        }));
    }
  }, []);

  const handleFinalReportUpload = (e) => {
    setFinalReportFile(e.target.files[0]);
  };

  const handleSubmitFinalReport = () => {
    if (!finalReportFile) {
      alert('Mohon pilih file laporan akhir terlebih dahulu.');
      return;
    }

    // Simulasi proses unggah laporan akhir
    const fileName = finalReportFile.name;
    alert(`Laporan akhir "${fileName}" berhasil diunggah! Menunggu pemeriksaan.`);
    
    // Update state dan localStorage
    setRecapData(prev => ({
      ...prev,
      submittedFinalReport: { name: fileName, url: '#' }, // URL dummy
      finalReportStatus: 'Belum Diperiksa',
      revisiNotes: ''
    }));
    localStorage.setItem('finalReportFile', JSON.stringify({ name: fileName, url: '#' }));
    localStorage.setItem('finalReportStatus', 'Belum Diperiksa');
    localStorage.removeItem('revisiNotes'); // Clear previous revision notes
    setFinalReportFile(null); // Reset input file
    // Di aplikasi nyata: Kirim file ke backend (FormData)
  };

  // Fungsi simulasi untuk mengubah status laporan (untuk testing)
  const simulateStatusChange = (status, notes = '') => {
    setRecapData(prev => ({
        ...prev,
        finalReportStatus: status,
        revisiNotes: notes
    }));
    localStorage.setItem('finalReportStatus', status);
    if (notes) {
        localStorage.setItem('revisiNotes', notes);
    } else {
        localStorage.removeItem('revisiNotes');
    }
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Laporan Akhir Magang</h2>
      <p className="text-gray-700 mb-6">
        Di sini Anda dapat melihat rekap aktivitas selama magang dan mengunggah laporan akhir magang Anda.
      </p>

      {/* Bagian Rekap Aktivitas */}
      <div className="mb-8 p-6 border rounded-lg bg-indigo-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Rekap Aktivitas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">Total Presensi Masuk:</p>
            <p className="text-2xl font-bold text-bps-blue">{recapData.totalPresensiMasuk} Hari</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-600">Total Penugasan Selesai:</p>
            <p className="text-2xl font-bold text-bps-blue">{recapData.completedAssignments.length} / {recapData.totalAssignments} Tugas</p>
          </div>
        </div>

        <h4 className="font-semibold text-lg text-gray-800 mb-3">Ringkasan Logbook Harian:</h4>
        {recapData.logbookEntries.length > 0 ? (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
            <ul className="space-y-2">
              {recapData.logbookEntries.map((entry, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{entry.date}:</span> {entry.activity}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Belum ada entri logbook yang tercatat.</p>
        )}

        <h4 className="font-semibold text-lg text-gray-800 mt-6 mb-3">Tugas yang Telah Diselesaikan:</h4>
        {recapData.completedAssignments.length > 0 ? (
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
            <ul className="space-y-2">
              {recapData.completedAssignments.map((task, index) => (
                <li key={index} className="text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{task.title}:</span>{' '}
                  {task.type === 'file' && (
                    <a href={task.submission.url || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {task.submission.name || task.submission}
                    </a>
                  )}
                  {task.type === 'text' && (
                    <span className="italic">"{task.submission.substring(0, 50)}..."</span>
                  )}
                  {task.type === 'link' && (
                    <a href={task.submission} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {task.submission}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">Belum ada tugas yang ditandai selesai.</p>
        )}
      </div>

      {/* Bagian Unggah Laporan Akhir */}
      <div className="mb-8 p-6 border rounded-lg bg-purple-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Unggah Laporan Akhir</h3>

        <div className="mb-4">
          <p className="text-gray-700 font-medium mb-2">Status Laporan Akhir Anda:</p>
          <span className={`px-4 py-1 rounded-full font-semibold text-sm
            ${recapData.finalReportStatus === 'Lulus' ? 'bg-green-200 text-green-800' :
              recapData.finalReportStatus === 'Perlu Revisi' ? 'bg-red-200 text-red-800' :
              'bg-yellow-200 text-yellow-800'}`}
          >
            {recapData.finalReportStatus}
          </span>
          {recapData.revisiNotes && recapData.finalReportStatus === 'Perlu Revisi' && (
              <p className="text-red-600 text-sm mt-2">Catatan Revisi: {recapData.revisiNotes}</p>
          )}
        </div>

        {recapData.submittedFinalReport && (
          <div className="mb-4 text-gray-700">
            <p>File Laporan Terakhir Diunggah:</p>
            <a href={recapData.submittedFinalReport.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-medium">
              {recapData.submittedFinalReport.name}
            </a>
          </div>
        )}

        {recapData.finalReportStatus !== 'Lulus' && ( // Tidak bisa upload lagi jika sudah lulus
            <>
                <p className="text-gray-600 text-sm mb-4">
                    Unggah file laporan akhir magang Anda dalam format PDF. Ukuran maksimal 5MB.
                </p>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFinalReportUpload}
                    className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-bps-blue file:text-white
                        hover:file:bg-bps-light-blue"
                />
                {finalReportFile && (
                    <p className="mt-2 text-sm text-gray-600">File terpilih: {finalReportFile.name}</p>
                )}
                <button
                    onClick={handleSubmitFinalReport}
                    disabled={!finalReportFile}
                    className={`mt-4 bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
                        ${!finalReportFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {recapData.submittedFinalReport ? 'Unggah Ulang Laporan' : 'Unggah Laporan Akhir'}
                </button>
            </>
        )}
        {recapData.finalReportStatus === 'Lulus' && (
            <p className="text-green-700 mt-4 font-semibold">Selamat! Laporan akhir Anda sudah diperiksa dan dinyatakan Lulus.</p>
        )}

        {/* Tombol simulasi status (Hanya untuk dev/demo) */}
        <div className="mt-8 pt-4 border-t border-gray-200">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Simulasi Status (DEV ONLY):</h4>
            <div className="flex space-x-2">
                <button onClick={() => simulateStatusChange('Belum Diperiksa')} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Set Belum Diperiksa</button>
                <button onClick={() => simulateStatusChange('Perlu Revisi', 'Tolong perbaiki bagian metodologi dan hasil analisis.')} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Set Perlu Revisi</button>
                <button onClick={() => simulateStatusChange('Lulus')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">Set Lulus</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default InternReportPage;