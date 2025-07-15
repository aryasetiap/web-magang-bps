import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import AlertDialog from "../../../components/AlertDialog";

function AdminAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRoleName, setFormRoleName] = useState("Staff BPS");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");

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

  const fetchAccounts = async () => {
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
      const res = await fetch("http://localhost:3000/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        const usersArray = data?.data || []; // Ambil dari 'data'
        const filteredData = usersArray.filter(
          (user) =>
            user.role?.name === "Staff BPS" || user.role?.name === "Admin"
        );
        setAccounts(filteredData);
      } else {
        throw new Error(data.message || `Gagal mengambil data akun.`);
      }
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memuat akun.");
      setAlert({
        isOpen: true,
        title: "Gagal Memuat Akun",
        message: err.message || "Terjadi kesalahan saat memuat daftar akun.",
        type: "error",
        autoCloseDelay: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [token]);

  function openCreateModal() {
    setEditingAccount(null);
    setFormName("");
    setFormEmail("");
    setFormRoleName("Admin");
    setFormPassword("");
    setFormConfirmPassword("");
    setIsModalOpen(true);
  }

  function openEditModal(account) {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormRoleName(account.role?.name);
    setFormPassword("");
    setFormConfirmPassword("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const handleCreateOrUpdateAccount = async (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formRoleName) {
      setAlert({
        isOpen: true,
        title: "Validasi Input",
        message: "Mohon lengkapi semua bidang.",
        type: "error",
      });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
      setAlert({
        isOpen: true,
        title: "Validasi Email",
        message: "Format email tidak valid.",
        type: "error",
      });
      return;
    }

    let method = editingAccount ? "PATCH" : "POST";
    let url = editingAccount
      ? `http://localhost:3000/users/${editingAccount.id}`
      : "http://localhost:3000/users";

    let bodyData = {
      name: formName,
      email: formEmail,
      roleName: formRoleName,
    };

    if (!editingAccount || formPassword) {
      if (formPassword.length < 6) {
        setAlert({
          isOpen: true,
          title: "Validasi Password",
          message: "Password minimal 6 karakter.",
          type: "error",
        });
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setAlert({
          isOpen: true,
          title: "Validasi Password",
          message: "Konfirmasi password tidak cocok.",
          type: "error",
        });
        return;
      }
      bodyData.password = formPassword;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      const result = await res.json();

      if (res.ok) {
        setAlert({
          isOpen: true,
          title: "Berhasil!",
          message: editingAccount
            ? "Akun berhasil diperbarui!"
            : "Akun baru berhasil dibuat!",
          type: "success",
          autoCloseDelay: 1500,
        });
        closeModal();
        fetchAccounts();
      } else {
        throw new Error(result.message || "Gagal memproses akun.");
      }
    } catch (err) {
      console.error("Error saving account:", err);
      setAlert({
        isOpen: true,
        title: "Gagal!",
        message: err.message || "Terjadi kesalahan saat menyimpan akun.",
        type: "error",
      });
    }
  };

  const handleDeleteAccount = (id, name) => {
    setAlert({
      isOpen: true,
      title: "Konfirmasi Hapus Akun",
      message: `Apakah Anda yakin ingin menghapus akun "${name}"?`,
      type: "confirm",
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      onConfirm: async () => {
        closeAlert();
        try {
          const res = await fetch(`http://localhost:3000/users/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            setAlert({
              isOpen: true,
              title: "Berhasil!",
              message: `Akun "${name}" berhasil dihapus.`,
              type: "success",
              autoCloseDelay: 1500,
            });
            fetchAccounts();
          } else {
            const result = await res.json();
            throw new Error(result.message || "Gagal menghapus akun.");
          }
        } catch (err) {
          console.error("Error deleting account:", err);
          setAlert({
            isOpen: true,
            title: "Gagal!",
            message: err.message || "Terjadi kesalahan saat menghapus akun.",
            type: "error",
          });
        }
      },
      showCancelButton: true,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-700">Memuat data akun...</p>
        {/* Anda bisa tambahkan spinner di sini */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={fetchAccounts}
          className="mt-4 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Manajemen Akun (Staff & Koordinator)
      </h2>
      <p className="text-gray-700 mb-6">
        Kelola akun pengguna untuk Staff BPS dan Koordinator Magang.
      </p>
      {/* Tombol Buat Akun Baru */}
      <div className="mb-6 text-right">
        <button
          onClick={openCreateModal}
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Buat Akun Baru
        </button>
      </div>
      {/* Daftar Akun */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr
                key={account.id}
                className="bg-white hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {account.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {account.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                  {account.role?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(account)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Edit Akun"
                  >
                    <PencilIcon className="h-5 w-5 inline-block" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteAccount(account.id, account.name)
                    }
                    className="text-red-600 hover:text-red-900"
                    title="Hapus Akun"
                  >
                    <TrashIcon className="text-red h-5 w-5 inline-block" />
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Belum ada akun Staff/Koordinator yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Buat/Edit Akun */}
      <Transition appear show={isModalOpen} as={Fragment}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    {editingAccount ? "Edit Akun" : "Buat Akun Baru"}
                  </Dialog.Title>

                  <form onSubmit={handleCreateOrUpdateAccount}>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Nama Lengkap:
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Email:
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="role"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Role:
                      </label>
                      <select
                        id="role"
                        value={formRoleName}
                        onChange={(e) => setFormRoleName(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="Staff BPS">Staff BPS</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>

                    {/* Password Fields (Hanya diisi saat create atau reset password) */}
                    <div className="mb-4">
                      <label
                        htmlFor="password"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        {editingAccount
                          ? "Password Baru (Opsional):"
                          : "Password:"}
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        // required={!editingAccount} // Wajib hanya saat membuat baru
                      />
                      {editingAccount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Isi jika ingin mengubah password.
                        </p>
                      )}
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-gray-700 text-sm font-bold mb-2"
                      >
                        Konfirmasi Password:
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={formConfirmPassword}
                        onChange={(e) => setFormConfirmPassword(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
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
                        {editingAccount ? "Simpan Perubahan" : "Buat Akun"}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
        onConfirm={alert.onConfirm}
        showCancelButton={alert.showCancelButton}
      />
    </div>
  );
}

export default AdminAccountsPage;
