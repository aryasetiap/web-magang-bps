import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AcademicCapIcon, UserCheckIcon, UserXMarkIcon, EyeIcon } from '@heroicons/react/24/outline';

function AdminGraduationPage() {
  // Dummy data peserta magang dengan status laporan dan kelulusan
  const [internsGraduationData, setInternsGraduationData] = useState(() => {
    const savedGraduationData = localStorage.getItem('adminGraduationData');
    if (savedGraduationData) {
      return JSON.parse(savedGraduationData);
    }
    return [
      {
        id: 'int001',
        name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        finalReportStatus: 'Disetujui',
        overallGraduationStatus: 'Belum Lulus',
        completionDate: null,
        graduationPredicate: null, // Tambahkan properti ini
        notes: '',
      },
      {
        id: 'int002',
        name: 'Siti Aminah',
        email: 'siti.aminah@example.com',
        finalReportStatus: 'Perlu Revisi',
        overallGraduationStatus: 'Belum Lulus',
        completionDate: null,
        graduationPredicate: null,
        notes: '',
      },
      {
        id: 'int003',
        name: 'Dedi Kurniawan',
        email: 'dedi.kurniawan@example.com',
        finalReportStatus: 'Belum Diperiksa',
        overallGraduationStatus: 'Belum Lulus',
        completionDate: null,
        graduationPredicate: null,
        notes: '',
      },
      {
        id: 'int004',
        name: 'Nurul Hidayah',
        email: 'nurul.hidayah@example.com',
        finalReportStatus: 'Disetujui',
        overallGraduationStatus: 'Lulus',
        completionDate: '2025-07-01',
        graduationPredicate: 'Sangat Baik', // Contoh predikat
        notes: 'Lulus dengan nilai sangat baik.',
      },
    ];
  });

  // State untuk modal Manajemen Kelulusan
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [reviewingIntern, setReviewingIntern] = useState(null);
  const [newGraduationStatus, setNewGraduationStatus] = useState('');
  const [newGraduationPredicate, setNewGraduationPredicate] = useState(''); // State baru untuk predikat
  const [adminNotes, setAdminNotes] = useState('');

  // Efek untuk menyimpan data kelulusan ke localStorage
  useEffect(() => {
    localStorage.setItem('adminGraduationData', JSON.stringify(internsGraduationData));
  }, [internsGraduationData]);

  // --- Manajemen Kelulusan ---
  function openGraduationModal(intern) {
    setReviewingIntern(intern);
    setNewGraduationStatus(intern.overallGraduationStatus);
    setNewGraduationPredicate(intern.graduationPredicate || ''); // Set predikat default
    setAdminNotes(intern.notes || '');
    setIsGraduationModalOpen(true);
  }

  function closeGraduationModal() {
    setIsGraduationModalOpen(false);
    setReviewingIntern(null);
    setNewGraduationStatus('');
    setNewGraduationPredicate('');
    setAdminNotes('');
  }

  const handleUpdateGraduationStatus = (e) => {
    e.preventDefault();
    if (!reviewingIntern) return;

    // Validasi predikat hanya jika statusnya Lulus
    if (newGraduationStatus === 'Lulus' && !newGraduationPredicate) {
        alert('Mohon pilih predikat kelulusan jika statusnya Lulus.');
        return;
    }
    if (newGraduationStatus !== 'Lulus') { // Reset predikat jika tidak Lulus
        setNewGraduationPredicate('');
    }

    if (window.confirm(`Apakah Anda yakin ingin mengubah status kelulusan ${reviewingIntern.name} menjadi "${newGraduationStatus}"?`)) {
      const updatedData = internsGraduationData.map(intern =>
        intern.id === reviewingIntern.id
          ? {
              ...intern,
              overallGraduationStatus: newGraduationStatus,
              completionDate: (newGraduationStatus === 'Lulus' && reviewingIntern.finalReportStatus === 'Disetujui') ? new Date().toISOString().slice(0, 10) : null,
              graduationPredicate: newGraduationStatus === 'Lulus' ? newGraduationPredicate : null, // Simpan predikat hanya jika Lulus
              notes: adminNotes,
            }
          : intern
      );
      setInternsGraduationData(updatedData);
      alert(`Status kelulusan ${reviewingIntern.name} berhasil diubah menjadi ${newGraduationStatus}.`);
      closeGraduationModal();
    }
  };

  // Filter untuk melihat peserta berdasarkan status
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredInterns = internsGraduationData.filter(intern => {
    if (filterStatus === 'All') return true;
    return intern.overallGraduationStatus === filterStatus;
  });


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Manajemen Kelulusan</h2>
      <p className="text-gray-700 mb-6">
        Ubah status kelulusan akhir peserta magang setelah semua persyaratan terpenuhi.
      </p>

      {/* Filter Status Kelulusan */}
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="filterStatus" className="text-gray-700 font-bold">Tampilkan:</label>
        <select
          id="filterStatus"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
        >
          <option value="All">Semua Peserta</option>
          <option value="Belum Lulus">Belum Lulus</option>
          <option value="Lulus">Sudah Lulus</option>
        </select>
      </div>

      {/* Daftar Peserta */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Nama Peserta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Status Laporan Akhir</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Status Kelulusan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Predikat</th> {/* Kolom baru */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tgl. Kelulusan</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredInterns.map((intern) => (
              <tr key={intern.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{intern.name}</td>
                <td className="px-6 py-4 text-sm break-words">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${intern.finalReportStatus === 'Disetujui' ? 'bg-green-100 text-green-800' :
                      intern.finalReportStatus === 'Perlu Revisi' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {intern.finalReportStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm break-words">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${intern.overallGraduationStatus === 'Lulus' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {intern.overallGraduationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {intern.graduationPredicate || '-'} {/* Tampilkan predikat */}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                  {intern.completionDate || '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => openGraduationModal(intern)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Atur Kelulusan"
                  >
                    <AcademicCapIcon className="h-5 w-5 inline-block" /> Atur
                  </button>
                </td>
              </tr>
            ))}
            {filteredInterns.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Tidak ada peserta magang sesuai filter.</td> {/* Ubah colspan */}
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Manajemen Kelulusan */}
      <Transition appear show={isGraduationModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeGraduationModal}>
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
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-4">
                    Manajemen Kelulusan: {reviewingIntern?.name}
                  </Dialog.Title>

                  <div className="mb-4 text-gray-700">
                    <p><strong>Email:</strong> {reviewingIntern?.email}</p>
                    <p><strong>Status Laporan Akhir:</strong>{' '}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold
                        ${reviewingIntern?.finalReportStatus === 'Disetujui' ? 'bg-green-100 text-green-800' :
                          reviewingIntern?.finalReportStatus === 'Perlu Revisi' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {reviewingIntern?.finalReportStatus}
                      </span>
                    </p>
                    {reviewingIntern?.finalReportStatus !== 'Disetujui' && (
                        <p className="text-sm text-red-500 mt-1">Laporan akhir belum Disetujui. Peserta tidak dapat diluluskan.</p>
                    )}
                  </div>

                  <form onSubmit={handleUpdateGraduationStatus}>
                    <div className="mb-4">
                      <label htmlFor="newGraduationStatus" className="block text-gray-700 text-sm font-bold mb-2">Status Kelulusan Akhir:</label>
                      <select
                        id="newGraduationStatus"
                        value={newGraduationStatus}
                        onChange={(e) => setNewGraduationStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        disabled={reviewingIntern?.finalReportStatus !== 'Disetujui'}
                      >
                        <option value="Belum Lulus">Belum Lulus</option>
                        <option value="Lulus">Lulus</option>
                      </select>
                    </div>

                    {newGraduationStatus === 'Lulus' && ( // Tampilkan predikat hanya jika status Lulus
                        <div className="mb-4">
                            <label htmlFor="newGraduationPredicate" className="block text-gray-700 text-sm font-bold mb-2">Predikat Kelulusan:</label>
                            <select
                                id="newGraduationPredicate"
                                value={newGraduationPredicate}
                                onChange={(e) => setNewGraduationPredicate(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                                required={newGraduationStatus === 'Lulus'} // Wajib jika status Lulus
                            >
                                <option value="">Pilih Predikat</option>
                                <option value="Cukup Baik">Cukup Baik</option>
                                <option value="Baik">Baik</option>
                                <option value="Sangat Baik">Sangat Baik</option>
                                <option value="Cum Laude">Cum Laude</option>
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                      <label htmlFor="adminNotes" className="block text-gray-700 text-sm font-bold mb-2">Catatan Admin:</label>
                      <textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="3"
                        placeholder="Tulis catatan kelulusan atau alasan penundaan..."
                      ></textarea>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeGraduationModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200
                            ${reviewingIntern?.finalReportStatus !== 'Disetujui' || (newGraduationStatus === 'Lulus' && !newGraduationPredicate) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={reviewingIntern?.finalReportStatus !== 'Disetujui' || (newGraduationStatus === 'Lulus' && !newGraduationPredicate)}
                      >
                        Simpan Status
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

export default AdminGraduationPage;