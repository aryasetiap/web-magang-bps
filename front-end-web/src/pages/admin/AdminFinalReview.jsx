import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { EyeIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function AdminFinalReviewsPage() {
  // Dummy data peserta magang (untuk mendapatkan nama dari ID)
  const [interns, setInterns] = useState([
    { id: 'int001', name: 'Budi Santoso' },
    { id: 'int002', name: 'Siti Aminah' },
    { id: 'int003', name: 'Dedi Kurniawan' },
  ]);

  // Dummy data Laporan Akhir yang diunggah peserta
  const [finalReports, setFinalReports] = useState(() => {
    const savedReports = localStorage.getItem('adminFinalReports');
    if (savedReports) {
      return JSON.parse(savedReports);
    }
    return [
      {
        id: 'rep001',
        internId: 'int001',
        title: 'Laporan Magang BPS Pringsewu - Analisis Data',
        uploadedFile: { name: 'Laporan_Akhir_Budi.pdf', url: '#' },
        uploadDate: '2025-06-30',
        status: 'Belum Diperiksa', // Belum Diperiksa, Perlu Revisi, Disetujui
        reviewNotes: '',
      },
      {
        id: 'rep002',
        internId: 'int002',
        title: 'Proyek Akhir - Aplikasi Input Data',
        uploadedFile: { name: 'Aplikasi_Input_Data_Siti.zip', url: '#' },
        uploadDate: '2025-07-01',
        status: 'Perlu Revisi',
        reviewNotes: 'Mohon perbaiki bagian metodologi dan tambahkan flowchart aplikasi.',
      },
      {
        id: 'rep003',
        internId: 'int003',
        title: 'Studi Kasus Pengolahan Data Sensus',
        uploadedFile: { name: 'Studi_Kasus_Dedi.pdf', url: '#' },
        uploadDate: '2025-06-25',
        status: 'Disetujui', // Ubah dari 'Lulus' ke 'Disetujui'
        reviewNotes: 'Laporan sangat baik dan analisis mendalam.',
      },
    ];
  });

  // State untuk modal Review Laporan Akhir
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingReport, setReviewingReport] = useState(null);
  const [reviewStatus, setReviewStatus] = useState(''); // Status yang dipilih di modal
  const [reviewNotes, setReviewNotes] = useState('');

  // Efek untuk menyimpan data laporan akhir ke localStorage
  useEffect(() => {
    localStorage.setItem('adminFinalReports', JSON.stringify(finalReports));
  }, [finalReports]);

  // --- Review Laporan Akhir ---
  function openReviewModal(report) {
    setReviewingReport(report);
    setReviewStatus(report.status); // Set status default ke status saat ini
    setReviewNotes(report.reviewNotes || ''); // Isi catatan jika sudah ada
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewingReport(null);
    setReviewStatus('');
    setReviewNotes('');
  }

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewingReport) return;

    if (window.confirm(`Apakah Anda yakin ingin mengubah status laporan ${reviewingReport.title} menjadi ${reviewStatus}?`)) {
      setFinalReports(finalReports.map(report =>
        report.id === reviewingReport.id
          ? { ...report, status: reviewStatus, reviewNotes: reviewNotes }
          : report
      ));
      alert(`Status laporan "${reviewingReport.title}" berhasil diubah menjadi ${reviewStatus}.`);
      closeReviewModal();
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Review Tugas Akhir</h2>
      <p className="text-gray-700 mb-6">
        Periksa dan berikan penilaian akhir untuk laporan/proyek akhir magang peserta.
      </p>

      {/* Daftar Laporan Akhir */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Judul Laporan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tanggal Unggah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {finalReports.map((report) => {
              const intern = interns.find(i => i.id === report.internId);
              return (
                <tr key={report.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{report.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{intern ? intern.name : 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{report.uploadDate}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${report.status === 'Disetujui' ? 'bg-green-100 text-green-800' : // Ubah ini
                        report.status === 'Perlu Revisi' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openReviewModal(report)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Review Laporan"
                    >
                      <EyeIcon className="h-5 w-5 inline-block" /> Review
                    </button>
                  </td>
                </tr>
              );
            })}
            {finalReports.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada laporan akhir untuk diperiksa.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Review Laporan Akhir */}
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-4">
                    Review Laporan: {reviewingReport?.title}
                  </Dialog.Title>

                  <div className="mb-4 text-gray-700">
                    <p><strong>Peserta:</strong> {interns.find(i => i.id === reviewingReport?.internId)?.name}</p>
                    <p><strong>Tanggal Unggah:</strong> {reviewingReport?.uploadDate}</p>
                    <p className="mt-2">
                      <strong>File Laporan:</strong>{' '}
                      {reviewingReport?.uploadedFile ? (
                        <a href={reviewingReport.uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {reviewingReport.uploadedFile.name}
                        </a>
                      ) : (
                        <span className="text-gray-500">Tidak ada file.</span>
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label htmlFor="reviewStatus" className="block text-gray-700 text-sm font-bold mb-2">Status Penilaian:</label>
                      <select
                        id="reviewStatus"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                      >
                        <option value="Belum Diperiksa">Belum Diperiksa</option>
                        <option value="Perlu Revisi">Perlu Revisi</option>
                        <option value="Disetujui">Disetujui</option> {/* Ubah dari 'Lulus' ke 'Disetujui' */}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="reviewNotes" className="block text-gray-700 text-sm font-bold mb-2">Catatan Review/Revisi:</label>
                      <textarea
                        id="reviewNotes"
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="4"
                        placeholder="Tulis catatan atau instruksi revisi di sini..."
                      ></textarea>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeReviewModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Simpan Penilaian
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default AdminFinalReviewsPage;