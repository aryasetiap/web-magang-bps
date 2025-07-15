import React, { useState, useEffect, useCallback } from "react";
import AlertDialog from "../../components/AlertDialog";
import { useProfile } from "../../contexts/ProfileContext";

function BiodataPage() {
  const { profile, fetchProfile } = useProfile();

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nimNisn: "",
    asalInstitusi: "",
    jurusanProdi: "",
    nomorTelepon: "",
    email: "",
    alamat: "",
  });

  const [files, setFiles] = useState({
    cv: null,
    transkripNilai: null,
    suratPermohonan: null,
  });

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

  const token = localStorage.getItem("authToken");

  // Sinkronkan formData dengan profile context setiap kali profile berubah
  useEffect(() => {
    if (profile) {
      setFormData({
        namaLengkap: profile.namaLengkap || "",
        nimNisn: profile.nimNisn || "",
        asalInstitusi: profile.asalInstitusi || "",
        jurusanProdi: profile.jurusanProdi || "",
        nomorTelepon: profile.nomorTelepon || "",
        email: profile.email || "",
        alamat: profile.alamat || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (!file) return;

    // Validasi file: hanya PDF, max 2MB
    if (file.type !== "application/pdf") {
      setAlert({
        isOpen: true,
        title: "Format Salah",
        message: "Hanya file PDF yang diperbolehkan.",
        type: "error",
        autoCloseDelay: 2500,
      });
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
      return;
    }

    setFiles((prev) => ({ ...prev, [name]: file }));

    // Simpan base64 ke localStorage (opsional, hanya untuk preview, tidak dikirim ke backend)
    try {
      const base64 = await convertFileToBase64(file);
      localStorage.setItem(`${name}FileBase64`, base64);
      localStorage.setItem(`${name}FileName`, file.name);
    } catch (err) {
      console.error(`Gagal mengkonversi ${name}:`, err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setAlert({
        isOpen: true,
        title: "Autentikasi Diperlukan",
        message: "Sesi Anda telah habis. Silakan login ulang.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }

    try {
      // 1. Update biodata ke /auth/profile (tanpa file cv, transkrip, surat)
      const biodataRes = await fetch("http://localhost:3000/auth/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          nimNisn: formData.nimNisn,
          asalInstitusi: formData.asalInstitusi,
          jurusanProdi: formData.jurusanProdi,
          nomorTelepon: formData.nomorTelepon,
          alamat: formData.alamat,
        }),
      });
      const biodataData = await biodataRes.json();
      if (!biodataRes.ok)
        throw new Error(biodataData.message || "Gagal update biodata.");

      setAlert({
        isOpen: true,
        title: "Berhasil",
        message:
          "Biodata berhasil diperbarui. Berkas akan dikirim saat pengajuan.",
        type: "success",
        autoCloseDelay: 3000,
      });

      setTimeout(() => {
        fetchProfile();
      }, 1000);
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: error.message || "Terjadi kesalahan saat menyimpan biodata.",
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Biodata Diri</h2>
      <p className="text-gray-700 mb-6">
        Mohon lengkapi data identitas diri dan unggah berkas yang diperlukan
        untuk kelengkapan data magang. Bidang dengan tanda (
        <span className="text-red-500">*</span>) wajib diisi.
      </p>

      <form onSubmit={handleSubmit}>
        {/* IDENTITAS */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Identitas Diri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: "namaLengkap", label: "Nama Lengkap" },
              { id: "nimNisn", label: "NIM / NISN" },
              { id: "asalInstitusi", label: "Asal Institusi" },
              { id: "jurusanProdi", label: "Jurusan / Prodi" },
              { id: "nomorTelepon", label: "Nomor Telepon" },
              { id: "email", label: "Email" },
            ].map(({ id, label }) => (
              <div key={id}>
                <label
                  htmlFor={id}
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  {label}: <span className="text-red-500">*</span>
                </label>
                <input
                  type={id === "email" ? "email" : "text"}
                  id={id}
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 ${
                    id === "email" ? "bg-gray-100 cursor-not-allowed" : ""
                  } focus:outline-none focus:ring-2 focus:ring-bps-blue`}
                  readOnly={id === "email"}
                  required
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label
                htmlFor="alamat"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Alamat Lengkap: <span className="text-red-500">*</span>
              </label>
              <textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows="3"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* UNGGAH BERKAS */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
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
                  htmlFor={fileKey}
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  {fileKey === "cv"
                    ? "Curriculum Vitae (CV)"
                    : fileKey === "transkripNilai"
                    ? "Transkrip Nilai / Rapor"
                    : "Surat Permohonan Magang"}
                  :<span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  id={fileKey}
                  name={fileKey}
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bps-blue file:text-white hover:file:bg-bps-light-blue"
                />
                {files[fileKey] && (
                  <p className="mt-2 text-sm text-gray-600">
                    Terpilih: {files[fileKey].name}
                  </p>
                )}
                {localStorage.getItem(`${fileKey}FileBase64`) && (
                  <p className="mt-1 text-sm text-green-700">
                    Berkas disimpan sementara.
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Catatan: Berkas akan dikirim saat kamu klik tombol "Ajukan
            Permohonan Magang".
          </p>
        </div>

        <button
          type="submit"
          className="bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Simpan Biodata
        </button>
      </form>

      <AlertDialog
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </div>
  );
}

export default BiodataPage;
