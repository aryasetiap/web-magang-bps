import React, { useState, useEffect } from "react";
import AlertDialog from "../../components/AlertDialog";

function InternReports() {
  // State untuk data laporan akhir
  const [recapData, setRecapData] = useState(() => {
    // Hanya inisialisasi bagian laporan akhir dari localStorage
    const savedReport = localStorage.getItem("finalReportFile");
    const savedReportStatus = localStorage.getItem("finalReportStatus");
    const savedRevisiNotes = localStorage.getItem("revisiNotes");

    return {
      submittedFinalReport: savedReport ? JSON.parse(savedReport) : null,
      finalReportStatus: savedReportStatus || "Belum Diperiksa", // Belum Diperiksa, Perlu Revisi, Disetujui
      revisiNotes: savedRevisiNotes || "",
    };
  });

  const [finalReportFile, setFinalReportFile] = useState(null);
  const [reportTitle, setReportTitle] = useState(""); // State untuk judul laporan
  const [reportDescription, setReportDescription] = useState(""); // State untuk deskripsi laporan

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

  const token = localStorage.getItem("authToken"); // Ambil token dari localStorage

  // Efek untuk memuat/menyimpan data laporan akhir ke localStorage
  useEffect(() => {
    localStorage.setItem(
      "finalReportFile",
      JSON.stringify(recapData.submittedFinalReport)
    );
    localStorage.setItem("finalReportStatus", recapData.finalReportStatus);
    if (recapData.revisiNotes) {
      localStorage.setItem("revisiNotes", recapData.revisiNotes);
    } else {
      localStorage.removeItem("revisiNotes");
    }
  }, [recapData]);

  const handleFinalReportUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      // Validasi ukuran file (10MB)
      setAlert({
        isOpen: true,
        title: "Ukuran File Terlalu Besar",
        message: "Ukuran file laporan akhir maksimal 10MB.",
        type: "error",
        autoCloseDelay: 3000,
      });
      setFinalReportFile(null); // Reset input file
      return;
    }
    if (file && file.type !== "application/pdf") {
      // Validasi tipe file (PDF)
      setAlert({
        isOpen: true,
        title: "Format File Tidak Valid",
        message: "Laporan akhir harus dalam format PDF.",
        type: "error",
        autoCloseDelay: 3000,
      });
      setFinalReportFile(null); // Reset input file
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
    if (!finalReportFile && !recapData.submittedFinalReport) {
      // Wajib ada file baru atau sudah ada file
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
      // Deskripsi opsional
      formDataToSend.append("description", reportDescription);
    }

    if (finalReportFile) {
      // Jika ada file baru dipilih
      formDataToSend.append("file", finalReportFile);
    } else if (
      recapData.submittedFinalReport &&
      recapData.submittedFinalReport.name
    ) {
      // Jika tidak ada file baru tapi sudah ada file lama, kirim indikator ke backend
      // Asumsi backend bisa handle: misal 'current_file_name' atau tidak perlu append jika file tidak diubah
      // Anda perlu koordinasi dengan backend di sini
      // formDataToSend.append('existingFile', recapData.submittedFinalReport.name);
    }

    try {
      const res = await fetch("http://localhost:3000/final-projects", {
        method: recapData.submittedFinalReport ? "PATCH" : "POST", // Gunakan PATCH jika sudah ada, POST jika baru
        headers: {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' TIDAK PERLU DISET MANUAL
        },
        body: formDataToSend,
      });

      const data = await res.json();

      if (res.ok) {
        // Asumsi backend mengembalikan URL file yang baru diunggah dan status
        setRecapData((prev) => ({
          ...prev,
          submittedFinalReport: {
            name: finalReportFile?.name || recapData.submittedFinalReport?.name,
            url: data.fileUrl || "#",
          }, // Ambil URL baru jika ada
          finalReportStatus: "Belum Diperiksa", // Reset status setelah unggah baru/ulang
          revisiNotes: "",
        }));
        // Update localStorage global juga
        localStorage.setItem(
          "finalReportFile",
          JSON.stringify({
            name: finalReportFile?.name || recapData.submittedFinalReport?.name,
            url: data.fileUrl || "#",
          })
        );
        localStorage.setItem("finalReportStatus", "Belum Diperiksa");
        localStorage.removeItem("revisiNotes");

        setFinalReportFile(null); // Reset input file
        setAlert({
          isOpen: true,
          title: "Unggah Berhasil!",
          message:
            "Laporan akhir Anda berhasil diunggah/diperbarui. Menunggu pemeriksaan.",
          type: "success",
          autoCloseDelay: 2500,
        });
      } else {
        throw new Error(data.message || "Gagal mengunggah laporan akhir.");
      }
    } catch (error) {
      console.error("Error submitting final report:", error);
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

  // Fungsi simulasi untuk mengubah status laporan (untuk testing, bisa dihapus di production)
  const simulateStatusChange = (status, notes = "") => {
    setRecapData((prev) => ({
      ...prev,
      finalReportStatus: status,
      revisiNotes: notes,
    }));
    localStorage.setItem("finalReportStatus", status);
    if (notes) {
      localStorage.setItem("revisiNotes", notes);
    } else {
      localStorage.removeItem("revisiNotes");
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

      {/* Bagian Unggah Laporan Akhir */}
      <div className="p-6 border rounded-lg bg-purple-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Unggah Laporan Akhir
        </h3>

        {/* Form untuk input judul, deskripsi, dan file */}
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
              // required // Validasi manual lebih baik untuk file
            />
            {finalReportFile && (
              <p className="mt-2 text-sm text-gray-600">
                File terpilih: {finalReportFile.name}
              </p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-2">
              Status Laporan Akhir Anda:
            </p>
            <span
              className={`px-4 py-1 rounded-full font-semibold text-sm
                    ${
                      recapData.finalReportStatus === "Disetujui"
                        ? "bg-green-200 text-green-800"
                        : recapData.finalReportStatus === "Perlu Revisi"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
            >
              {recapData.finalReportStatus}
            </span>
            {recapData.revisiNotes &&
              recapData.finalReportStatus === "Perlu Revisi" && (
                <p className="text-red-600 text-sm mt-2">
                  Catatan Revisi: {recapData.revisiNotes}
                </p>
              )}
          </div>

          {recapData.submittedFinalReport && (
            <div className="mb-4 text-gray-700">
              <p>File Laporan Terakhir Diunggah:</p>
              <a
                href={recapData.submittedFinalReport.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline font-medium"
              >
                {recapData.submittedFinalReport.name}
              </a>
            </div>
          )}

          {recapData.finalReportStatus !== "Disetujui" && (
            <button
              type="submit" // Ini adalah tombol submit form
              disabled={
                !reportTitle.trim() ||
                (!finalReportFile && !recapData.submittedFinalReport)
              }
              className={`mt-4 bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
                        ${
                          !reportTitle.trim() ||
                          (!finalReportFile && !recapData.submittedFinalReport)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
            >
              {recapData.submittedFinalReport
                ? "Unggah Ulang Laporan"
                : "Unggah Laporan Akhir"}
            </button>
          )}
          {recapData.finalReportStatus === "Disetujui" && (
            <p className="text-green-700 mt-4 font-semibold">
              Selamat! Laporan akhir Anda sudah diperiksa dan dinyatakan
              Disetujui.
            </p>
          )}
        </form>

        {/* Tombol simulasi status (Hanya untuk dev/demo) */}
        {/* <div className="mt-8 pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-700 mb-3">
            Simulasi Status (DEV ONLY):
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => simulateStatusChange("Belum Diperiksa")}
              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
            >
              Set Belum Diperiksa
            </button>
            <button
              onClick={() =>
                simulateStatusChange(
                  "Perlu Revisi",
                  "Tolong perbaiki bagian metodologi dan hasil analisis."
                )
              }
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Set Perlu Revisi
            </button>
            <button
              onClick={() => simulateStatusChange("Disetujui")}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm"
            >
              Set Disetujui
            </button>
          </div>
        </div> */}
      </div>

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

export default InternReports;
