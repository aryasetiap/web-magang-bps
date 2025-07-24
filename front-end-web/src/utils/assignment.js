// Buat tugas baru (dengan file) -> admin
const baseUrl = process.env.REACT_APP_BASE_URL;
export async function createAssignmentApi(
  token,
  { title, description, deadline, internIds, file }
) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("deadline", deadline);
  if (internIds && internIds.length > 0) {
    internIds.forEach((id) => formData.append("internIds[]", id));
  }
  if (file) formData.append("file", file);

  const res = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal membuat tugas.");
  return result;
}

// Assign tugas ke intern
export async function assignTaskApi(token, taskId, internIds) {
  const res = await fetch(`${baseUrl}/tasks/${taskId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ internIds }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal assign tugas.");
  return result;
}

// Lihat submission tugas
export async function fetchSubmissionsApi(token, taskId) {
  const res = await fetch(`${baseUrl}/tasks/${taskId}/submissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.message || "Gagal mengambil submissions.");
  return result.data || [];
}

// Nilai submission
export async function gradeSubmissionApi(
  token,
  submissionId,
  { score, feedback }
) {
  const res = await fetch(
    `${baseUrl}/tasks/submissions/${submissionId}/grade`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score, feedback }),
    }
  );
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Gagal menilai submission.");
  return result;
}

// Fungsi tugas untuk intern

// Validasi file upload
export const isValidFile = (file) => {
  if (!file) return true;
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return allowedTypes.includes(file.type) && file.size <= 5 * 1024 * 1024;
};

// Badge status tugas
export const statusBadge = (status) => {
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

// Fetch data tugas dari API
export const fetchAssignments = async (token) => {
  const res = await fetch(`${baseUrl}/tasks/my-tasks?page=1&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Gagal memuat tugas");
  return await res.json();
};
