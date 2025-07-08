import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, AcademicCapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function AdminCertSettingsPage() {
  // State untuk data Mahasiswa Lulus dan Sertifikat (tetap ada)
  const [graduatedInternsCertData, setGraduatedInternsCertData] = useState(() => {
    const savedCertData = localStorage.getItem('adminGraduatedInternsCertData');
    if (savedCertData) {
      return JSON.parse(savedCertData);
    }
    // Ambil data kelulusan dari AdminGraduationPage
    const graduationData = JSON.parse(localStorage.getItem('adminGraduationData') || '[]');
    const acceptedApplicants = JSON.parse(localStorage.getItem('adminApplicants') || '[]');

    const initialCertData = graduationData
      .filter(intern => intern.overallGraduationStatus === 'Lulus')
      .map(intern => {
        const applicantInfo = acceptedApplicants.find(app => app.id === intern.id);
        return {
          id: intern.id,
          name: intern.name,
          asalInstitusi: applicantInfo?.asalInstitusi || 'N/A',
          graduationPredicate: intern.graduationPredicate,
          generatedCertUrl: `/assets/generated_cert_${intern.id}.pdf`, // Dummy URL sertifikat generated backend
          signedCertUrl: null, // URL sertifikat yang sudah ditandatangani manual
          signedFileName: null,
        };
      });
    return initialCertData;
  });

  const [isUploadSignedCertModalOpen, setIsUploadSignedCertModalOpen] = useState(false);
  const [uploadingSignedIntern, setUploadingSignedIntern] = useState(null);
  const [selectedSignedCertFile, setSelectedSignedCertFile] = useState(null);

  // --- Efek untuk menyimpan ke localStorage (hanya data sertifikat lulusan) ---
  useEffect(() => {
    localStorage.setItem('adminGraduatedInternsCertData', JSON.stringify(graduatedInternsCertData));
  }, [graduatedInternsCertData]);


  // --- Fungsi Manajemen Sertifikat Lulusan ---
  function openUploadSignedCertModal(intern) {
    setUploadingSignedIntern(intern);
    setSelectedSignedCertFile(null);
    setIsUploadSignedCertModalOpen(true);
  }

  function closeUploadSignedCertModal() {
    setIsUploadSignedCertModalOpen(false);
    setUploadingSignedIntern(null);
    setSelectedSignedCertFile(null);
  }

  const handleSignedCertFileChange = (e) => {
    setSelectedSignedCertFile(e.target.files[0]);
  };

  const handleSubmitSignedCertUpload = (e) => {
    e.preventDefault();
    if (!selectedSignedCertFile || !uploadingSignedIntern) {
      alert('Mohon pilih file sertifikat yang sudah ditandatangani.');
      return;
    }

    const newSignedCert = {
      name: selectedSignedCertFile.name,
      url: URL.createObjectURL(selectedSignedCertFile), // URL lokal sementara
    };

    setGraduatedInternsCertData(prevData =>
      prevData.map(intern =>
        intern.id === uploadingSignedIntern.id
          ? { ...intern, signedCertUrl: newSignedCert.url, signedFileName: newSignedCert.name }
          : intern
      )
    );
    alert(`Sertifikat ditandatangani untuk ${uploadingSignedIntern.name} berhasil diunggah!`);
    closeUploadSignedCertModal();
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Pengaturan Sertifikat</h2>
      <p className="text-gray-700 mb-6">
        Kelola sertifikat peserta magang yang telah lulus.
      </p>

      {/* Bagian Manajemen Sertifikat Lulusan */}
      <div className="p-6 border rounded-lg bg-purple-50"> {/* mb-8 dihapus karena ini bagian pertama */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <AcademicCapIcon className="h-7 w-7 mr-2" /> Sertifikat Peserta Lulus
        </h3>
        <p className="text-gray-700 mb-4">
          Kelola sertifikat untuk mahasiswa yang telah dinyatakan lulus magang.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Nama Peserta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Asal Institusi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Predikat</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Unduh Template</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Upload Ditandatangani</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Final Sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {graduatedInternsCertData.map((intern) => (
                <tr key={intern.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 break-words">{intern.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 break-words">{intern.asalInstitusi}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 break-words">{intern.graduationPredicate || '-'}</td>
                  <td className="px-4 py-4 text-center text-sm">
                    {intern.generatedCertUrl ? (
                      <a href={intern.generatedCertUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900" title="Unduh Sertifikat Otomatis">
                        <ArrowDownTrayIcon className="h-6 w-6 mx-auto" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    <button
                      onClick={() => openUploadSignedCertModal(intern)}
                      className="text-green-600 hover:text-green-900"
                      title={intern.signedCertUrl ? "Ubah Sertifikat Ditandatangani" : "Unggah Sertifikat Ditandatangani"}
                    >
                      <ArrowUpTrayIcon className="h-6 w-6 mx-auto" />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    {intern.signedCertUrl ? (
                      <a href={intern.signedCertUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-900" title="Unduh Sertifikat Final">
                        <DocumentTextIcon className="h-6 w-6 mx-auto" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {graduatedInternsCertData.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Belum ada peserta yang lulus magang.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Unggah Sertifikat Ditandatangani (tetap sama) */}
      <Transition appear show={isUploadSignedCertModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeUploadSignedCertModal}>
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
                    Unggah Sertifikat Ditandatangani
                  </Dialog.Title>
                  <p className="text-gray-700 mb-4">
                    Unggah sertifikat yang telah ditandatangani manual untuk <strong>{uploadingSignedIntern?.name}</strong>.
                  </p>

                  <form onSubmit={handleSubmitSignedCertUpload}>
                    <div className="mb-4">
                      <label htmlFor="signedCertFile" className="block text-gray-700 text-sm font-bold mb-2">Pilih File Sertifikat (PDF):</label>
                      <input
                        type="file"
                        id="signedCertFile"
                        accept=".pdf"
                        onChange={handleSignedCertFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-bps-blue file:text-white
                          hover:file:bg-bps-light-blue"
                        required
                      />
                      {selectedSignedCertFile && <p className="mt-2 text-sm text-gray-600">Terpilih: {selectedSignedCertFile.name}</p>}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeUploadSignedCertModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Unggah Sertifikat
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

export default AdminCertSettingsPage;