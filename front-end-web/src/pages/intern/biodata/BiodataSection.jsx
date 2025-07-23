import React, { useEffect, useState } from "react";
import { useProfile } from "../../../contexts/ProfileContext";
import AlertDialog from "../../../components/AlertDialog";
import { formatDateInputSafe } from "../../../utils/formatDateTime";

function BiodataSection() {
  const { profile, fetchProfile } = useProfile();
  const token = localStorage.getItem("authToken");

  const [formData, setFormData] = useState({
    namaLengkap: "",
    nimNisn: "",
    asalInstitusi: "",
    jurusanProdi: "",
    nomorTelepon: "",
    email: "",
    alamat: "",
    educationStatus: "",
    activityType: "",
    activityStart: "",
    activityEnd: "",
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
        educationStatus: profile.educationStatus || "",
        activityType: profile.activityType || "",
        activityStart: formatDateInputSafe(profile.activityStart),
        activityEnd: formatDateInputSafe(profile.activityEnd),
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const { email, ...dataToSend } = formData;

      const res = await fetch("http://localhost:3000/auth/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal update biodata");

      setAlert({
        isOpen: true,
        title: "Berhasil",
        message: "Biodata berhasil diperbarui.",
        type: "success",
        autoCloseDelay: 3000,
      });

      fetchProfile();
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: error.message,
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  return (
    <div className="bg-purple-50 mt-6 p-6  border border-gray-200 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
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
            { id: "educationStatus", label: "Status Pendidikan" },
            { id: "activityType", label: "Jenis Kegiatan" },
            { id: "activityStart", label: "Tanggal Mulai Kegiatan" },
            { id: "activityEnd", label: "Tanggal Selesai Kegiatan" },
          ].map(({ id, label }) => (
            <div key={id}>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor={id}
              >
                {label}
              </label>

              {id === "educationStatus" ? (
                <select
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Pilih status</option>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="siswa">Siswa</option>
                </select>
              ) : (
                <input
                  type={
                    id === "email"
                      ? "email"
                      : id === "activityStart" || id === "activityEnd"
                      ? "date"
                      : "text"
                  }
                  name={id}
                  value={formData[id]}
                  onChange={handleChange}
                  readOnly={id === "email"}
                  className={`shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 ${
                    id === "email" ? "bg-gray-100 cursor-not-allowed" : ""
                  } focus:outline-none focus:ring-2 focus:ring-bps-blue`}
                  required
                />
              )}
            </div>
          ))}

          <div className="md:col-span-2">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="alamat"
            >
              Alamat Lengkap
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Simpan Biodata
        </button>

        <AlertDialog {...alert} onClose={closeAlert} />
      </form>
    </div>
  );
}

export default BiodataSection;
