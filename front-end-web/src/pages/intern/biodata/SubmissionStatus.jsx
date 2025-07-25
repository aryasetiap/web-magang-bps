// File: pages/StatusAjuanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AlertDialog from "../../../components/AlertDialog";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import DocumentPreview from "../../../components/DocumentPreview";

function SubmissionStatusPage() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const navigate = useNavigate();
  const [submissionStatus, setSubmissionStatus] = useState("initial");
  const [biodata, setBiodata] = useState(null);
  const [filesExist, setFilesExist] = useState({
    cv: false,
    transkripNilai: false,
    suratPermohonan: false,
  });
  const [applicationId, setApplicationId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${baseUrl}/auth/profile`, {
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

    const checkFiles = () => {
      setFilesExist({
        cv: !!localStorage.getItem("cvFileBase64"),
        transkripNilai: !!localStorage.getItem("transkripNilaiFileBase64"),
        suratPermohonan: !!localStorage.getItem("suratPermohonanFileBase64"),
      });
    };

    const fetchSubmissionStatus = async () => {
      try {
        const res = await fetch(`${baseUrl}/internship-applications/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.data && result.data.length > 0) {
            const app = result.data[0];
            setSubmissionStatus(app.status);
            setFeedback(app.feedback || "");
            setApplicationId(app.id);
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

  const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) return null;
    const arr = dataurl.split(",");
    if (arr.length < 2) return null;

    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleAjukan = async () => {
    if (!token) {
      setAlert({
        isOpen: true,
        title: "Token Tidak Ditemukan",
        message: "Sesi login kamu telah habis. Silakan login kembali.",
        type: "error",
        autoCloseDelay: 3000,
      });
      return;
    }

    const formData = new FormData();

    if (biodata?.activityStart) {
      formData.append("startDate", biodata.activityStart);
    }
    if (biodata?.activityEnd) {
      formData.append("endDate", biodata.activityEnd);
    }

    // if (submissionStatus === "ditolak" && applicationId) {
    //   formData.append("applicationId", applicationId);
    //   formData.append("isResubmission", "true");
    // }

    const fileMap = [
      { key: "cv", field: "cv", defaultName: "cv.pdf" },
      {
        key: "transkripNilai",
        field: "transcript",
        defaultName: "transkrip.pdf",
      },
      {
        key: "suratPermohonan",
        field: "requestLetter",
        defaultName: "surat.pdf",
      },
    ];

    fileMap.forEach(({ key, field, defaultName }) => {
      const base64 = localStorage.getItem(`${key}FileBase64`);
      const filename = localStorage.getItem(`${key}FileName`) || defaultName;

      if (base64 && base64.startsWith("data:")) {
        const file = dataURLtoFile(base64, filename);
        if (file) {
          formData.append(field, file);
        }
      }
    });

    try {
      const res = await fetch(`${baseUrl}/internship-applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({
          isOpen: true,
          title: "Ajuan Berhasil Dikirim",
          message: "Ajuan kamu berhasil dikirim! Menunggu verifikasi.",
          type: "success",
          autoCloseDelay: 3000,
        });
        setSubmissionStatus("pending");

        fileMap.forEach(({ key }) => {
          localStorage.removeItem(`${key}FileBase64`);
          localStorage.removeItem(`${key}FileName`);
        });
      } else {
        setAlert({
          isOpen: true,
          title: "Gagal Mengajukan Permohonan",
          message: data.message || "Gagal mengajukan permohonan.",
          type: "error",
          autoCloseDelay: 3000,
        });
      }
    } catch (error) {
      console.error("AJUAN ERROR:", error);
      setAlert({
        isOpen: true,
        title: "Kesalahan",
        message: "Terjadi kesalahan saat mengirim permohonan.",
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  const renderContent = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-blue-800 text-lg">Ringkasan Data</h4>
          <button
            onClick={() => setShowSummary((prev) => !prev)}
            className="text-bps-blue hover:text-bps-dark transition"
          >
            {showSummary ? (
              <EyeSlashIcon className="h-6 w-6" />
            ) : (
              <EyeIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {showSummary && (
          <div className="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200">
            <h4 className="font-bold text-blue-800 text-lg mb-3">
              Ringkasan Biodata
            </h4>
            <table className="table-auto w-full text-left text-sm text-gray-700 border border-blue-100 rounded-md overflow-hidden">
              <tbody>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Nama Lengkap</td>
                  <td className="px-4 py-2">: {biodata?.namaLengkap}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">NIM / NIS</td>
                  <td className="px-4 py-2">: {biodata?.nimNisn}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Asal Institusi</td>
                  <td className="px-4 py-2">: {biodata?.asalInstitusi}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Jurusan / Prodi</td>
                  <td className="px-4 py-2">: {biodata?.jurusanProdi}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Nomor Telepon</td>
                  <td className="px-4 py-2">: {biodata?.nomorTelepon}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Email</td>
                  <td className="px-4 py-2">: {biodata?.email}</td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Jenis Kegiatan</td>
                  <td className="px-4 py-2">
                    : {biodata?.activityType || "-"}
                  </td>
                </tr>
                <tr className="border-b border-blue-100">
                  <td className="font-semibold">Tanggal Mulai - Selesai</td>
                  <td className="px-4 py-2">
                    :{" "}
                    {biodata?.activityStart &&
                      new Date(biodata.activityStart).toLocaleDateString(
                        "id-ID"
                      )}
                    {" - "}
                    {biodata?.activityEnd &&
                      new Date(biodata.activityEnd).toLocaleDateString("id-ID")}
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">Alamat</td>
                  <td className="px-4 py-2">: {biodata?.alamat}</td>
                </tr>
              </tbody>
            </table>

            <h4 className="font-bold text-blue-800 text-lg mt-4 mb-3">
              Kelengkapan Berkas
            </h4>
            <ul className="list-none space-y-4 text-sm text-gray-700">
              {[
                { key: "cv", label: "CV", defaultName: "cv.pdf" },
                {
                  key: "transkripNilai",
                  label: "Transkrip Nilai / Rapor",
                  defaultName: "transkrip.pdf",
                },
                {
                  key: "suratPermohonan",
                  label: "Surat Permohonan Magang",
                  defaultName: "surat.pdf",
                },
              ].map(({ key, label, defaultName }) => {
                const base64 = localStorage.getItem(`${key}FileBase64`);
                const filename =
                  localStorage.getItem(`${key}FileName`) || defaultName;
                const file =
                  base64 && base64.startsWith("data:")
                    ? dataURLtoFile(base64, filename)
                    : null;

                return (
                  <li key={key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {filesExist[key] ? (
                          <span className="text-green-600">✅</span>
                        ) : (
                          <span className="text-red-600">❌</span>
                        )}
                        {label}:{" "}
                        {filesExist[key] ? "Sudah Diunggah" : "Belum Diunggah"}
                      </div>
                    </div>

                    {/* Tampilkan preview jika file tersedia */}
                    {file && (
                      <div className="mt-2">
                        <DocumentPreview file={file} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              {(submissionStatus === "initial" ||
                submissionStatus === "ditolak") && (
                <div className="mt-6 pt-6">
                  <button
                    type="button"
                    onClick={handleAjukan}
                    className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    disabled={
                      !(filesExist.transkripNilai && filesExist.suratPermohonan)
                    }
                  >
                    {submissionStatus === "initial"
                      ? "Ajukan Permohonan Magang"
                      : "Ajukan Ulang Permohonan Magang"}
                  </button>
                  {!(
                    filesExist.transkripNilai && filesExist.suratPermohonan
                  ) && (
                    <p className="text-red-500 text-sm mt-2">
                      Mohon lengkapi berkas transkrip nilai dan surat permohonan
                      magang di halaman Biodata sebelum mengajukan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {submissionStatus === "pending" && (
          <StatusDialogCard
            type="warning"
            title="Status Ajuan: Menunggu Verifikasi"
            message="Permohonan magang kamu telah berhasil diajukan. Kami akan segera memverifikasi data dan berkasmu."
          >
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
          </StatusDialogCard>
        )}

        {submissionStatus === "diterima" && (
          <StatusDialogCard
            type="success"
            title="Status Ajuan: Diterima 🎉"
            message="Selamat! Permohonan magang kamu di BPS Kabupaten Pringsewu telah DITERIMA."
          >
            <p className="text-gray-600">
              Informasi lebih lanjut mengenai jadwal dan langkah berikutnya akan
              disampaikan melalui sistem atau email kamu.
            </p>
            <button
              onClick={() => navigate("/dashboard/activities")}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Lanjut ke Aktivitas
            </button>
          </StatusDialogCard>
        )}

        {submissionStatus === "ditolak" && (
          <StatusDialogCard
            type="error"
            title="Status Ajuan: Ditolak 😞"
            message="Mohon maaf, permohonan magang kamu di BPS Kabupaten Pringsewu telah DITOLAK."
          >
            <p className="text-gray-600 mb-2">
              Alasan penolakan: <b>{feedback || "-"}</b>
            </p>
            <p className="text-gray-600">
              Kamu dapat mengajukan ulang permohonan dengan melengkapi berkas
              yang diperlukan.
            </p>

            <div className="flex flex-col items-center mt-6 space-y-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Kembali ke Dashboard
              </button>
              {!(filesExist.transkripNilai && filesExist.suratPermohonan) && (
                <p className="text-red-500 text-sm text-center">
                  Mohon lengkapi berkas transkrip nilai dan surat permohonan
                  magang di halaman Biodata sebelum mengajukan ulang.
                </p>
              )}
            </div>
          </StatusDialogCard>
        )}
      </div>
    );
  };

  const StatusDialogCard = ({ type, title, message, children }) => {
    let bgColor = "";
    let borderColor = "";

    switch (type) {
      case "success":
        bgColor = "bg-green-50";
        borderColor = "border-green-300";
        break;
      case "warning":
        bgColor = "bg-orange-50";
        borderColor = "border-orange-300";
        break;
      case "error":
        bgColor = "bg-red-50";
        borderColor = "border-red-300";
        break;
      default:
        bgColor = "bg-blue-50";
        borderColor = "border-blue-300";
    }

    return (
      <div
        className={`rounded-lg p-6 border ${bgColor} ${borderColor} text-center`}
      >
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-700 mb-4">{message}</p>
        {children}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-8 border rounded-lg">
      <h2 className="text-2xl font-semibold text-bps-blue mb-6">
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
