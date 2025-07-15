import React, { useState, Fragment } from "react";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserCircleIcon,
  PhotoIcon,
  KeyIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import AlertDialog from "../AlertDialog";
import { useProfile } from "../../contexts/ProfileContext";

function HeadBar({ toggleSidebar, isCollapsed, userRole }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, fetchProfile } = useProfile();

  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "",
    autoCloseDelay: 0,
    onConfirm: null,
    showCancelButton: false,
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const token = localStorage.getItem("authToken");

  // Sinkronkan nama & foto dari context setiap kali profile berubah
  React.useEffect(() => {
    setCurrentUserName(profile?.namaLengkap || profile?.name || "Pengguna");
    setProfilePhoto(
      profile?.profilePhoto
        ? `http://localhost:3000/${profile.profilePhoto.replace(/\\/g, "/")}`
        : "https://via.placeholder.com/150/F8D7DA/000000?text=JD"
    );
  }, [profile]);

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isOpen: false }));
  };

  function openProfileModal() {
    setIsProfileModalOpen(true);
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  function closeProfileModal() {
    setIsProfileModalOpen(false);
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const formData = new FormData();
      formData.append("namaLengkap", currentUserName);
      if (profilePhoto && profilePhoto.startsWith("data:")) {
        // Convert base64 to file
        const arr = profilePhoto.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        const file = new File([u8arr], "profile-photo.png", { type: mime });
        formData.append("profilePhoto", file);
      }

      const res = await fetch("http://localhost:3000/auth/profile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal update profil.");

      setAlert({
        isOpen: true,
        title: "Profil Diperbarui",
        message: "Nama dan foto profil Anda berhasil diperbarui.",
        type: "success",
        autoCloseDelay: 1500,
      });
      closeProfileModal();

      // Fetch ulang profil global agar HeadBar & Biodata ikut update
      setTimeout(() => {
        fetchProfile();
      }, 1000);
    } catch (err) {
      setAlert({
        isOpen: true,
        title: "Gagal",
        message: err.message || "Terjadi kesalahan saat update profil.",
        type: "error",
        autoCloseDelay: 3000,
      });
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      alert("Semua bidang password harus diisi.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password baru minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }
    if (oldPassword === newPassword) {
      alert("Password baru tidak boleh sama dengan password lama.");
      return;
    }

    closeProfileModal();
    setAlert({
      isOpen: true,
      title: "Password Diubah",
      message: "Kata sandi Anda berhasil diubah.",
      type: "success",
      autoCloseDelay: 1500,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setAlert({
      isOpen: true,
      title: "Konfirmasi Logout",
      message: "Apakah Anda yakin ingin logout dari sistem?",
      type: "confirm",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Tidak",
      onConfirm: confirmLogout,
      showCancelButton: true,
    });
  };

  const confirmLogout = () => {
    closeAlert();
    setAlert({
      isOpen: true,
      title: "Logout Berhasil",
      message: "Anda telah berhasil logout.",
      type: "success",
      autoCloseDelay: 1500,
    });
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    setTimeout(() => {
      closeAlert();
      navigate("/login");
    }, 1500);
  };

  const getRoleRootPath = (role) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "staff":
        return "/staff";
      case "intern":
        return "/dashboard";
      default:
        return "/";
    }
  };

  const roleRootPath = getRoleRootPath(userRole);
  const currentPath = location.pathname;

  const pathnames = currentPath.split("/").filter((x) => x);
  const breadcrumbs = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName =
      value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

    return (
      <span key={to} className="flex items-center">
        <a
          href={to}
          className={`text-gray-600 hover:text-bps-blue ${last ? "font-semibold" : ""
            }`}
        >
          {displayName}
        </a>
        {!last && <span className="mx-2 text-gray-400">/</span>}
      </span>
    );
  });

  return (
    <header
      className={`bg-white shadow-sm p-4 flex justify-between items-center rounded-lg fixed top-0 right-0 z-40 transition-all duration-300 ease-in-out
        ${isCollapsed ? "ml-2 left-24" : "ml-6 left-64"}`}
    >
      <div className="flex items-center h-full">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-bps-blue"
          aria-label="Toggle Sidebar"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        <nav aria-label="breadcrumb" className="flex text-sm">
          {currentPath === roleRootPath ? (
            <span className="text-gray-600 font-semibold">
              {userRole === "admin"
                ? "Admin Dashboard"
                : userRole === "staff"
                  ? "Staff Dashboard"
                  : ""}
            </span>
          ) : (
            <>
              <a
                href={roleRootPath}
                className="text-gray-600 hover:text-bps-blue mr-2"
              >
                {userRole === "admin"
                  ? "Admin Dashboard"
                  : userRole === "staff"
                    ? "Staff Dashboard"
                    : ""}
              </a>
              <span className="text-gray-400 mr-2"></span>
              {breadcrumbs.filter((_, idx) => {
                const rootSegment = roleRootPath.split("/").filter(Boolean)[0];
                return !(idx === 0 && pathnames[0] === rootSegment);
              })}
            </>
          )}
        </nav>
      </div>

      <Menu as="div" className="relative">
        <div>
          <Menu.Button className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-bps-blue focus-visible:ring-opacity-75 rounded-full">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={profilePhoto} // Gunakan state profilePhoto
              alt="User Avatar"
            />
            <span className="text-gray-700 font-medium hidden md:block">
              {currentUserName} {/* Tampilkan nama pengguna */}
            </span>
            <svg
              className="h-5 w-5 text-gray-500 hidden md:block"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Menu.Button>
        </div>

        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={openProfileModal} // Panggil fungsi untuk membuka modal profil
                  className={`${active ? "bg-bps-blue text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Profil Saya
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${active ? "bg-red-500 text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  Logout
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>

      {/* Render AlertDialog di luar Menu.Items */}
      <AlertDialog
        isOpen={alert.isOpen}
        onClose={closeAlert}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        autoCloseDelay={alert.autoCloseDelay}
        onConfirm={alert.onConfirm}
        showCancelButton={alert.showCancelButton}
        confirmButtonText={alert.confirmButtonText}
        cancelButtonText={alert.cancelButtonText}
      />

      {/* Modal Profil Saya */}
      <Transition appear show={isProfileModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeProfileModal}>
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {" "}
                  {/* Ubah max-w-md ke max-w-xl */}
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-gray-900 mb-4"
                  >
                    Profil Saya
                  </Dialog.Title>
                  {/* Kontainer untuk 2 kolom */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    {/* Tambahkan grid */}
                    {/* Bagian Informasi Umum */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <UserCircleIcon className="h-6 w-6 mr-2" /> Informasi
                        Umum
                      </h4>
                      <div className="flex flex-col items-center mb-4">
                        <img
                          src={profilePhoto}
                          alt="Foto Profil"
                          className="h-24 w-24 rounded-full object-cover mb-3 border-2 border-bps-blue"
                        />
                        <label
                          htmlFor="profilePhotoInput"
                          className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm py-1 px-3 rounded-full flex items-center"
                        >
                          <PhotoIcon className="h-4 w-4 mr-1" /> Ganti Foto
                          <input
                            id="profilePhotoInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      </div>
                      <form onSubmit={handleUpdateProfile}>
                        <div className="mb-4">
                          <label
                            htmlFor="userName"
                            className="block text-gray-700 text-sm font-bold mb-2"
                          >
                            Nama Lengkap:
                          </label>
                          <input
                            type="text"
                            id="userName"
                            value={currentUserName}
                            onChange={(e) => setCurrentUserName(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
                        >
                          Simpan Perubahan Profil
                        </button>
                      </form>
                    </div>
                    {/* Bagian Ubah Kata Sandi */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {" "}
                      {/* Hapus mb-4 */}
                      <h4 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                        <KeyIcon className="h-6 w-6 mr-2" /> Ubah Kata Sandi
                      </h4>
                      <form onSubmit={handleChangePassword}>
                        <div className="mb-4">
                          <label
                            htmlFor="oldPassword"
                            className="block text-gray-700 text-sm font-bold mb-2"
                          >
                            Kata Sandi Lama:
                          </label>
                          <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label
                            htmlFor="newPassword"
                            className="block text-gray-700 text-sm font-bold mb-2"
                          >
                            Kata Sandi Baru:
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                            required
                          />
                        </div>
                        <div className="mb-6">
                          <label
                            htmlFor="confirmNewPassword"
                            className="block text-gray-700 text-sm font-bold mb-2"
                          >
                            Konfirmasi Kata Sandi Baru:
                          </label>
                          <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) =>
                              setConfirmNewPassword(e.target.value)
                            }
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200"
                        >
                          Ubah Kata Sandi
                        </button>
                      </form>
                    </div>
                  </div>{" "}
                  {/* Tutup div grid */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeProfileModal}
                    >
                      Tutup
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}

export default HeadBar;
