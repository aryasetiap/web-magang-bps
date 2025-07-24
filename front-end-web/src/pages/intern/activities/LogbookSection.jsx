import React, { useState, useEffect, useRef } from "react";
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

function ConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h4 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h4>
        <p className="mb-4 text-gray-700">
          Yakin ingin menghapus entri logbook ini?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-5 h-5 border-2 border-bps-blue border-t-transparent border-solid rounded-full animate-spin align-middle"
      aria-label="Loading"
    ></span>
  );
}

function LogbookSection() {
  const today = new Date();
  const todayDateString = today.toISOString().split("T")[0];

  const [logbookEntries, setLogbookEntries] = useState([]);
  const [currentLogbookText, setCurrentLogbookText] = useState("");
  const [editingLogbookEntry, setEditingLogbookEntry] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [logbookDate, setLogbookDate] = useState(todayDateString);

  const baseUrl = process.env.REACT_APP_BASE_URL;
  const token = localStorage.getItem("authToken");
  const topRef = useRef(null);

  useEffect(() => {
    const fetchLogbooks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${baseUrl}/logbooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const errData = await res.json();
          setErrorMessage(errData.message || "Gagal mengambil data logbook");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setLogbookEntries(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorMessage("Gagal mengambil data logbook");
      }
      setLoading(false);
    };
    fetchLogbooks();
    // eslint-disable-next-line
  }, [token]);

  // Cek apakah sudah ada logbook untuk tanggal yang dipilih
  const alreadySubmittedForDate = logbookEntries.some(
    (entry) =>
      entry.logDate &&
      entry.logDate.split("T")[0] === logbookDate &&
      (!editingLogbookEntry || editingLogbookEntry.id !== entry.id)
  );

  // Scroll ke atas saat sukses
  useEffect(() => {
    if (successMessage && topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [successMessage]);

  // Highlight baris baru
  useEffect(() => {
    if (highlightId) {
      const timer = setTimeout(() => setHighlightId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightId]);

  const addLogbookEntry = async () => {
    setErrorMessage("");
    if (!isValidLogbookText(currentLogbookText)) {
      setErrorMessage("Isi logbook minimal 10 karakter dan 10 kata.");
      return;
    }
    if (logbookDate > todayDateString) {
      setErrorMessage(
        "Tidak dapat mengisi logbook untuk hari yang belum terjadi."
      );
      return;
    }
    if (alreadySubmittedForDate) {
      setErrorMessage("Logbook untuk tanggal ini sudah ada.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/logbooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logDate: logbookDate,
          content: currentLogbookText.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.message || "Gagal menambah logbook");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data && data.id) {
        setLogbookEntries([data, ...logbookEntries]);
        setCurrentLogbookText("");
        setLogbookDate(todayDateString);
        setSuccessMessage("Logbook berhasil ditambahkan!");
        setHighlightId(data.id);
      }
    } catch (err) {
      setErrorMessage("Gagal menambah logbook");
    }
    setLoading(false);
  };

  const saveEditedLogbook = async () => {
    setErrorMessage("");
    if (!editingLogbookEntry) return;
    if (!isValidLogbookText(currentLogbookText)) {
      setErrorMessage("Isi logbook minimal 10 karakter dan 10 kata.");
      return;
    }
    if (logbookDate > todayDateString) {
      setErrorMessage(
        "Tidak dapat mengisi logbook untuk hari yang belum terjadi."
      );
      return;
    }
    if (alreadySubmittedForDate) {
      setErrorMessage("Logbook untuk tanggal ini sudah ada.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/logbooks/${editingLogbookEntry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logDate: logbookDate,
          content: currentLogbookText.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.message || "Gagal mengedit logbook");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data && data.id) {
        setLogbookEntries(
          logbookEntries.map((entry) =>
            entry.id === editingLogbookEntry.id ? data : entry
          )
        );
        setEditingLogbookEntry(null);
        setCurrentLogbookText("");
        setLogbookDate(todayDateString);
        setSuccessMessage("Logbook berhasil diedit!");
        setHighlightId(data.id);
      }
    } catch (err) {
      setErrorMessage("Gagal mengedit logbook");
    }
    setLoading(false);
  };

  const deleteLogbookEntry = async (id) => {
    setErrorMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/logbooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.message || "Gagal menghapus logbook");
        setLoading(false);
        return;
      }
      setLogbookEntries(logbookEntries.filter((entry) => entry.id !== id));
      setSuccessMessage("Logbook berhasil dihapus!");
    } catch (err) {
      setErrorMessage("Gagal menghapus logbook");
    }
    setLoading(false);
    setDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingLogbookEntry(null);
    setCurrentLogbookText("");
    setLogbookDate(todayDateString);
    setErrorMessage("");
  };

  const startEditLogbook = (entry) => {
    setEditingLogbookEntry(entry);
    setCurrentLogbookText(entry.content || "");
    setLogbookDate(
      entry.logDate ? entry.logDate.split("T")[0] : todayDateString
    );
    setErrorMessage("");
  };

  const submitLogbookEntry = async (id) => {
    setErrorMessage("");
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/logbooks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "submitted" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setErrorMessage(errData.message || "Gagal submit logbook");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data && data.id) {
        setLogbookEntries(
          logbookEntries.map((entry) => (entry.id === id ? data : entry))
        );
        setSuccessMessage("Logbook berhasil disubmit!");
        setHighlightId(id);
      }
    } catch (err) {
      setErrorMessage("Gagal submit logbook");
    }
    setLoading(false);
  };

  function isValidLogbookText(text) {
    const trimmed = text.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    return trimmed.length >= 10 && wordCount >= 10;
  }

  return (
    <div className="mb-8 p-6 border rounded-lg bg-yellow-50" ref={topRef}>
      <Toast message={successMessage} onClose={() => setSuccessMessage("")} />
      <ConfirmModal
        open={!!deleteId}
        onConfirm={() => deleteLogbookEntry(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Logbook Harian
      </h3>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Form tambah/edit logbook */}
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-gray-700 mb-2">
          {editingLogbookEntry ? "Edit Entri Logbook" : "Tambah Entri Logbook"}
        </h4>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Tanggal Logbook
          <input
            type="date"
            className="block mt-1 border rounded px-2 py-1"
            value={logbookDate}
            onChange={(e) => setLogbookDate(e.target.value)}
            required
            max={todayDateString}
          />
        </label>
        <textarea
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-1 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
          rows="3"
          placeholder="Tuliskan aktivitas harian Anda (minimal 10 kata dan 10 karakter)..."
          value={currentLogbookText}
          onChange={(e) => setCurrentLogbookText(e.target.value)}
          aria-label="Isi logbook harian"
        ></textarea>
        {!isValidLogbookText(currentLogbookText) &&
          currentLogbookText.trim().length > 0 && (
            <div className="text-xs text-red-600 mb-2" role="alert">
              Logbook minimal 10 karakter dan 10 kata.
            </div>
          )}
        {logbookDate > todayDateString && (
          <div className="text-xs text-red-600 mb-2" role="alert">
            Tidak dapat mengisi logbook untuk hari yang belum terjadi.
          </div>
        )}
        {alreadySubmittedForDate && !editingLogbookEntry && (
          <div className="text-xs text-red-600 mb-2" role="alert">
            Logbook untuk tanggal ini sudah ada.
          </div>
        )}
        <div className="flex justify-end gap-2">
          {editingLogbookEntry && (
            <button
              onClick={cancelEdit}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1.5 px-4 rounded-lg text-sm"
              tabIndex={0}
            >
              Batal
            </button>
          )}
          <button
            onClick={editingLogbookEntry ? saveEditedLogbook : addLogbookEntry}
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1.5 px-4 rounded-lg text-sm flex items-center gap-2"
            disabled={
              !isValidLogbookText(currentLogbookText) ||
              loading ||
              alreadySubmittedForDate ||
              logbookDate > todayDateString
            }
            aria-disabled={
              !isValidLogbookText(currentLogbookText) ||
              loading ||
              alreadySubmittedForDate ||
              logbookDate > todayDateString
            }
            tabIndex={0}
          >
            {loading ? <Spinner /> : editingLogbookEntry ? "Simpan" : "Tambah"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-7/12">
                Aktivitas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && logbookEntries.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center">
                  <Spinner /> <span className="ml-2">Memuat data...</span>
                </td>
              </tr>
            ) : logbookEntries.length > 0 ? (
              logbookEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`bg-white hover:bg-bps-light-blue/20 transition-colors ${
                    highlightId === entry.id
                      ? "bg-yellow-100 animate-pulse"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">
                    {entry.logDate
                      ? new Date(entry.logDate).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 break-words">
                    {entry.content}
                  </td>
                  <td className="px-6 py-4">
                    {entry.status === "draft" && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Draft
                      </span>
                    )}
                    {entry.status === "submitted" && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                        Submitted
                      </span>
                    )}
                    {entry.status === "reviewed" && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 border border-green-200">
                        Reviewed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium flex gap-2 justify-end items-center">
                    {entry.status === "draft" && (
                      <button
                        onClick={() => submitLogbookEntry(entry.id)}
                        className="flex items-center gap-1 border border-green-500 text-green-700 hover:bg-green-50 px-2 py-1 rounded transition"
                        title="Submit logbook"
                        aria-label="Submit logbook"
                        tabIndex={0}
                        disabled={loading}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Submit</span>
                      </button>
                    )}
                    <button
                      onClick={() => startEditLogbook(entry)}
                      className={`flex items-center gap-1 border border-indigo-500 text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition ${
                        entry.status !== "draft"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title="Edit logbook"
                      aria-label="Edit logbook"
                      disabled={entry.status !== "draft" || loading}
                      tabIndex={0}
                    >
                      <PencilIcon className="h-4 w-4" />{" "}
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className={`flex items-center gap-1 border border-red-500 text-red-700 hover:bg-red-50 px-2 py-1 rounded transition ${
                        entry.status !== "draft"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title="Hapus logbook"
                      aria-label="Hapus logbook"
                      disabled={entry.status !== "draft" || loading}
                      tabIndex={0}
                    >
                      <TrashIcon className="h-4 w-4" />{" "}
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-600">
                  Belum ada entri logbook.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LogbookSection;
