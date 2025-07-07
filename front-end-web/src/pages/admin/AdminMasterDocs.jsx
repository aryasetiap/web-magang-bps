import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, EyeIcon, TrashIcon, CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline';

function AdminMasterDocsPage() {
  // Dummy data dokumen master
  const [documents, setDocuments] = useState(() => {
    const savedDocs = localStorage.getItem('adminMasterDocuments');
    if (savedDocs) {
      return JSON.parse(savedDocs);
    }
    return [
      { id: 'doc001', name: 'Template Laporan Magang', type: 'Template', fileName: 'template_laporan.pdf', url: '#', uploadDate: '2025-01-15' },
      { id: 'doc002', name: 'Panduan Peserta Magang', type: 'Panduan', fileName: 'panduan_magang.pdf', url: '#', uploadDate: '2025-02-01' },
      { id: 'doc003', name: 'Materi Orientasi BPS', type: 'Materi Umum', fileName: 'materi_orientasi.pptx', url: '#', uploadDate: '2025-03-10' },
    ];
  });

  // State untuk modal Unggah Dokumen
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocType, setUploadDocType] = useState('Panduan'); // Default type

  // Efek untuk menyimpan data dokumen ke localStorage
  useEffect(() => {
    localStorage.setItem('adminMasterDocuments', JSON.stringify(documents));
  }, [documents]);

  // --- Unggah Dokumen ---
  function openUploadModal() {
    setUploadFile(null);
    setUploadDocName('');
    setUploadDocType('Panduan');
    setIsUploadModalOpen(true);
  }

  function closeUploadModal() {
    setIsUploadModalOpen(false);
  }

  const handleFileUploadChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!uploadDocName || !uploadDocType || !uploadFile) {
      alert('Mohon lengkapi semua bidang dan pilih file.');
      return;
    }

    const newDocument = {
      id: `doc${Date.now()}`,
      name: uploadDocName,
      type: uploadDocType,
      fileName: uploadFile.name,
      url: URL.createObjectURL(uploadFile), // Buat URL objek untuk preview lokal
      uploadDate: new Date().toISOString().slice(0, 10),
    };

    setDocuments([...documents, newDocument]);
    alert(`Dokumen "${uploadDocName}" berhasil diunggah!`);
    closeUploadModal();
    // Di aplikasi nyata: Kirim file ke backend (FormData) dan simpan metadata di database
  };

  // --- Hapus Dokumen ---
  const handleDeleteDocument = (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus dokumen "${name}"?`)) {
      setDocuments(documents.filter(doc => doc.id !== id));
      alert(`Dokumen "${name}" berhasil dihapus.`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Master Dokumen</h2>
      <p className="text-gray-700 mb-6">
        Kelola dokumen umum seperti template laporan, panduan, dan materi umum lainnya.
      </p>

      {/* Tombol Unggah Dokumen Baru */}
      <div className="mb-6 text-right">
        <button
          onClick={openUploadModal}
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
        >
          <CloudArrowUpIcon className="h-5 w-5 mr-2" /> Unggah Dokumen Baru
        </button>
      </div>

      {/* Daftar Dokumen */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Nama Dokumen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Nama File</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Tgl. Unggah</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{doc.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">{doc.type}</td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">{doc.fileName}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{doc.uploadDate}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Lihat/Unduh Dokumen"
                  >
                    <EyeIcon className="h-5 w-5 inline-block" /> Lihat
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.name)}
                    className="text-red-600 hover:text-red-900"
                    title="Hapus Dokumen"
                  >
                    <TrashIcon className="h-5 w-5 inline-block" /> Hapus
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada dokumen master yang diunggah.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Unggah Dokumen */}
      <Transition appear show={isUploadModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeUploadModal}>
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
                    Unggah Dokumen Baru
                  </Dialog.Title>

                  <form onSubmit={handleSubmitUpload}>
                    <div className="mb-4">
                      <label htmlFor="docName" className="block text-gray-700 text-sm font-bold mb-2">Nama Dokumen:</label>
                      <input
                        type="text"
                        id="docName"
                        value={uploadDocName}
                        onChange={(e) => setUploadDocName(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="docType" className="block text-gray-700 text-sm font-bold mb-2">Tipe Dokumen:</label>
                      <select
                        id="docType"
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="Panduan">Panduan</option>
                        <option value="Template">Template</option>
                        <option value="Materi Umum">Materi Umum</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="fileUpload" className="block text-gray-700 text-sm font-bold mb-2">Pilih File:</label>
                      <input
                        type="file"
                        id="fileUpload"
                        onChange={handleFileUploadChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-bps-blue file:text-white
                          hover:file:bg-bps-light-blue"
                        required
                      />
                      {uploadFile && <p className="mt-2 text-sm text-gray-600">Terpilih: {uploadFile.name}</p>}
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeUploadModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Unggah Dokumen
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

export default AdminMasterDocsPage;
