import React, { useState, useEffect } from "react";
import AlertDialog from "../../components/AlertDialog";

function BiodataPage() {
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setAlert({
          isOpen: true,
          title: "Sesi Habis",
          message: "Anda perlu login kembali untuk melihat biodata.",
          type: "error",
          autoCloseDelay: 2000,
        });
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setFormData({
            namaLengkap: data.namaLengkap || "",
            nimNisn: data.nimNisn || "",
            asalInstitusi: data.asalInstitusi || "",
            jurusanProdi: data.jurusanProdi || "",
            nomorTelepon: data.nomorTelepon || "",
            email: data.email || "",
            alamat: data.alamat || "",
          });
        } else {
          throw new Error(data.message || "Gagal mengambil data biodata.");
        }
      } catch (err) {
        console.error("Gagal mengambil data biodata:", err);
        setAlert({
          isOpen: true,
          title: "Gagal Mengambil Data",
          message: err.message || "Terjadi kesalahan saat memuat biodata.",
          type: "error",
          autoCloseDelay: 3000,
        });
      }
    };

    fetchProfile();
  }, [token]);

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

    setFiles((prev) => ({ ...prev, [name]: file }));

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
      const { email, ...formDataWithoutEmail } = formData;
      const profileRes = await fetch("http://localhost:3000/auth/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataWithoutEmail),
      });

      const profileData = await profileRes.json();
      if (!profileRes.ok)
        throw new Error(profileData.message || "Gagal update biodata.");

      const formDataToSend = new FormData();

      if (files.cv) formDataToSend.append("cv", files.cv);
      if (files.transkripNilai)
        formDataToSend.append("transkripNilai", files.transkripNilai);
      if (files.suratPermohonan)
        formDataToSend.append("suratPermohonan", files.suratPermohonan);

      // const internshipRes = await fetch(
      //   "http://localhost:3000/internship-applications",
      //   {
      //     method: "POST",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: formDataToSend,
      //   }
      // );

      // const internshipData = await internshipRes.json();
      // if (!internshipRes.ok)
      //   throw new Error(internshipData.message || "Gagal upload berkas.");

      setAlert({
        isOpen: true,
        title: "Berhasil",
        message: "Biodata dan berkas berhasil diperbarui.",
        type: "success",
        autoCloseDelay: 3000,
      });

      // setFiles((prev) => ({
      //   ...prev,
      //   cv: null,
      //   transkripNilai: null,
      //   suratPermohonan: null,
      //   cvUrl: internshipData.cvUrl || prev.cvUrl,
      //   transkripNilaiUrl:
      //     internshipData.transkripNilaiUrl || prev.transkripNilaiUrl,
      //   suratPermohonanUrl:
      //     internshipData.suratPermohonanUrl || prev.suratPermohonanUrl,
      // }));
    } catch (error) {
      console.error(error);
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
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-bps-blue"
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
