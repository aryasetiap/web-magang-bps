import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  FingerPrintIcon, DocumentTextIcon, CloudArrowUpIcon, TrashIcon, EyeIcon,
  CheckCircleIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';

function AdminCertSettingsPage() {
  // State untuk Tanda Tangan Digital
  const [digitalSignature, setDigitalSignature] = useState(() => {
    const savedSignature = localStorage.getItem('adminDigitalSignature');
    return savedSignature ? JSON.parse(savedSignature) : null; // { name: 'nama.png', url: 'blob:...' }
  });
  const [isSignatureUploadModalOpen, setIsSignatureUploadModalOpen] = useState(false);
  const [selectedSignatureFile, setSelectedSignatureFile] = useState(null);
  const [signatureUploadStatus, setSignatureUploadStatus] = useState(null); // 'success' | 'error'

  // State untuk Template Sertifikat
  const [certificateTemplate, setCertificateTemplate] = useState(() => {
    const savedTemplate = localStorage.getItem('adminCertificateTemplate');
    return savedTemplate ? JSON.parse(savedTemplate) : null; // { name: 'template.pdf', url: 'blob:...' }
  });
  const [isTemplateUploadModalOpen, setIsTemplateUploadModalOpen] = useState(false);
  const [selectedTemplateFile, setSelectedTemplateFile] = useState(null);
  const [templateUploadStatus, setTemplateUploadStatus] = useState(null); // 'success' | 'error'

  // Efek untuk menyimpan ke localStorage
  useEffect(() => {
    if (digitalSignature) {
      localStorage.setItem('adminDigitalSignature', JSON.stringify(digitalSignature));
    } else {
      localStorage.removeItem('adminDigitalSignature');
    }
  }, [digitalSignature]);

  useEffect(() => {
    if (certificateTemplate) {
      localStorage.setItem('adminCertificateTemplate', JSON.stringify(certificateTemplate));
    } else {
      localStorage.removeItem('adminCertificateTemplate');
    }
  }, [certificateTemplate]);

  // --- Fungsi Tanda Tangan Digital ---
  function openSignatureUploadModal() {
    setSelectedSignatureFile(null);
    setIsSignatureUploadModalOpen(true);
  }

  function closeSignatureUploadModal() {
    setIsSignatureUploadModalOpen(false);
    setSelectedSignatureFile(null);
    setSignatureUploadStatus(null);
  }

  const handleSignatureFileChange = (e) => {
    setSelectedSignatureFile(e.target.files[0]);
  };

  const handleSubmitSignatureUpload = (e) => {
    e.preventDefault();
    if (!selectedSignatureFile) {
      setSignatureUploadStatus('error');
      alert('Mohon pilih file tanda tangan terlebih dahulu.');
      return;
    }

    // Simulasi unggah file (di aplikasi nyata, ini akan ke backend)
    const newSignature = {
      name: selectedSignatureFile.name,
      url: URL.createObjectURL(selectedSignatureFile), // URL lokal sementara
      uploadDate: new Date().toISOString().slice(0, 10),
    };
    setDigitalSignature(newSignature);
    setSignatureUploadStatus('success');
    alert('Tanda tangan digital berhasil diunggah/diperbarui!');
    closeSignatureUploadModal();
  };

  const handleDeleteSignature = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tanda tangan digital ini?')) {
      setDigitalSignature(null);
      alert('Tanda tangan digital berhasil dihapus.');
    }
  };

  // --- Fungsi Template Sertifikat ---
  function openTemplateUploadModal() {
    setSelectedTemplateFile(null);
    setIsTemplateUploadModalOpen(true);
  }

  function closeTemplateUploadModal() {
    setIsTemplateUploadModalOpen(false);
    setSelectedTemplateFile(null);
    setTemplateUploadStatus(null);
  }

  const handleTemplateFileChange = (e) => {
    setSelectedTemplateFile(e.target.files[0]);
  };

  const handleSubmitTemplateUpload = (e) => {
    e.preventDefault();
    if (!selectedTemplateFile) {
      setTemplateUploadStatus('error');
      alert('Mohon pilih file template sertifikat terlebih dahulu.');
      return;
    }

    // Simulasi unggah file (di aplikasi nyata, ini akan ke backend)
    const newTemplate = {
      name: selectedTemplateFile.name,
      url: URL.createObjectURL(selectedTemplateFile), // URL lokal sementara
      uploadDate: new Date().toISOString().slice(0, 10),
    };
    setCertificateTemplate(newTemplate);
    setTemplateUploadStatus('success');
    alert('Template sertifikat berhasil diunggah/diperbarui!');
    closeTemplateUploadModal();
  };

  const handleDeleteTemplate = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus template sertifikat ini?')) {
      setCertificateTemplate(null);
      alert('Template sertifikat berhasil dihapus.');
    }
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Pengaturan Sertifikat</h2>
      <p className="text-gray-700 mb-6">
        Kelola tanda tangan digital dan template sertifikat untuk kelulusan magang.
      </p>

      {/* Bagian Tanda Tangan Digital */}
      <div className="mb-8 p-6 border rounded-lg bg-blue-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <FingerPrintIcon className="h-7 w-7 mr-2" /> Tanda Tangan Digital
        </h3>
        <p className="text-gray-700 mb-4">
          Unggah atau perbarui gambar tanda tangan digital yang akan digunakan pada sertifikat.
        </p>
        
        {digitalSignature ? (
          <div className="flex items-center space-x-4 mb-4">
            <img src={digitalSignature.url} alt="Tanda Tangan Digital" className="h-20 w-auto border rounded-lg p-1" />
            <div>
              <p className="font-medium text-gray-900">{digitalSignature.name}</p>
              <p className="text-sm text-gray-600">Diunggah: {digitalSignature.uploadDate}</p>
              <a href={digitalSignature.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Lihat Gambar</a>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">Belum ada tanda tangan digital yang diunggah.</p>
        )}

        <div className="flex space-x-3">
          <button
            onClick={openSignatureUploadModal}
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" /> {digitalSignature ? 'Ubah' : 'Unggah'} Tanda Tangan
          </button>
          {digitalSignature && (
            <button
              onClick={handleDeleteSignature}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <TrashIcon className="h-5 w-5 mr-2" /> Hapus Tanda Tangan
            </button>
          )}
        </div>
      </div>

      {/* Bagian Template Sertifikat */}
      <div className="p-6 border rounded-lg bg-green-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="h-7 w-7 mr-2" /> Template Sertifikat
        </h3>
        <p className="text-gray-700 mb-4">
          Unggah atau perbarui file template sertifikat (misal: PDF, DOCX) yang akan digunakan.
        </p>

        {certificateTemplate ? (
          <div className="flex items-center space-x-4 mb-4">
            <DocumentTextIcon className="h-16 w-16 text-gray-500" /> {/* Ikon dokumen placeholder */}
            <div>
              <p className="font-medium text-gray-900">{certificateTemplate.name}</p>
              <p className="text-sm text-gray-600">Diunggah: {certificateTemplate.uploadDate}</p>
              <a href={certificateTemplate.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">Lihat File</a>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 mb-4">Belum ada template sertifikat yang diunggah.</p>
        )}

        <div className="flex space-x-3">
          <button
            onClick={openTemplateUploadModal}
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <CloudArrowUpIcon className="h-5 w-5 mr-2" /> {certificateTemplate ? 'Ubah' : 'Unggah'} Template
          </button>
          {certificateTemplate && (
            <button
              onClick={handleDeleteTemplate}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
            >
              <TrashIcon className="h-5 w-5 mr-2" /> Hapus Template
            </button>
          )}
        </div>
      </div>

      {/* Modal Unggah Tanda Tangan Digital */}
      <Transition appear show={isSignatureUploadModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeSignatureUploadModal}>
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
                    Unggah Tanda Tangan Digital
                  </Dialog.Title>

                  <form onSubmit={handleSubmitSignatureUpload}>
                    <div className="mb-4">
                      <label htmlFor="signatureFile" className="block text-gray-700 text-sm font-bold mb-2">Pilih File Gambar (PNG/JPG):</label>
                      <input
                        type="file"
                        id="signatureFile"
                        accept="image/png, image/jpeg"
                        onChange={handleSignatureFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-bps-blue file:text-white
                          hover:file:bg-bps-light-blue"
                        required
                      />
                      {selectedSignatureFile && <p className="mt-2 text-sm text-gray-600">Terpilih: {selectedSignatureFile.name}</p>}
                    </div>
                    {signatureUploadStatus && (
                      <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2
                        ${signatureUploadStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {signatureUploadStatus === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
                        <span className="font-medium">
                          {signatureUploadStatus === 'success' ? 'Unggah berhasil!' : 'Unggah gagal. Pilih file gambar.'}
                        </span>
                      </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeSignatureUploadModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Unggah
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal Unggah Template Sertifikat */}
      <Transition appear show={isTemplateUploadModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeTemplateUploadModal}>
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
                    Unggah Template Sertifikat
                  </Dialog.Title>

                  <form onSubmit={handleSubmitTemplateUpload}>
                    <div className="mb-4">
                      <label htmlFor="templateFile" className="block text-gray-700 text-sm font-bold mb-2">Pilih File Template (PDF/DOCX):</label>
                      <input
                        type="file"
                        id="templateFile"
                        accept=".pdf,.docx" // Hanya menerima PDF dan DOCX
                        onChange={handleTemplateFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-bps-blue file:text-white
                          hover:file:bg-bps-light-blue"
                        required
                      />
                      {selectedTemplateFile && <p className="mt-2 text-sm text-gray-600">Terpilih: {selectedTemplateFile.name}</p>}
                    </div>
                    {templateUploadStatus && (
                      <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2
                        ${templateUploadStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {templateUploadStatus === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
                        <span className="font-medium">
                          {templateUploadStatus === 'success' ? 'Unggah berhasil!' : 'Unggah gagal. Pilih file template.'}
                        </span>
                      </div>
                    )}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeTemplateUploadModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Unggah
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
