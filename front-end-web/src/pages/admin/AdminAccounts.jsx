import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

function AdminAccountsPage() {
  // Dummy data akun Staff dan Koordinator
  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem('adminAccounts');
    if (savedAccounts) {
      return JSON.parse(savedAccounts);
    }
    return [
      { id: 'acc001', name: 'Budi Koordinator', email: 'budi.koor@bps.go.id', role: 'koordinator', status: 'active' },
      { id: 'acc002', name: 'Siti Staff', email: 'siti.staff@bps.go.id', role: 'staff', status: 'active' },
      { id: 'acc003', name: 'Dedi Koordinator', email: 'dedi.koor@bps.go.id', role: 'koordinator', status: 'inactive' },
    ];
  });

  // State untuk modal Create/Edit Akun
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null); // Null for create, object for edit

  // State untuk form Create/Edit Akun
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('staff'); // Default role
  const [formStatus, setFormStatus] = useState('active'); // Default status
  const [formPassword, setFormPassword] = useState(''); // Hanya diisi saat create/reset password
  const [formConfirmPassword, setFormConfirmPassword] = useState('');

  // Efek untuk menyimpan data akun ke localStorage setiap kali accounts berubah
  useEffect(() => {
    localStorage.setItem('adminAccounts', JSON.stringify(accounts));
  }, [accounts]);

  // --- CRUD Akun ---
  function openCreateModal() {
    setEditingAccount(null);
    setFormName('');
    setFormEmail('');
    setFormRole('staff');
    setFormStatus('active');
    setFormPassword('');
    setFormConfirmPassword('');
    setIsModalOpen(true);
  }

  function openEditModal(account) {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormRole(account.role);
    setFormStatus(account.status);
    setFormPassword(''); // Password tidak diisi otomatis saat edit
    setFormConfirmPassword('');
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  const handleCreateOrUpdateAccount = (e) => {
    e.preventDefault();

    if (!formName || !formEmail || !formRole) {
      alert('Mohon lengkapi semua bidang.');
      return;
    }

    // Validasi email
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
      alert('Format email tidak valid.');
      return;
    }

    if (!editingAccount) { // Logika Create
      if (!formPassword || formPassword.length < 6) {
        alert('Password minimal 6 karakter.');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        alert('Konfirmasi password tidak cocok.');
        return;
      }

      const newAccount = {
        id: `acc${Date.now()}`, // ID unik
        name: formName,
        email: formEmail,
        role: formRole,
        status: formStatus,
        // password: formPassword // Dalam aplikasi nyata, password akan di-hash di backend
      };
      setAccounts([...accounts, newAccount]);
      alert('Akun baru berhasil dibuat!');
    } else { // Logika Update
      if (formPassword) { // Jika password diisi, lakukan validasi password baru
        if (formPassword.length < 6) {
          alert('Password baru minimal 6 karakter.');
          return;
        }
        if (formPassword !== formConfirmPassword) {
          alert('Konfirmasi password baru tidak cocok.');
          return;
        }
        // Password akan di-update di backend
      }

      setAccounts(accounts.map(acc =>
        acc.id === editingAccount.id ? { ...acc, name: formName, email: formEmail, role: formRole, status: formStatus } : acc
      ));
      alert('Akun berhasil diperbarui!');
    }
    closeModal();
  };

  const handleChangeAccountStatus = (id, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status akun ini menjadi ${newStatus}?`)) {
      setAccounts(accounts.map(acc =>
        acc.id === id ? { ...acc, status: newStatus } : acc
      ));
      alert(`Status akun berhasil diubah menjadi ${newStatus}.`);
    }
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
      alert('Akun berhasil dihapus!');
    }
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Manajemen Akun (Staff & Koordinator)</h2>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <tr key={account.id} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{account.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                    ${account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {account.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {account.status === 'active' ? (
                    <button
                      onClick={() => handleChangeAccountStatus(account.id, 'inactive')}
                      className="text-red-600 hover:text-red-900 mr-3"
                      title="Nonaktifkan Akun"
                    >
                      Nonaktifkan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleChangeAccountStatus(account.id, 'active')}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Aktifkan Akun"
                    >
                      Aktifkan
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(account)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Edit Akun"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    className="text-gray-600 hover:text-gray-900"
                    title="Hapus Akun"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Belum ada akun Staff/Koordinator yang terdaftar.</td>
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
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-4">
                    {editingAccount ? 'Edit Akun' : 'Buat Akun Baru'}
                  </Dialog.Title>

                  <form onSubmit={handleCreateOrUpdateAccount}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nama Lengkap:</label>
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
                      <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
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
                      <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
                      <select
                        id="role"
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="staff">Staff BPS</option>
                        <option value="koordinator">Koordinator Magang</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status Akun:</label>
                      <select
                        id="status"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="active">Aktif</option>
                        <option value="inactive">Nonaktif</option>
                      </select>
                    </div>
                    
                    {/* Password Fields (Hanya diisi saat create atau reset password) */}
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                        {editingAccount ? 'Password Baru (Opsional):' : 'Password:'}
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        // required={!editingAccount} // Wajib hanya saat membuat baru
                      />
                      {editingAccount && <p className="text-xs text-gray-500 mt-1">Isi jika ingin mengubah password.</p>}
                    </div>
                    <div className="mb-6">
                      <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Konfirmasi Password:</label>
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
                        {editingAccount ? 'Simpan Perubahan' : 'Buat Akun'}
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

export default AdminAccountsPage;