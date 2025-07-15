// File: pages/StatusAjuanPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SubmissionStatusPage() {
  const navigate = useNavigate();
  const [submissionStatus, setSubmissionStatus] = useState("initial");
  const [biodata, setBiodata] = useState(null);
  const [filesExist, setFilesExist] = useState({
    cv: false,
    transkripNilai: false,
    suratPermohonan: false,
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
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
        } else {
          console.error("Gagal mengambil biodata:", data.message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const checkFiles = () => {
      setFilesExist({
        cv: !!localStorage.getItem("cvFileBase64"),
        transkripNilai: !!localStorage.getItem("transkripNilaiFileBase64"),
        suratPermohonan: !!localStorage.getItem("suratPermohonanFileBase64"),
      });
    };

    // Tambahkan fetch status pengajuan magang
    const fetchSubmissionStatus = async () => {
      try {
        const res = await fetch("http://localhost:3000/internship-applications/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const result = await res.json();
          // Cek jika ada data pengajuan
          if (result.data && result.data.length > 0 && result.data[0].status) {
            setSubmissionStatus(result.data[0].status);
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

  const handleSubmissions = async () => {
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
        "transcript", // <-- ganti dari transkripNilai
        dataURLtoFile(
          localStorage.getItem("transkripNilaiFileBase64"),
          localStorage.getItem("transkripNilaiFileName") || "transkrip.pdf"
        )
      );
    if (localStorage.getItem("suratPermohonanFileBase64"))
      formData.append(
        "requestLetter", // <-- ganti dari suratPermohonan
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
        alert("Ajuan Anda berhasil dikirim!");
        setSubmissionStatus("pending");
        // Bersihkan localStorage setelah berhasil
        ["cv", "transkripNilai", "suratPermohonan"].forEach((key) => {
          localStorage.removeItem(`${key}FileBase64`);
          localStorage.removeItem(`${key}FileName`);
        });
      } else {
        const data = await res.json();
        alert(data.message || "Gagal mengajukan permohonan.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat mengirim permohonan.");
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]);
    let n = bstr.length; // <-- Ubah dari const ke let
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const renderContent = () => {
    if (!biodata) return <p>Memuat data biodata...</p>;

    const BiodataItem = ({ label, value }) => (
      <div className="grid grid-cols-2 gap-4 py-2 border-b border-blue-100 last:border-b-0">
        <div className="font-semibold text-black-800">{label}</div>
        <div className="text-gray-700 break-words">: {value}</div>
      </div>
    );

    switch (submissionStatus) {
      case "initial":
        return (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Konfirmasi Data Ajuan Magang
            </h3>
            <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 text-lg mb-3">
                Ringkasan Biodata:
              </h4>
              <div className="divide-y divide-blue-100">
                <BiodataItem label="Nama Lengkap" value={biodata.namaLengkap} />
                <BiodataItem label="NIM / NIS" value={biodata.nimNisn} />
                <BiodataItem
                  label="Asal Institusi"
                  value={biodata.asalInstitusi}
                />
                <BiodataItem
                  label="Jurusan/Prodi"
                  value={biodata.jurusanProdi}
                />
                <BiodataItem
                  label="Nomor Telepon"
                  value={biodata.nomorTelepon}
                />
                <BiodataItem label="Email" value={biodata.email} />
                <div className="py-2 border-b border-blue-100">
                  <div className="font-semibold text-black-800 mb-1">
                    Alamat
                  </div>
                  <div className="text-gray-700 break-words">
                    {biodata.alamat}
                  </div>
                </div>
              </div>

              <h4 className="font-bold text-blue-800 text-lg mt-6 mb-3">
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
              onClick={handleSubmissions}
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
          </div>
        );

      case "pending":
        return <p>Status: Menunggu Verifikasi</p>;
      case "accepted":
        return <p>Status: Diterima</p>;
      case "rejected":
        return <p>Status: Ditolak</p>;
      default:
        return <p>Status tidak dikenali</p>;
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Status Ajuan Magang
      </h2>
      {renderContent()}
    </div>
  );
}

export default SubmissionStatusPage;
