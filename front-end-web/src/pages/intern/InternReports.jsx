import React, { useState, useEffect } from "react";
import AlertDialog from "../../components/AlertDialog";

function InternReports() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [finalReport, setFinalReport] = useState(null); // Data dari backend
  const [finalReportFile, setFinalReportFile] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
  });

  const token = localStorage.getItem("authToken");

  // Fetch laporan akhir dari backend
  useEffect(() => {
    const fetchFinalReport = async () => {
      try {
        const res = await fetch(`${baseUrl}/final-projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.length > 0) {
          setFinalReport(data[0]);
          setReportTitle(data[0].title || "");
          setReportDescription(data[0].description || "");
        }
      } catch (err) {
        console.error("Gagal mengambil laporan akhir:", err);
      }
    };
    if (token) fetchFinalReport();
  }, [token]);

  const handleFinalReportUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setAlert({
        isOpen: true,
        title: "Ukuran File Terlalu Besar",
        message: "Ukuran file laporan akhir maksimal 10MB.",
        type: "error",
        autoCloseDelay: 3000,
      });
      setFinalReportFile(null);
      return;
    }
    if (file && file.type !== "application/pdf") {
      setAlert({
        isOpen: true,
        title: "Format File Tidak Valid",
        message: "Laporan akhir harus dalam format PDF.",
        type: "error",
        autoCloseDelay: 3000,
      });
      setFinalReportFile(null);
      return;
    }
    setFinalReportFile(file);
  };

  const handleSubmitFinalReport = async () => {
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

    if (!reportTitle.trim()) {
      setAlert({
        isOpen: true,
        title: "Validasi Input",
        message: "Judul laporan wajib diisi.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }

    if (!finalReportFile && !finalReport?.filePath) {
      setAlert({
        isOpen: true,
        title: "Validasi Berkas",
        message: "Mohon pilih file laporan akhir terlebih dahulu.",
        type: "error",
        autoCloseDelay: 2000,
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", reportTitle);
    if (reportDescription.trim()) {
      formDataToSend.append("description", reportDescription);
    }
    if (finalReportFile) {
      formDataToSend.append("file", finalReportFile);
    }

    try {
      const url = finalReport
        ? `${baseUrl}/final-projects/${finalReport.id}`
        : `${baseUrl}/final-projects`;

      const method = finalReport ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        setFinalReport(data); // Update data laporan akhir
        setFinalReportFile(null);
        setAlert({
          isOpen: true,
          title: "Unggah Berhasil!",
          message: "Laporan akhir Anda berhasil diunggah/diperbarui.",
          type: "success",
          autoCloseDelay: 2500,
        });
      } else {
        throw new Error(data.message || "Gagal mengunggah laporan akhir.");
      }
    } catch (error) {
      setAlert({
        isOpen: true,
        title: "Unggah Gagal!",
        message:
          error.message || "Terjadi kesalahan saat mengunggah laporan akhir.",
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Laporan Akhir Magang
      </h2>
      <p className="text-gray-700 mb-6">
        Unggah laporan akhir magang Anda dan pantau status pemeriksaannya.
      </p>

      <div className="p-6 border rounded-lg bg-purple-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Unggah Laporan Akhir
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitFinalReport();
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="reportTitle"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Judul Laporan: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="reportTitle"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              placeholder="Contoh: Laporan Analisis Data Keuangan BPS"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="reportDescription"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Deskripsi Laporan (Opsional):
            </label>
            <textarea
              id="reportDescription"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
              rows="3"
              placeholder="Ringkasan singkat isi laporan..."
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              htmlFor="finalReportFile"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Pilih File Laporan (PDF, maks 10MB):{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="finalReportFile"
              accept=".pdf"
              onChange={handleFinalReportUpload}
              className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-bps-blue file:text-white
                        hover:file:bg-bps-light-blue"
            />
            {finalReportFile && (
              <p className="mt-2 text-sm text-gray-600">
                File terpilih: {finalReportFile.name}
              </p>
            )}
          </div>

          {/* Status, URL, dan Feedback */}
          {finalReport && (
            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">
                Status Laporan Akhir Anda:
              </p>
              <span
                className={`px-4 py-1 rounded-full font-semibold text-sm
                  ${
                    finalReport.status === "accepted"
                      ? "bg-green-200 text-green-800"
                      : finalReport.status === "revisi"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
              >
                {finalReport.status === "accepted"
                  ? "Disetujui"
                  : finalReport.status === "revisi"
                  ? "Perlu Revisi"
                  : "Belum Diperiksa"}
              </span>
              {finalReport.feedback && (
                <p className="text-red-600 text-sm mt-2">
                  Catatan Feedback: {finalReport.feedback}
                </p>
              )}
              <div className="mt-2 text-gray-700">
                <p>File Laporan Terakhir Diunggah:</p>
                <a
                  href={`${baseUrl}/${finalReport.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-medium"
                >
                  {finalReport.title}
                </a>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!reportTitle.trim() || (!finalReportFile && !finalReport)}
            className={`mt-4 bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
    ${
      !reportTitle.trim() || (!finalReportFile && !finalReport)
        ? "opacity-50 cursor-not-allowed"
        : ""
    }`}
          >
            {finalReport ? "Unggah Ulang Laporan" : "Unggah Laporan Akhir"}
          </button>

          {finalReport?.status === "accepted" && (
            <p className="text-green-700 mt-4 font-semibold">
              Laporan akhir Anda telah disetujui. Anda dapat menggantinya jika
              diperlukan.
            </p>
          )}
        </form>
      </div>

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

export default InternReports;
