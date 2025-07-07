import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon,
  CogIcon, CalendarDaysIcon, UserGroupIcon,
  EyeIcon, UsersIcon, ExclamationCircleIcon // Untuk melihat detail akun jika diperlukan
} from '@heroicons/react/24/outline';

function AdminManagementSettingsPage() {
  // --- State untuk Manajemen Akun ---
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

  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('staff');
  const [formStatus, setFormStatus] = useState('active');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');

  // --- State untuk Pengaturan Sistem ---
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      registrationOpenDate: '',
      registrationCloseDate: '',
      internQuota: 50,
      isSystemActive: true,
    };
  });

  const [saveSettingsStatus, setSaveSettingsStatus] = useState(null); // 'success' | 'error' | null

  // --- Efek untuk Persistensi Data ---
  useEffect(() => {
    localStorage.setItem('adminAccounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('systemSettings', JSON.stringify(settings));
  }, [settings]);

  // --- Fungsi Manajemen Akun ---
  function openCreateAccountModal() {
    setEditingAccount(null);
    setFormName('');
    setFormEmail('');
    setFormRole('staff');
    setFormStatus('active');
    setFormPassword('');
    setFormConfirmPassword('');
    setIsAccountModalOpen(true);
  }

  function openEditAccountModal(account) {
    setEditingAccount(account);
    setFormName(account.name);
    setFormEmail(account.email);
    setFormRole(account.role);
    setFormStatus(account.status);
    setFormPassword('');
    setFormConfirmPassword('');
    setIsAccountModalOpen(true);
  }

  function closeAccountModal() {
    setIsAccountModalOpen(false);
  }

  const handleCreateOrUpdateAccount = (e) => {
    e.preventDefault();
    if (!formName || !formEmail || !formRole) {
      alert('Mohon lengkapi semua bidang.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
      alert('Format email tidak valid.');
      return;
    }

    if (!editingAccount) {
      if (!formPassword || formPassword.length < 6) {
        alert('Password minimal 6 karakter.');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        alert('Konfirmasi password tidak cocok.');
        return;
      }
      const newAccount = { id: `acc${Date.now()}`, name: formName, email: formEmail, role: formRole, status: formStatus };
      setAccounts([...accounts, newAccount]);
      alert('Akun baru berhasil dibuat!');
    } else {
      if (formPassword) {
        if (formPassword.length < 6) {
          alert('Password baru minimal 6 karakter.');
          return;
        }
        if (formPassword !== formConfirmPassword) {
          alert('Konfirmasi password baru tidak cocok.');
          return;
        }
      }
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? { ...acc, name: formName, email: formEmail, role: formRole, status: formStatus } : acc));
      alert('Akun berhasil diperbarui!');
    }
    closeAccountModal();
  };

  const handleChangeAccountStatus = (id, newStatus) => {
    if (window.confirm(`Apakah Anda yakin ingin mengubah status akun ini menjadi ${newStatus}?`)) {
      setAccounts(accounts.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
      alert(`Status akun berhasil diubah menjadi ${newStatus}.`);
    }
  };

  const handleDeleteAccount = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
      setAccounts(accounts.filter(acc => acc.id !== id));
      alert('Akun berhasil dihapus!');
    }
  };

  // --- Fungsi Pengaturan Sistem ---
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    if (settings.registrationOpenDate && settings.registrationCloseDate &&
        new Date(settings.registrationOpenDate) > new Date(settings.registrationCloseDate)) {
      setSaveSettingsStatus('error');
      alert('Tanggal buka pendaftaran tidak boleh setelah tanggal tutup pendaftaran!');
      return;
    }
    console.log('Pengaturan disimpan:', settings);
    setSaveSettingsStatus('success');
    alert('Pengaturan sistem berhasil disimpan!');
    setTimeout(() => { setSaveSettingsStatus(null); }, 3000);
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Manajemen & Pengaturan Admin</h2>
      <p className="text-gray-700 mb-6">
        Kelola akun staff dan koordinator, serta atur parameter umum sistem magang.
      </p>

      {/* Bagian Manajemen Akun */}
      <div className="mb-10 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <UsersIcon className="h-7 w-7 mr-2" /> Manajemen Akun (Staff & Koordinator)
        </h3>
        <p className="text-gray-700 mb-4">
          Buat, ubah, atau nonaktifkan akun untuk Staff BPS dan Koordinator Magang.
        </p>

        <div className="mb-6 text-right">
          <button
            onClick={openCreateAccountModal}
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
                      onClick={() => openEditAccountModal(account)}
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
      </div>

      {/* Bagian Pengaturan Sistem */}
      <div className="p-6 border rounded-lg bg-blue-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
          <CogIcon className="h-7 w-7 mr-2" /> Pengaturan Sistem
        </h3>
        <p className="text-gray-700 mb-6">
          Atur parameter global sistem seperti periode pendaftaran dan kuota peserta magang.
        </p>

        <form onSubmit={handleSettingsSubmit}>
          {/* Status Sistem Aktif/Tidak Aktif */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-100">
            <h4 className="text-xl font-medium text-gray-800 mb-3">Status & Aktivasi Sistem</h4>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="isSystemActive"
                name="isSystemActive"
                checked={settings.isSystemActive}
                onChange={handleSettingsChange}
                className="h-5 w-5 text-bps-blue rounded border-gray-300 focus:ring-bps-blue"
              />
              <label htmlFor="isSystemActive" className="ml-2 block text-lg font-medium text-gray-900">
                Sistem Aktif
              </label>
            </div>
            <p className="text-sm text-gray-600">
              {settings.isSystemActive
                ? 'Sistem sedang aktif dan dapat diakses oleh semua pengguna.'
                : 'Sistem sedang tidak aktif. Pengguna tidak dapat melakukan pendaftaran atau aktivitas.'}
            </p>
          </div>

          {/* Periode Pendaftaran */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-100">
            <h4 className="text-xl font-medium text-gray-800 mb-3">Periode Pendaftaran Magang</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="registrationOpenDate" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Buka Pendaftaran:</label>
                <input
                  type="date"
                  id="registrationOpenDate"
                  name="registrationOpenDate"
                  value={settings.registrationOpenDate}
                  onChange={handleSettingsChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                />
              </div>
              <div>
                <label htmlFor="registrationCloseDate" className="block text-gray-700 text-sm font-bold mb-2">Tanggal Tutup Pendaftaran:</label>
                <input
                  type="date"
                  id="registrationCloseDate"
                  name="registrationCloseDate"
                  value={settings.registrationCloseDate}
                  onChange={handleSettingsChange}
                  className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Peserta magang hanya dapat mengajukan pendaftaran dalam rentang tanggal ini.
            </p>
          </div>

          {/* Kuota Peserta */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-100">
            <h4 className="text-xl font-medium text-gray-800 mb-3">Kuota Peserta Magang</h4>
            <div>
              <label htmlFor="internQuota" className="block text-gray-700 text-sm font-bold mb-2">Jumlah Kuota:</label>
              <input
                type="number"
                id="internQuota"
                name="internQuota"
                value={settings.internQuota}
                onChange={handleSettingsChange}
                min="0"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Jumlah maksimum peserta magang yang dapat diterima dalam satu periode.
            </p>
          </div>

          {/* Tombol Simpan Pengaturan */}
          <button
            type="submit"
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Simpan Pengaturan
          </button>

          {/* Indikator Status Simpan Pengaturan */}
          {saveSettingsStatus && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2
              ${saveSettingsStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {saveSettingsStatus === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
              <span className="font-medium">
                {saveSettingsStatus === 'success' ? 'Pengaturan berhasil disimpan!' : 'Gagal menyimpan pengaturan. Periksa kembali input Anda.'}
              </span>
            </div>
          )}
        </form>
      </div>

      {/* Modal Buat/Edit Akun (tetap sama) */}
      <Transition appear show={isAccountModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeAccountModal}>
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
                        onClick={closeAccountModal}
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

export default AdminManagementSettingsPage;