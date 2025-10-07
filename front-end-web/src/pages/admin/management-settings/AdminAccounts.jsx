import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import AlertDialog from "../../../components/AlertDialog";

function AdminAccountsPage() {
  const baseUrl = process.env.REACT_APP_BASE_URL;
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
  // buat state untuk pagination dan search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;
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
      const res = await fetch(`${baseUrl}/users?limit=1000`, {
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

  // Filter dan Pagination
  const filteredAccounts = accounts.filter((account) =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ambil data sesuai halaman
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAccounts = filteredAccounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

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
      ? `${baseUrl}/users/${editingAccount.id}`
      : `${baseUrl}/users`;

    let bodyData = {
      name: formName,
      email: formEmail,
    };

    if (!editingAccount) {
      bodyData.roleName = formRoleName;
    }

    if (!editingAccount || formPassword) {
      if (formPassword.length < 8) {
        setAlert({
          isOpen: true,
          title: "Validasi Password",
          message: "Password minimal 8 karakter.",
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
          const res = await fetch(`${baseUrl}/users/${id}`, {
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

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Input Pencarian */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari nama akun..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 w-full md:w-64"
          />
        </div>
        {/* Tombol Buat Akun Baru */}
        <div className="text-right">
          <button
            onClick={openCreateModal}
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Buat Akun Baru
          </button>
        </div>
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
            {currentAccounts.map((account) => (
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
                    <PencilSquareIcon className="h-5 w-5 inline-block" />
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
