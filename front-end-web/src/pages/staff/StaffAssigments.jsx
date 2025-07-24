import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import AlertDialog from "../../components/AlertDialog";

function StaffAssignmentsPage() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [interns, setInterns] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState([]);
  const [formDeadline, setFormDeadline] = useState("");
  const [formFile, setFormFile] = useState(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingAssignment, setReviewingAssignment] = useState(null);
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewScore, setReviewScore] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  const token = localStorage.getItem("authToken");

  // --- Fetch Data Awal (Interns dan Assignments) ---
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    if (!token) {
      setAlert({
        isOpen: true,
        title: "Autentikasi Diperlukan",
        message: "Sesi Anda telah habis. Silakan login ulang.",
        type: "error",
        autoCloseDelay: 2000,
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Ambil semua aplikasi magang yang diterima
      const appsRes = await fetch(`${baseUrl}/internship-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsRaw = await appsRes.json();
      const appsArray = Array.isArray(appsRaw.data) ? appsRaw.data : [];
      // Filter hanya yang statusnya diterima
      const acceptedInterns = appsArray
        .filter(
          (app) =>
            app.status === "diterima" &&
            app.applicant?.role?.name?.toLowerCase() === "intern"
        )
        .map((app) => ({
          ...app.applicant,
          applicationId: app.id, // jika perlu id aplikasi
          verifiedApplications: app.status,
        }));
      setInterns(acceptedInterns);

      // 2. Ambil semua tugas
      const tasksRes = await fetch(`${baseUrl}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksRaw = await tasksRes.json();
      const tasks = tasksRaw.data || [];

      // 3. Ambil detail & submissions untuk tiap tugas
      const detailedTasks = await Promise.all(
        tasks.map(async (task) => {
          const [detailRes, submissionRes] = await Promise.all([
            fetch(`${baseUrl}/tasks/${task.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${baseUrl}/tasks/${task.id}/submissions`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const detail = await detailRes.json();
          const submissions = await submissionRes.json();

          return {
            ...task,
            assignedTo: detail?.assignedTo || [],
            submissions: Array.isArray(submissions) ? submissions : [],
          };
        })
      );

      setAssignments(detailedTasks);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat data.");
      setAlert({
        isOpen: true,
        title: "Gagal Memuat Data",
        message: err.message || "Terjadi kesalahan saat mengambil data.",
        type: "error",
        autoCloseDelay: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // --- Filter dan Pagination ---
  const filteredAssignments = assignments.filter((assignment) => {
    const titleMatch = assignment.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const statusMatch =
      filterStatus === "all" ||
      assignment.submissions?.some((s) => s.status === filterStatus);

    return titleMatch && statusMatch;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- CRUD Tugas ---
  function openCreateModal() {
    setEditingAssignment(null);
    setFormTitle("");
    setFormDescription("");
    setFormAssignedTo([]);
    setFormDeadline("");
    setFormFile(null);
    setIsCreateModalOpen(true);
  }

  function openEditModal(assignment) {
    setEditingAssignment(assignment);
    setFormTitle(assignment.title);
    setFormDescription(assignment.description);
    setFormAssignedTo(assignment.assignedTo || []);
    setFormDeadline(assignment.deadline.split("T")[0]);
    setFormFile(null);
    setIsCreateModalOpen(true);
  }

  function closeModal() {
    setIsCreateModalOpen(false);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setAlert({
        isOpen: true,
        title: "Ukuran File Terlalu Besar",
        message: "Ukuran file maksimal 5MB.",
        type: "error",
      });
      setFormFile(null);
      return;
    }
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (file && !allowedTypes.includes(file.type)) {
      setAlert({
        isOpen: true,
        title: "Format File Tidak Valid",
        message: "File harus PDF atau DOC/DOCX.",
        type: "error",
      });
      setFormFile(null);
      return;
    }
    setFormFile(file);
  };

  const handleCreateOrUpdateAssignment = async (e) => {
    e.preventDefault();

    if (!formTitle || !formDescription || !formDeadline) {
      setAlert({
        isOpen: true,
        title: "Validasi Input",
        message: "Judul, deskripsi, dan deadline wajib diisi.",
        type: "error",
      });
      return;
    }

    if (formAssignedTo.length === 0) {
      setAlert({
        isOpen: true,
        title: "Validasi Input",
        message: "Mohon pilih setidaknya satu peserta magang.",
        type: "error",
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formTitle);
    formDataToSend.append("description", formDescription);
    formDataToSend.append("deadline", formDeadline);

    if (formFile) {
      formDataToSend.append("file", formFile);
    }

    let method = "POST";
    let url = `${baseUrl}/tasks`;
    let taskId = null;

    try {
      // Simpan (buat atau edit) tugas
      if (editingAssignment) {
        method = "PATCH";
        url = `${baseUrl}/tasks/${editingAssignment.id}`;
      }

      const res = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal memproses tugas.");
      }

      taskId = editingAssignment?.id || result?.data?.id;

      // --- Langkah Assign atau Reassign Intern ---
      if (taskId) {
        const assignRes = await fetch(`${baseUrl}/tasks/${taskId}/assign`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            internIds: formAssignedTo.map((id) => Number(id)),
          }),
        });

        const assignResult = await assignRes.json();

        if (!assignRes.ok) {
          throw new Error(
            assignResult.message ||
              "Tugas berhasil disimpan, tetapi gagal assign intern."
          );
        }
      }

      setAlert({
        isOpen: true,
        title: "Berhasil!",
        message: editingAssignment
          ? "Tugas berhasil diperbarui dan ditugaskan ulang!"
          : "Tugas baru berhasil dibuat dan ditugaskan!",
        type: "success",
        autoCloseDelay: 1500,
      });

      closeModal();
      fetchData();
    } catch (err) {
      console.error("Error saving assignment:", err);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: err.message || "Terjadi kesalahan saat menyimpan tugas.",
        type: "error",
      });
    }
  };

  const handleDeleteAssignment = (id, title) => {
    setAlert({
      isOpen: true,
      title: "Konfirmasi Hapus Tugas",
      message: `Apakah Anda yakin ingin menghapus tugas "${title}"?`,
      type: "confirm",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      onConfirm: async () => {
        closeAlert();
        try {
          const res = await fetch(`${baseUrl}/tasks/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setAlert({
              isOpen: true,
              title: "Berhasil!",
              message: `Tugas "${title}" berhasil dihapus.`,
              type: "success",
              autoCloseDelay: 1500,
            });
            fetchData();
          } else {
            const result = await res.json();
            throw new Error(result.message || "Gagal menghapus tugas.");
          }
        } catch (err) {
          console.error("Error deleting assignment:", err);
          setAlert({
            isOpen: true,
            title: "Gagal!",
            message: err.message || "Terjadi kesalahan saat menghapus tugas.",
            type: "error",
          });
        }
      },
      showCancelButton: true,
    });
  };

  function getLoggedInfoFromToken(token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.name || payload.email;
    } catch (error) {
      console.error("Failed to parse token", error);
      return null;
    }
  }

  const name = getLoggedInfoFromToken(token);

  // --- Review Submission ---
  // Endpoint: GET /tasks/:id/submissions (untuk mendapatkan detail submission)
  // Endpoint: PATCH /tasks/submissions/:submissionId/grade (untuk menilai)
  function openReviewModal(assignment, submission) {
    // Menerima objek submission langsung
    setReviewingAssignment(assignment);
    setReviewingSubmission(submission); // Simpan objek submission lengkap
    setReviewFeedback(submission.feedback || "");
    setReviewScore(submission.grade || ""); // Asumsi grade adalah nama field nilai
    setReviewStatus(submission.status || "");
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewingAssignment(null);
    setReviewingSubmission(null);
    setReviewFeedback("");
    setReviewScore("");
    setReviewStatus("");
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingAssignment || !reviewingSubmission) return;

    if (reviewScore < 0 || reviewScore > 100) {
      setAlert({
        isOpen: true,
        title: "Validasi Nilai",
        message: "Nilai harus antara 0-100.",
        type: "error",
      });
      return;
    }

    try {
      // Endpoint: PATCH /tasks/submissions/:submissionId/grade
      const res = await fetch(
        `${baseUrl}/tasks/submissions/${reviewingSubmission.id}/grade`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json", // Ini penting untuk JSON body
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            grade: reviewScore ? parseFloat(reviewScore) : null,
            feedback: reviewFeedback,
            status: reviewStatus || reviewingSubmission.status, // Gunakan status baru jika ada
          }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setAlert({
          isOpen: true,
          title: "Berhasil!",
          message: "Review dan nilai berhasil disimpan!",
          type: "success",
          autoCloseDelay: 1500,
        });
        closeReviewModal();
        fetchData(); // Refresh data tugas untuk melihat update status submission
      } else {
        throw new Error(result.message || "Gagal menyimpan review.");
      }
    } catch (err) {
      console.error("Error saving review:", err);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: err.message || "Terjadi kesalahan saat menyimpan review.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-700">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
        Manajemen Penugasan
      </h3>

      {/* Tombol Buat Tugas Baru */}
      <div className="mb-6 text-right">
        <button
          onClick={openCreateModal}
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Buat Tugas Baru
        </button>
      </div>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <input
          type="text"
          placeholder="Cari judul tugas..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-bps-blue"
        />

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bps-blue"
        >
          <option value="all">Semua Status</option>
          <option value="submitted">Submitted</option>
          <option value="reviewed">Reviewed</option>
          <option value="revisi">Revisi</option>
          <option value="not_submitted">Belum Submit</option>
        </select>
      </div>

      {/* Daftar Penugasan */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Judul Tugas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Batas Waktu
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">
                Status Submission
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Dibuat Oleh
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedAssignments.map((assignment) => (
              <Fragment key={assignment.id}>
                <tr className="bg-white text-center hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                    {assignment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 break-words">
                    {assignment.deadline.split("T")[0]}
                  </td>
                  <td className="px-6 py-4 items-center justify-center text-sm text-gray-600 break-words">
                    {/* Pastikan assignment.submissions adalah array sebelum map */}
                    {Array.isArray(assignment.submissions) &&
                    assignment.submissions.length > 0 ? (
                      assignment.submissions.map((submission) => {
                        const intern = interns.find(
                          (i) => i.id === submission.userId
                        ); // Asumsi submission punya userId
                        const status = submission?.status || "not_submitted";
                        const submissionId = submission?.id;

                        return (
                          <div
                            key={submission.id}
                            className="justify-center flex items-center space-x-2 mb-1 last:mb-0"
                          >
                            <span className="font-medium">
                              {intern ? intern.name : `ID:${submission.userId}`}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold
                              ${
                                status === "submitted"
                                  ? "bg-blue-100 text-blue-800"
                                  : status === "reviewed"
                                  ? "bg-green-100 text-green-800"
                                  : status === "revisi"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {status
                                .replace(/_/g, " ")
                                .charAt(0)
                                .toUpperCase() +
                                status.replace(/_/g, " ").slice(1)}
                            </span>
                            {(status === "submitted" ||
                              status === "reviewed" ||
                              status === "revisi") &&
                              submissionId && (
                                <button
                                  onClick={() =>
                                    openReviewModal(assignment, submission)
                                  }
                                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                                  title="Review Submission"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              )}
                          </div>
                        );
                      })
                    ) : (
                      <span>Belum ada submission</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {assignment.createdBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Edit Tugas"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteAssignment(assignment.id, assignment.title)
                      }
                      className="text-red-600 hover:text-red-900"
                      title="Hapus Tugas"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  Belum ada tugas yang dibuat.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Kontrol Pagination */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
          >
            <ChevronLeftIcon className="h-5 w-5 inline-block" />
          </button>
          <span className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-bps-blue text-white rounded disabled:opacity-50"
          >
            <ChevronRightIcon className="h-5 w-5 inline-block" />
          </button>
        </div>
      </div>
      {/* Modal Buat/Edit Tugas */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    {editingAssignment ? "Edit Tugas" : "Buat Tugas Baru"}
                  </Dialog.Title>

                  <form onSubmit={handleCreateOrUpdateAssignment}>
                    <div className="mb-4">
                      <label
                        htmlFor="title"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Judul Tugas:
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Deskripsi Tugas:
                      </label>
                      <textarea
                        id="description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    {/* buat field untuk upload file disini */}
                    <div className="mb-4">
                      <label
                        htmlFor="file"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Upload File (Opsional):
                      </label>
                      <input
                        type="file"
                        id="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-bps-blue file:text-white
                          hover:file:bg-bps-light-blue"
                      />
                      {formFile && (
                        <p className="text-xs text-gray-500 mt-1">
                          File terpilih: {formFile.name} (
                          {(formFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Format file yang didukung: PDF, DOC, DOCX (maksimal
                        5MB).
                      </p>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="assignedTo"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Ditugaskan Kepada:
                      </label>

                      <div
                        className="border rounded-lg p-3 bg-white space-y-2 overflow-y-auto"
                        style={{ maxHeight: "180px" }}
                      >
                        {interns.map((intern) => (
                          <label
                            key={intern.id}
                            className="flex items-center space-x-2 text-gray-700 text-sm"
                          >
                            <input
                              type="checkbox"
                              value={intern.id}
                              checked={formAssignedTo.includes(intern.id)}
                              onChange={(e) => {
                                const selectedId = Number(e.target.value);
                                setFormAssignedTo((prev) =>
                                  e.target.checked
                                    ? [...prev, selectedId]
                                    : prev.filter((id) => id !== selectedId)
                                );
                              }}
                            />
                            <span>{intern.namaLengkap || intern.name}</span>
                          </label>
                        ))}
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        Centang satu atau beberapa peserta magang.
                      </p>
                    </div>

                    <div className="mb-6">
                      <label
                        htmlFor="deadline"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Batas Waktu (Deadline):
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        {editingAssignment ? "Simpan Perubahan" : "Buat Tugas"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Modal Review Submission */}
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Review Tugas: {reviewingAssignment?.title}
                  </Dialog.Title>
                  <p className="text-sm text-gray-700 mb-2">
                    Peserta:{"  "}
                    {
                      interns.find((i) => i.id === reviewingSubmission?.userId)
                        ?.name
                    }{" "}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Status:{" "}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        reviewingSubmission?.status === "submitted"
                          ? "bg-blue-100 text-blue-800"
                          : reviewingSubmission?.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : reviewingSubmission?.status === "revisi"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {reviewingSubmission?.status?.charAt(0).toUpperCase() +
                        reviewingSubmission?.status?.slice(1)}{" "}
                    </span>
                  </p>

                  {reviewingSubmission?.description && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Deskripsi Pengumpulan:
                      </label>
                      <p className="text-sm text-gray-800 border rounded-lg p-2 bg-gray-50">
                        {reviewingSubmission.description}
                      </p>
                    </div>
                  )}

                  {reviewingSubmission?.filePath && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        File Pengumpulan:
                      </label>
                      <a
                        href={`${baseUrl}/${reviewingSubmission.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bps-blue hover:underline"
                      >
                        Lihat / Unduh File
                      </a>
                    </div>
                  )}

                  {/* Form Feedback dan Nilai */}
                  <form onSubmit={handleSubmitReview}>
                    {/* tambah select status */}
                    <div className="mb-4">
                      <label
                        htmlFor="status"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Status:
                      </label>
                      <select
                        id="status"
                        value={reviewStatus}
                        onChange={(e) => setReviewStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="">Ganti status</option>
                        <option value="reviewed">Di-review</option>
                        <option value="revisi">Revisi</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="feedback"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Feedback:
                      </label>
                      <textarea
                        id="feedback"
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="score"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Nilai (0-100):
                      </label>
                      <input
                        type="number"
                        id="score"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeReviewModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Simpan Review
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Alert Component */}
      <AlertDialog
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmButtonText={alert.confirmButtonText}
        cancelButtonText={alert.cancelButtonText}
        onConfirm={alert.onConfirm}
        onClose={closeAlert}
      />
    </div>
  );
}

export default StaffAssignmentsPage;
