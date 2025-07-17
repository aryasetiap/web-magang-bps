// Buat tugas baru (dengan file)
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

  const res = await fetch("http://localhost:3000/tasks", {
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
  const res = await fetch(`http://localhost:3000/tasks/${taskId}/assign`, {
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
  const res = await fetch(`http://localhost:3000/tasks/${taskId}/submissions`, {
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
    `http://localhost:3000/tasks/submissions/${submissionId}/grade`,
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
