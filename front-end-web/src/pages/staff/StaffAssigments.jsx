import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

function StaffAssignmentsPage() {
  const [interns, setInterns] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAssignedTo, setFormAssignedTo] = useState([]);
  const [formDeadline, setFormDeadline] = useState("");

  useEffect(() => {
    fetchInterns();
    fetchAssignments();
  }, []);

  const fetchInterns = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      const interns = (data.data || []).filter(
        (user) => user.role?.name?.toLowerCase() === "intern"
      );
      setInterns(interns);
    } catch (error) {
      console.error("Gagal memuat peserta:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:3000/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAssignments(data.data || []);
    } catch (error) {
      console.error("Gagal memuat tugas:", error);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (
      !formTitle ||
      !formDescription ||
      formAssignedTo.length === 0 ||
      !formDeadline
    ) {
      alert("Mohon lengkapi semua bidang.");
      return;
    }

    const token = localStorage.getItem("authToken");
    const bodyData = {
      title: formTitle,
      description: formDescription,
      deadline: formDeadline,
      internIds: formAssignedTo.map((id) => parseInt(id)),
    };

    try {
      const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Tugas berhasil dibuat!");
        setIsCreateModalOpen(false);
        fetchAssignments();
      } else {
        throw new Error(result.message || "Gagal membuat tugas.");
      }
    } catch (err) {
      alert(`Gagal: ${err.message}`);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Manajemen Penugasan
      </h2>
      <p className="text-gray-700 mb-6">
        Sebagai staff, Anda dapat mengelola semua penugasan untuk peserta
        magang.
      </p>

      <div className="mb-6 text-right">
        <button
          onClick={() => {
            setFormTitle("");
            setFormDescription("");
            setFormAssignedTo([]);
            setFormDeadline("");
            setIsCreateModalOpen(true);
          }}
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Buat Tugas Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Peserta
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.map((task) => (
              <tr
                key={task.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                  {task.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">
                  {task.description}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">
                  {new Date(task.deadline).toLocaleDateString("id-ID", {
                    timeZone: "Asia/Jakarta",
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 break-words">
                  {(task.assignments || []).map((a) => {
                    const intern = interns.find((i) => i.id === a.user.id);
                    return (
                      <div key={a.user.id}>
                        {intern?.name || `ID: ${a.user.id}`}
                      </div>
                    );
                  })}
                </td>
              </tr>
            ))}
            {assignments.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Belum ada tugas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsCreateModalOpen(false)}
        >
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Buat Tugas Baru
                  </Dialog.Title>

                  <form onSubmit={handleCreateAssignment}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Judul
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        rows="3"
                        required
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batas Waktu
                      </label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peserta Magang
                      </label>
                      <select
                        multiple
                        value={formAssignedTo}
                        onChange={(e) =>
                          setFormAssignedTo(
                            Array.from(e.target.selectedOptions, (o) => o.value)
                          )
                        }
                        className="w-full border rounded px-3 py-2 h-32"
                        required
                      >
                        {interns.map((intern) => (
                          <option key={intern.id} value={intern.id.toString()}>
                            {intern.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default StaffAssignmentsPage;
