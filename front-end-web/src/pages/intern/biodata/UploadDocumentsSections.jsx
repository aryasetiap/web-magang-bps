import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../../../components/AlertDialog";
import DocumentPreview from "../../../components/DocumentPreview";

function UploadDocumentsSection() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    cv: null,
    transkripNilai: null,
    suratPermohonan: null,
  });

  const fileRefs = {
    cv: useRef(null),
    transkripNilai: useRef(null),
    suratPermohonan: useRef(null),
  };

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setAlert({
        isOpen: true,
        title: "Format Salah",
        message: "Hanya file PDF yang diperbolehkan.",
        type: "error",
        autoCloseDelay: 2500,
      });
      fileRefs[name].current.value = ""; // reset input file secara manual
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAlert({
        isOpen: true,
        title: "Ukuran File Terlalu Besar",
        message: "Ukuran file maksimal 2MB.",
        type: "error",
        autoCloseDelay: 2500,
      });
      fileRefs[name].current.value = ""; // reset juga jika error
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));
  };

  const handleSave = async () => {
    try {
      for (const key in files) {
        const file = files[key];
        if (file) {
          const base64 = await convertFileToBase64(file);
          localStorage.setItem(`${key}FileBase64`, base64);
          localStorage.setItem(`${key}FileName`, file.name);
        }
      }

      setAlert({
        isOpen: true,
        title: "Berkas Disimpan",
        message: "Berkas berhasil disimpan ke penyimpanan sementara.",
        type: "success",
        autoCloseDelay: 2500,
      });
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan berkas.",
        type: "error",
        autoCloseDelay: 2500,
      });
      console.error("Gagal menyimpan file:", err);
    }
  };

  const goToSubmissionsPage = () => {
    navigate("/dashboard/submissions");
  };

  return (
    <div className="space-y-6 mt-6 bg-emerald-50 p-6 border border-gray-200 rounded-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Unggah Berkas
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Unggah berkas PDF maksimal 2MB. Tanda (
        <span className="text-red-500">*</span>) wajib.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["cv", "transkripNilai", "suratPermohonan"].map((fileKey) => (
          <div key={fileKey}>
            <label
              className="block text-gray-700 font-medium mb-2"
              htmlFor={fileKey}
            >
              {fileKey === "cv"
                ? "Curriculum Vitae (CV)"
                : fileKey === "transkripNilai"
                ? "Transkrip Nilai / Rapor"
                : "Surat Permohonan Magang"}
              {fileKey !== "cv" && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={fileRefs[fileKey]}
              type="file"
              name={fileKey}
              id={fileKey}
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-bps-blue file:text-white hover:file:bg-bps-light-blue"
              required={fileKey !== "cv"}
            />

            {files[fileKey] && <DocumentPreview file={files[fileKey]} />}
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        className="bg-bps-green hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
      >
        Simpan Berkas
      </button>

      <p className="text-sm text-gray-600">
        Catatan: Berkas akan dikirim saat kamu klik tombol "Ajukan Permohonan
        Magang" di halaman{" "}
        <span
          className="font-semibold text-bps-blue cursor-pointer hover:underline"
          onClick={goToSubmissionsPage}
        >
          Status Ajuan
        </span>
        .
      </p>

      <AlertDialog {...alert} onClose={closeAlert} />
    </div>
  );
}

export default UploadDocumentsSection;
