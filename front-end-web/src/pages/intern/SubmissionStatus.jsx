// File: pages/StatusAjuanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../../components/AlertDialog";

function SubmissionStatusPage() {
  const navigate = useNavigate();
  const [submissionStatus, setSubmissionStatus] = useState("initial");
  const [biodata, setBiodata] = useState(null);
  const [filesExist, setFilesExist] = useState({
    cv: false,
    transkripNilai: false,
    suratPermohonan: false,
  });
  const [feedback, setFeedback] = useState("");
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    // Ambil biodata user
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setBiodata(data);
        }
      } catch (error) {
        setBiodata(null);
      }
    };

    // Cek file di localStorage
    const checkFiles = () => {
      setFilesExist({
        cv: !!localStorage.getItem("cvFileBase64"),
        transkripNilai: !!localStorage.getItem("transkripNilaiFileBase64"),
        suratPermohonan: !!localStorage.getItem("suratPermohonanFileBase64"),
      });
    };

    // Ambil status pengajuan magang
    const fetchSubmissionStatus = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/internship-applications/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const result = await res.json();
          if (result.data && result.data.length > 0) {
            setSubmissionStatus(result.data[0].status);
            setFeedback(result.data[0].feedback || "");
          } else {
            setSubmissionStatus("initial");
          }
        } else {
          setSubmissionStatus("initial");
        }
      } catch (error) {
        setSubmissionStatus("initial");
      }
    };

    fetchProfile();
    checkFiles();
    fetchSubmissionStatus();
  }, [token]);

  // Fungsi submit pengajuan magang
  const handleAjukan = async () => {
    const formData = new FormData();
    if (localStorage.getItem("cvFileBase64"))
      formData.append(
        "cv",
        dataURLtoFile(
          localStorage.getItem("cvFileBase64"),
          localStorage.getItem("cvFileName") || "cv.pdf"
        )
      );
    if (localStorage.getItem("transkripNilaiFileBase64"))
      formData.append(
        "transcript",
        dataURLtoFile(
          localStorage.getItem("transkripNilaiFileBase64"),
          localStorage.getItem("transkripNilaiFileName") || "transkrip.pdf"
        )
      );
    if (localStorage.getItem("suratPermohonanFileBase64"))
      formData.append(
        "requestLetter",
        dataURLtoFile(
          localStorage.getItem("suratPermohonanFileBase64"),
          localStorage.getItem("suratPermohonanFileName") || "surat.pdf"
        )
      );

    try {
      const res = await fetch("http://localhost:3000/internship-applications", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        // alert("Ajuan kamu berhasil dikirim! Menunggu verifikasi.");
        setAlert({
          isOpen: true,
          title: "Ajuan Berhasil Dikirim",
          message: "Ajuan kamu berhasil dikirim! Menunggu verifikasi.",
          type: "success",
          autoCloseDelay: 3000,
        });
        setSubmissionStatus("pending");
        // Bersihkan localStorage setelah berhasil
        ["cv", "transkripNilai", "suratPermohonan"].forEach((key) => {
          localStorage.removeItem(`${key}FileBase64`);
          localStorage.removeItem(`${key}FileName`);
        });
      } else {
        const data = await res.json();
        // alert(data.message || "Gagal mengajukan permohonan.");
        setAlert({
          isOpen: true,
          title: "Gagal Mengajukan Permohonan",
          message: data.message || "Gagal mengajukan permohonan.",
          type: "error",
          autoCloseDelay: 3000,
        });
      }
    } catch (error) {
      // alert("Terjadi kesalahan saat mengirim permohonan.");
      setAlert({
        isOpen: true,
        title: "Kesalahan",
        message: "Terjadi kesalahan saat mengirim permohonan.",
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  // Helper konversi base64 ke File
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // UI
  const renderContent = () => {
    if (!biodata) {
      return (
        <div className="text-center py-10">
          <p className="text-lg text-gray-700">Memuat data biodata...</p>
        </div>
      );
    }

    switch (submissionStatus) {
      case "initial":
        return (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Konfirmasi Data Ajuan Magang
            </h3>
            <p className="text-gray-700 mb-6">
              Mohon periksa kembali data biodata dan kelengkapan berkasmu
              sebelum mengajukan permohonan magang.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 text-lg mb-3">
                Ringkasan Biodata:
              </h4>
              <ul className="list-none space-y-2 text-gray-700">
                <li>
                  <strong>Nama Lengkap:</strong> {biodata.namaLengkap}
                </li>
                <li>
                  <strong>NIM / NIS:</strong> {biodata.nimNisn}
                </li>
                <li>
                  <strong>Asal Institusi:</strong> {biodata.asalInstitusi}
                </li>
                <li>
                  <strong>Jurusan/Prodi:</strong> {biodata.jurusanProdi}
                </li>
                <li>
                  <strong>Nomor Telepon:</strong> {biodata.nomorTelepon}
                </li>
                <li>
                  <strong>Email:</strong> {biodata.email}
                </li>
                <li>
                  <strong>Alamat:</strong> {biodata.alamat}
                </li>
              </ul>
              <h4 className="font-bold text-blue-800 text-lg mt-4 mb-3">
                Kelengkapan Berkas:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li
                  className={filesExist.cv ? "text-green-700" : "text-red-700"}
                >
                  CV: {filesExist.cv ? "Sudah Diunggah" : "Belum Diunggah!"}
                </li>
                <li
                  className={
                    filesExist.transkripNilai
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Transkrip Nilai / Rapor:{" "}
                  {filesExist.transkripNilai
                    ? "Sudah Diunggah"
                    : "Belum Diunggah!"}
                </li>
                <li
                  className={
                    filesExist.suratPermohonan
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  Surat Permohonan Magang:{" "}
                  {filesExist.suratPermohonan
                    ? "Sudah Diunggah"
                    : "Belum Diunggah!"}
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Jika ada data yang belum benar atau berkas yang belum lengkap,
                silakan{" "}
                <a
                  href="/dashboard/biodata"
                  className="text-bps-blue hover:underline font-semibold"
                >
                  ubah di halaman Biodata
                </a>
                .
              </p>
            </div>
            <button
              onClick={handleAjukan}
              className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              disabled={
                !(
                  filesExist.cv &&
                  filesExist.transkripNilai &&
                  filesExist.suratPermohonan
                )
              }
            >
              Ajukan Permohonan Magang
            </button>
            {!(
              filesExist.cv &&
              filesExist.transkripNilai &&
              filesExist.suratPermohonan
            ) && (
              <p className="text-red-500 text-sm mt-2">
                Mohon lengkapi semua berkas di halaman Biodata sebelum
                mengajukan.
              </p>
            )}
          </div>
        );

      case "pending":
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-orange-600 mb-4">
              Status Ajuan: Menunggu Verifikasi
            </h3>
            <p className="text-gray-700 mb-4">
              Permohonan magang kamu telah berhasil diajukan. Kami akan segera
              memverifikasi data dan berkasmu.
            </p>
            <p className="text-gray-600">
              Mohon cek halaman ini secara berkala untuk mengetahui status
              terbaru ajuan kamu.
            </p>
            <div className="mt-6">
              <svg
                className="animate-spin h-8 w-8 text-orange-500 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-500 mt-2">Sedang diproses...</p>
            </div>
          </div>
        );

      case "diterima":
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-green-600 mb-4">
              Status Ajuan: Telah Diterima! 🎉
            </h3>
            <p className="text-gray-700 mb-4">
              Selamat! Permohonan magang kamu di BPS Kabupaten Pringsewu telah{" "}
              <b>DITERIMA</b>.
            </p>
            <p className="text-gray-600">
              Informasi lebih lanjut mengenai jadwal dan langkah berikutnya akan
              disampaikan melalui sistem ini atau email kamu.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Kembali ke Dashboard
            </button>
          </div>
        );

      case "ditolak":
        return (
          <div className="text-center py-10">
            <h3 className="text-2xl font-semibold text-red-600 mb-4">
              Status Ajuan: Ditolak 😞
            </h3>
            <p className="text-gray-700 mb-4">
              Mohon maaf, permohonan magang kamu di BPS Kabupaten Pringsewu
              telah <b>DITOLAK</b>.
            </p>
            <p className="text-gray-600">
              Alasan penolakan: {feedback ? feedback : "-"} Silakan periksa
              kembali kelengkapan atau kesesuaian persyaratan.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Kembali ke Dashboard
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center py-10">
            <p className="text-lg text-gray-700">Status tidak dikenali.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Status Ajuan Magang
      </h2>
      {renderContent()}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </div>
  );
}

export default SubmissionStatusPage;
