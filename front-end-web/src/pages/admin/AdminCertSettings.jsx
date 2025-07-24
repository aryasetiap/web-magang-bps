import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import DocumentPreview from "../../components/DocumentPreview";
import AlertDialog from "../../components/AlertDialog";

function AdminCertSettingsPage() {
  const [certificates, setCertificates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [certificateForm, setCertificateForm] = useState({
    certificateNumber: "",
    predicate: "",
    namaKepalaBPS: "",
    nipKepalaBPS: "",
  });
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedSignedFiles, setSelectedSignedFiles] = useState({});
  const [confirmUploadId, setConfirmUploadId] = useState(null);

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });
  //close alert function
  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  // Tambahkan state search dan pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certRes = await fetch("http://localhost:3000/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const certData = await certRes.json();

        const finalRes = await fetch(
          "http://localhost:3000/final-projects/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const finalData = await finalRes.json();

        const certificateUserIds = certData.map((c) => c.userId);

        const internsFromFinalProjects = finalData.data
          .filter(
            (fp) =>
              fp.status === "accepted" &&
              !certificateUserIds.includes(fp.userId)
          )
          .map((fp) => ({
            id: `pending-${fp.userId}`,
            userId: fp.userId,
            internName: fp.user?.name || "Tanpa Nama",
            institusi: fp.user?.asalInstitusi || "-",
            status: "belum",
            templatePath: null,
            signedFilePath: null,
          }));

        setCertificates([...certData, ...internsFromFinalProjects]);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        setCertificates([]);
      }
    };

    if (token) fetchData();
  }, [token]);

  // --- SEARCH & PAGINATION ---
  const filteredCertificates = certificates.filter(
    (cert) =>
      (cert.internName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (cert.institusi || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCertificates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCertificates = filteredCertificates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const openGenerateModal = (cert) => {
    setSelected(cert);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelected(null);
    setCertificateForm({
      certificateNumber: "",
      predicate: "",
      namaKepalaBPS: "",
      nipKepalaBPS: "",
    });
    setShowModal(false);
  };

  const handleGenerate = async () => {
    const payload = {
      ...certificateForm,
      userId: selected.userId,
    };

    try {
      const res = await fetch("http://localhost:3000/certificates/generate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal generate sertifikat");
      }

      setAlert({
        isOpen: true,
        title: "Berhasil",
        message: "Sertifikat berhasil dibuat!",
        type: "success",
        autoCloseDelay: 2500,
      });
      closeModal();
      window.location.reload();
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Gagal upload file.",
        type: "error",
        autoCloseDelay: 2500,
      });
    }
  };

  const handleDownload = async (certificateId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Gagal mengunduh file");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sertifikat_${certificateId}_${new Date().getTime()}}.pdf`;
      link.click();
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Gagal mengunduh file.",
        type: "error",
        autoCloseDelay: 2500,
      });
    }
  };

  const handleUploadSigned = async (certificateId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingId(certificateId);

    try {
      const res = await fetch(
        `http://localhost:3000/certificates/${certificateId}/upload`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Gagal upload sertifikat bertandatangan"
        );
      }

      // ✅ Update state certificates agar signedFilePath langsung terlihat
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.id === certificateId ? { ...cert, ...data } : cert
        )
      );

      setAlert({
        isOpen: true,
        title: "Berhasil",
        message: "Sertifikat bertandatangan berhasil diunggah!",
        type: "success",
        autoCloseDelay: 2500,
      });
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Gagal upload file.",
        type: "error",
        autoCloseDelay: 2500,
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleConfirmUpload = (certificateId) => {
    setConfirmUploadId(certificateId);
    setAlert({
      isOpen: true,
      title: "Konfirmasi Upload",
      message: "Apakah yakin ingin mengunggah file ini?",
      type: "confirm",
      confirmButtonText: "Ya, Upload",
      cancelButtonText: "Batal",
      onConfirm: async () => {
        await handleUploadSigned(
          certificateId,
          selectedSignedFiles[certificateId]
        );
        setSelectedSignedFiles((prev) => {
          const updated = { ...prev };
          delete updated[certificateId];
          return updated;
        });
      },
      showCancelButton: true,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Pengaturan Sertifikat
      </h2>

      {/* Search Input */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <input
          type="text"
          placeholder="Cari nama peserta atau institusi..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-64"
        />
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Peserta
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Asal Institusi
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              File Sertifikat
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Upload Ditandatangani
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {currentCertificates.map((cert) => (
            <tr key={cert.id} className="border-t">
              <td className="p-3 text-sm font-medium text-center">
                {cert.internName}
              </td>
              <td className="p-3 text-sm font-medium text-center">
                {cert.institusi}
              </td>
              <td className="p-3 text-sm text-gray-700 text-center">
                {cert.templatePath || cert.signedFilePath ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-green-800 bg-green-100">
                    Tersedia
                  </span>
                ) : (
                  "-"
                )}
                {cert.templatePath && (
                  <button
                    onClick={() => handleDownload(cert.id)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 inline" />
                  </button>
                )}
              </td>
              <td className="p-3 text-center">
                {cert.status === "generated" && (
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() =>
                        document.getElementById(`fileInput-${cert.id}`).click()
                      }
                      className="text-sm text-bps-blue font-semibold hover:text-blue-800"
                    >
                      Pilih File
                    </button>
                    <input
                      type="file"
                      accept="application/pdf"
                      id={`fileInput-${cert.id}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedSignedFiles((prev) => ({
                            ...prev,
                            [cert.id]: file,
                          }));
                        }
                      }}
                    />

                    {/* Preview Komponen */}
                    {selectedSignedFiles[cert.id] && (
                      <div className="flex flex-col items-center">
                        <DocumentPreview file={selectedSignedFiles[cert.id]} />
                        <button
                          onClick={() => handleConfirmUpload(cert.id)}
                          disabled={uploadingId === cert.id}
                          title="Unggah Sertifikat Bertandatangan"
                          className="mt-1 text-bps-blue hover:text-blue-800"
                        >
                          <ArrowUpTrayIcon className="h-5 w-5 inline" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {cert.status === "signed" && (
                  <div className="flex items-center justify-center gap-2 text-indigo-700 text-sm">
                    {/* <span>Ditandatangani</span> */}
                    {cert.signedFilePath && (
                      <a
                        href={`http://localhost:3000/${cert.signedFilePath.replace(
                          /\\/g,
                          "/"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                        title="Unduh Sertifikat Ditandatangani"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5 inline" />
                      </a>
                    )}
                  </div>
                )}
              </td>

              <td className="p-3 text-sm text-gray-700 text-center">
                <span
                  className={`inline-block px-2 py-1 text-xs font-semibold rounded-full text-center ${
                    cert.status === "signed"
                      ? "bg-indigo-200 text-indigo-800"
                      : cert.status === "generated"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {cert.status === "signed"
                    ? "Signed"
                    : cert.status === "generated"
                    ? "Generated"
                    : "Not Generated"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => openGenerateModal(cert)}
                  className="text-blue-600 hover:text-blue-800 mr-2"
                >
                  <PencilSquareIcon className="h-5 w-5 inline-block" />
                  Generate
                </button>
              </td>
            </tr>
          ))}
          {currentCertificates.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                Tidak ada sertifikat yang ditemukan.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Kontrol Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
        >
          <ChevronLeftIcon className="h-5 w-5 inline-block" />
        </button>
        <span className="text-sm text-gray-600">
          Halaman {currentPage} dari {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
        >
          <ChevronRightIcon className="h-5 w-5 inline-block" />
        </button>
      </div>

      {/* Modal Generate */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                leave="ease-in duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-bold">
                    Generate Sertifikat
                  </Dialog.Title>

                  <div className="mt-4 space-y-3">
                    <input
                      className="w-full p-2 border rounded"
                      placeholder="Nomor Sertifikat"
                      value={certificateForm.certificateNumber}
                      onChange={(e) =>
                        setCertificateForm((f) => ({
                          ...f,
                          certificateNumber: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={certificateForm.predicate}
                      onChange={(e) =>
                        setCertificateForm((f) => ({
                          ...f,
                          predicate: e.target.value,
                        }))
                      }
                    >
                      <option value="">Pilih Predikat</option>
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup Baik">Cukup Baik</option>
                      <option value="Kurang Baik">Kurang Baik</option>
                    </select>
                    <input
                      className="w-full p-2 border rounded"
                      placeholder="Nama Kepala BPS"
                      value={certificateForm.namaKepalaBPS}
                      onChange={(e) =>
                        setCertificateForm((f) => ({
                          ...f,
                          namaKepalaBPS: e.target.value,
                        }))
                      }
                    />
                    <input
                      className="w-full p-2 border rounded"
                      placeholder="NIP Kepala BPS"
                      value={certificateForm.nipKepalaBPS}
                      onChange={(e) =>
                        setCertificateForm((f) => ({
                          ...f,
                          nipKepalaBPS: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="mr-2 bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded hover:bg-gray-300"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="ml-2 bg-bps-blue text-white font-semibold px-4 py-2 rounded hover:text-white-700 hover:bg-bps-light-blue transition"
                    >
                      Generate
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
        onConfirm={alert.onConfirm}
        showCancelButton={alert.showCancelButton}
        confirmButtonText={alert.confirmButtonText}
        cancelButtonText={alert.cancelButtonText}
      />
    </div>
  );
}

export default AdminCertSettingsPage;
