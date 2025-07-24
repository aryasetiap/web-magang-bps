import React, { useEffect, useState } from "react";
import { formatDate } from "../../../utils/formatDateTime";
import {
  isValidFile,
  fetchAssignments,
  statusBadge,
} from "../../../utils/assignment";

function AssignmentSection() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isResubmitOpen, setIsResubmitOpen] = useState(false);
  const [submitFile, setSubmitFile] = useState(null);
  const [submitDesc, setSubmitDesc] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const token = localStorage.getItem("authToken");

  // Fetch daftar tugas
  useEffect(() => {
    const loadAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAssignments(token);
        setAssignments(data);
      } catch (err) {
        setError(err.message || "Gagal memuat tugas");
      }
      setLoading(false);
    };
    loadAssignments();
  }, [token, successMsg]);

  // Filter tugas aktif dan riwayat
  const activeAssignments = assignments.filter(
    (a) =>
      !a.submission ||
      a.submission.status === "not_submitted" ||
      a.submission.status === "revisi"
  );
  const historyAssignments = assignments.filter(
    (a) =>
      a.submission &&
      (a.submission.status === "submitted" ||
        a.submission.status === "reviewed")
  );

  // Modal detail tugas
  const openDetail = (assignment) => {
    setSelectedAssignment(assignment);
    setIsDetailOpen(true);
    setIsSubmitOpen(false);
    setIsResubmitOpen(false);
    setSubmitError("");
    setSuccessMsg("");
    setSubmitFile(null);
    setSubmitDesc("");
  };

  // Modal submit tugas
  const openSubmit = () => {
    setIsSubmitOpen(true);
    setIsResubmitOpen(false);
    setSubmitFile(null);
    setSubmitDesc("");
    setSubmitError("");
    setSuccessMsg("");
  };

  // Modal resubmit tugas
  const openResubmit = () => {
    setIsResubmitOpen(true);
    setIsSubmitOpen(false);
    setSubmitFile(null);
    setSubmitDesc("");
    setSubmitError("");
    setSuccessMsg("");
  };

  // Submit tugas
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);

    const fileIsValid = submitFile ? isValidFile(submitFile) : false;
    const descIsValid = submitDesc.trim().length > 0;

    // Minimal salah satu harus diisi
    if (!submitFile && !descIsValid) {
      setSubmitError("File atau deskripsi harus diisi minimal salah satu.");
      setSubmitLoading(false);
      return;
    }
    // Jika ada file, cek validasinya
    if (submitFile && !fileIsValid) {
      setSubmitError("File harus PDF/DOC/DOCX dan maksimal 5MB.");
      setSubmitLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      // File
      if (submitFile && fileIsValid)
        formData.append("submissionFile", submitFile);
      // Deskripsi
      if (descIsValid) formData.append("description", submitDesc.trim());
      const res = await fetch(
        `${baseUrl}/tasks/${selectedAssignment.id}/submissions`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal submit tugas");
      setSuccessMsg("Tugas berhasil disubmit!");
      setIsSubmitOpen(false);
      setIsDetailOpen(false);
    } catch (err) {
      setSubmitError(err.message);
    }
    setSubmitLoading(false);
  };

  // Resubmit tugas
  const handleResubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);

    const fileIsValid = submitFile ? isValidFile(submitFile) : false;
    const descIsValid = submitDesc.trim().length > 0;

    // Minimal salah satu harus diisi
    if (!submitFile && !descIsValid) {
      setSubmitError("File atau deskripsi harus diisi minimal salah satu.");
      setSubmitLoading(false);
      return;
    }
    // Jika ada file, cek validasinya
    if (submitFile && !fileIsValid) {
      setSubmitError("File harus PDF/DOC/DOCX dan maksimal 5MB.");
      setSubmitLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      // File
      if (submitFile && fileIsValid) formData.append("file", submitFile);
      // Deskripsi
      if (descIsValid) formData.append("description", submitDesc.trim());
      const res = await fetch(
        `${baseUrl}/submissions/${selectedAssignment.submission.id}/resubmit`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal resubmit tugas");
      setSuccessMsg("Tugas berhasil di-resubmit!");
      setIsResubmitOpen(false);
      setIsDetailOpen(false);
    } catch (err) {
      setSubmitError(err.message);
    }
    setSubmitLoading(false);
  };

  // UI Badge Status
  const statusBadge = (status) => {
    switch (status) {
      case "not_submitted":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-200 text-yellow-800">
            Belum Disubmit
          </span>
        );
      case "submitted":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-200 text-blue-800">
            Menunggu Penilaian
          </span>
        );
      case "reviewed":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-200 text-green-800">
            Sudah Dinilai
          </span>
        );
      case "revisi":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-200 text-red-800">
            Perlu Revisi
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-green-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Penugasan Saya
      </h3>
      {loading ? (
        <p className="text-gray-600">Memuat tugas...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* Daftar tugas aktif */}
          <h4 className="font-semibold text-lg text-green-800 mb-2">
            Tugas Aktif
          </h4>
          {activeAssignments.length > 0 ? (
            <ul className="space-y-4 mb-6">
              {activeAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {assignment.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        Deadline: {formatDate(assignment.deadline)}
                      </span>
                    </div>
                    {statusBadge(
                      assignment.submission
                        ? assignment.submission.status
                        : "not_submitted"
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {assignment.description}
                  </p>
                  <button
                    className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1 px-4 rounded-lg text-sm mr-2"
                    onClick={() => openDetail(assignment)}
                  >
                    Detail & Submit
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-6">
              Tidak ada tugas aktif saat ini.
            </p>
          )}

          {/* Riwayat tugas */}
          <h4 className="font-semibold text-lg text-purple-800 mb-2">
            Riwayat Tugas
          </h4>
          {historyAssignments.length > 0 ? (
            <ul className="space-y-4">
              {historyAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {assignment.title}
                      </h4>
                      <span className="text-sm text-gray-500">
                        Deadline: {formatDate(assignment.deadline)}
                      </span>
                    </div>
                    {statusBadge(assignment.submission.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    {assignment.description}
                  </p>
                  <div className="text-sm mb-2">
                    {assignment.submission.description && (
                      <span className="block text-gray-700 mb-1">
                        <strong>Deskripsi Submission:</strong>{" "}
                        {assignment.submission.description}
                      </span>
                    )}
                    {assignment.submission.grade !== null && (
                      <span className="mr-4">
                        <strong>Nilai:</strong> {assignment.submission.grade}
                      </span>
                    )}
                    {assignment.submission.feedback && (
                      <span className="text-red-600">
                        <strong>Feedback:</strong>{" "}
                        {assignment.submission.feedback}
                      </span>
                    )}
                  </div>
                  {assignment.submission.filePath && (
                    <a
                      href={`${baseUrl}/${assignment.submission.filePath.replace(
                        /\\/g,
                        "/"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm mt-2 block"
                    >
                      Download File Submission
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              Belum ada tugas yang dinilai/diselesaikan.
            </p>
          )}
        </>
      )}

      {/* Modal Detail Tugas */}
      {isDetailOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg sm:max-w-md relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsDetailOpen(false)}
              aria-label="Tutup modal"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">
              {selectedAssignment.title}
            </h3>
            <p className="mb-2 text-gray-700">
              {selectedAssignment.description}
            </p>
            <p className="mb-2 text-sm text-gray-500">
              Deadline: {formatDate(selectedAssignment.deadline)}
            </p>
            {selectedAssignment.fileUrl && (
              <a
                href={selectedAssignment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm mb-2 block"
              >
                Download File Tugas
              </a>
            )}
            {selectedAssignment.submission &&
              selectedAssignment.submission.description && (
                <div className="mb-2 text-sm text-gray-700">
                  <strong>Deskripsi Submission:</strong>{" "}
                  {selectedAssignment.submission.description}
                </div>
              )}
            <div className="mt-4">
              {/* Status dan aksi submit/resubmit */}
              {selectedAssignment.submission ? (
                <>
                  {selectedAssignment.submission.status === "revisi" ? (
                    <>
                      <p className="text-red-600 text-sm mb-2">
                        Tugas perlu revisi. Feedback:{" "}
                        {selectedAssignment.submission.feedback}
                      </p>
                      {/* Hanya tampilkan tombol jika form resubmit belum dibuka */}
                      {!isResubmitOpen && (
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg mr-2 mb-2"
                          onClick={openResubmit}
                        >
                          Resubmit Tugas
                        </button>
                      )}
                    </>
                  ) : selectedAssignment.submission.status ===
                    "not_submitted" ? (
                    !isSubmitOpen && (
                      <button
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg mb-2"
                        onClick={openSubmit}
                      >
                        Submit Tugas
                      </button>
                    )
                  ) : (
                    <p className="text-green-700 text-sm">
                      Tugas sudah disubmit. Status:{" "}
                      {statusBadge(selectedAssignment.submission.status)}
                    </p>
                  )}
                </>
              ) : (
                !isSubmitOpen && (
                  <button
                    className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg mb-2"
                    onClick={openSubmit}
                  >
                    Submit Tugas
                  </button>
                )
              )}
            </div>
            {/* Formulir submit/resubmit */}
            {isSubmitOpen && (
              <form className="mt-4" onSubmit={handleSubmit}>
                <label className="block mb-2 font-medium text-gray-700">
                  Upload File Tugas (PDF/DOC/DOCX, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSubmitFile(e.target.files[0])}
                  className="block w-full mb-2"
                />
                <label className="block mb-2 font-medium text-gray-700">
                  Deskripsi Submission (opsional)
                </label>
                <textarea
                  className="block w-full mb-2 border rounded p-2 resize-y"
                  rows={3}
                  value={submitDesc}
                  onChange={(e) => setSubmitDesc(e.target.value)}
                  placeholder="Penjelasan tambahan, referensi, atau link penting"
                />
                {submitError && (
                  <p className="text-red-600 text-sm mb-2">{submitError}</p>
                )}
                <button
                  type="submit"
                  className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Mengirim..." : "Submit"}
                </button>
              </form>
            )}
            {isResubmitOpen && (
              <form className="mt-4" onSubmit={handleResubmit}>
                <label className="block mb-2 font-medium text-gray-700">
                  Upload File Revisi (PDF/DOC/DOCX, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSubmitFile(e.target.files[0])}
                  className="block w-full mb-2"
                />
                <label className="block mb-2 font-medium text-gray-700">
                  Deskripsi Submission (opsional)
                </label>
                <textarea
                  className="block w-full mb-2 border rounded p-2 resize-y"
                  rows={3}
                  value={submitDesc}
                  onChange={(e) => setSubmitDesc(e.target.value)}
                  placeholder="Penjelasan tambahan, referensi, atau link penting"
                />
                {submitError && (
                  <p className="text-red-600 text-sm mb-2">{submitError}</p>
                )}
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Mengirim..." : "Resubmit"}
                </button>
              </form>
            )}
            {successMsg && !isDetailOpen && (
              <p className="text-green-700 text-sm mt-2">{successMsg}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignmentSection;
