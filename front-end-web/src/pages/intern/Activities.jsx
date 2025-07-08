import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

function ActivitiesPage() { // Pastikan nama fungsi adalah AktivitasPage
  const today = new Date();
  const formattedToday = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // State untuk tanggal yang dipilih untuk filter aktivitas
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]); // Default hari ini (YYYY-MM-DD)

  // State untuk presensi dan logbook, ambil dari localStorage jika ada
  const [checkInTime, setCheckInTime] = useState(() => {
    const savedCheckIn = localStorage.getItem('checkInTime_' + selectedDate); // Ubah kunci untuk per tanggal
    return savedCheckIn || null;
  });

  const [checkOutTime, setCheckOutTime] = useState(() => {
    const savedCheckOut = localStorage.getItem('checkOutTime_' + selectedDate); // Ubah kunci untuk per tanggal
    return savedCheckOut || null;
  });

  const [logbookEntry, setLogbookEntry] = useState(() => {
    const savedLogbook = localStorage.getItem('logbookEntry_' + selectedDate); // Ubah kunci untuk per tanggal
    return savedLogbook || '';
  });

  // State untuk informasi lokasi presensi
  const [currentLocation, setCurrentLocation] = useState(null); // { latitude, longitude }
  const [locationError, setLocationError] = useState('');

  // Dummy data penugasan - Tambahkan 'submissionType' dan 'submissionContent'
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Mempelajari Struktur Organisasi BPS', description: 'Pelajari hierarki dan fungsi setiap divisi di BPS Kabupaten Pringsewu. Buat ringkasan 2 halaman.', status: 'Belum Selesai', deadline: '2025-07-05', submissionType: 'file', uploadedFile: null, submittedText: '', submittedLink: '' },
    { id: 2, title: 'Beri Tanggapan tentang Survei X', description: 'Berikan opini Anda mengenai hasil Survei X. Tulis dalam 200 kata.', status: 'Belum Selesai', deadline: '2025-07-07', submissionType: 'text', uploadedFile: null, submittedText: '', submittedLink: '' }, // Deadine hari ini
    { id: 3, title: 'Menyusun Laporan Mingguan', description: 'Buat draf laporan kegiatan mingguan yang telah dilakukan dan kumpulkan ke Koordinator Magang.', status: 'Selesai', deadline: '2025-06-28', submissionType: 'file', uploadedFile: { name: 'Laporan_Mingguan_Budi.pdf', url: '#' }, submittedText: '', submittedLink: '' },
    { id: 4, title: 'Presentasi Konsep Aplikasi Baru', description: 'Buat presentasi interaktif mengenai konsep aplikasi baru BPS. Unggah link Google Slide atau dokumen lain.', status: 'Belum Selesai', deadline: '2025-07-15', submissionType: 'link', uploadedFile: null, submittedText: '', submittedLink: '' },
    { id: 5, title: 'Analisis Data Penjualan (Teks)', description: 'Jelaskan hasil analisis data penjualan kuartal 2. Hanya butuh teks summary.', status: 'Belum Selesai', deadline: '2025-07-07', submissionType: 'text', uploadedFile: null, submittedText: '', submittedLink: '' }, // Deadine hari ini
  ]);

  // State untuk modal detail tugas
  let [isOpen, setIsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [submissionText, setSubmissionText] = useState(''); // State untuk teks submission
  const [submissionLink, setSubmissionLink] = useState(''); // State untuk link submission

  // Efek untuk memuat/menyimpan data presensi/logbook sesuai tanggal yang dipilih
  useEffect(() => {
    setCheckInTime(localStorage.getItem('checkInTime_' + selectedDate));
    setCheckOutTime(localStorage.getItem('checkOutTime_' + selectedDate));
    setLogbookEntry(localStorage.getItem('logbookEntry_' + selectedDate) || '');
  }, [selectedDate]);

  useEffect(() => {
    if (checkInTime) localStorage.setItem('checkInTime_' + selectedDate, checkInTime);
    else localStorage.removeItem('checkInTime_' + selectedDate);

    if (checkOutTime) localStorage.setItem('checkOutTime_' + selectedDate, checkOutTime);
    else localStorage.removeItem('checkOutTime_' + selectedDate);

    if (logbookEntry) localStorage.setItem('logbookEntry_' + selectedDate, logbookEntry);
    else localStorage.removeItem('logbookEntry_' + selectedDate);
  }, [checkInTime, checkOutTime, logbookEntry, selectedDate]);


  function closeModal() {
    setIsOpen(false);
    setSelectedAssignment(null);
    setUploadFile(null);
    setSubmissionText('');
    setSubmissionLink('');
  }

  function openModal(assignment) {
    setSelectedAssignment(assignment);
    setIsOpen(true);
    setUploadFile(assignment.uploadedFile);
    setSubmissionText(assignment.submittedText || '');
    setSubmissionLink(assignment.submittedLink || '');
  }

  // --- Fungsi Presensi dengan Lokasi ---
  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation tidak didukung oleh browser Anda.');
      alert('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLocationError('Mencari lokasi...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLocationError(''); // Clear error
        alert(`Lokasi ditemukan! Lat: ${latitude}, Long: ${longitude}.`);
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Akses lokasi ditolak oleh pengguna.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Waktu permintaan lokasi habis.';
            break;
          default:
            errorMessage += 'Terjadi kesalahan tidak dikenal.';
            break;
        }
        setLocationError(errorMessage);
        alert(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Opsi geolocation
    );
  };

  const handleCheckIn = () => {
    if (!currentLocation) {
      alert('Mohon dapatkan lokasi Anda terlebih dahulu untuk presensi masuk.');
      getGeoLocation(); // Coba dapatkan lokasi jika belum ada
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(timeString);
    alert(`Anda berhasil presensi masuk pada pukul ${timeString} dari lokasi Lat: ${currentLocation.latitude}, Long: ${currentLocation.longitude}.`);
    // Di aplikasi nyata: Kirim data check-in dan lokasi ke backend
  };

  const handleCheckOut = () => {
    if (!logbookEntry.trim()) {
      alert('Mohon isi logbook harian Anda sebelum presensi pulang.');
      return;
    }
    if (!currentLocation) {
      alert('Mohon dapatkan lokasi Anda terlebih dahulu untuk presensi pulang.');
      getGeoLocation(); // Coba dapatkan lokasi jika belum ada
      return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(timeString);
    alert(`Anda berhasil presensi pulang pada pukul ${timeString}. Logbook harian Anda telah disimpan dari lokasi Lat: ${currentLocation.latitude}, Long: ${currentLocation.longitude}.`);
    // Di aplikasi nyata: Kirim data check-out, logbook, dan lokasi ke backend
  };

  const handleLogbookChange = (e) => {
    setLogbookEntry(e.target.value);
  };

  const handleMarkAsDone = () => {
    if (selectedAssignment) {
      const updatedAssignments = assignments.map(assign =>
        assign.id === selectedAssignment.id ? { ...assign, status: 'Selesai' } : assign
      );
      setAssignments(updatedAssignments);
      setSelectedAssignment(prev => ({ ...prev, status: 'Selesai' }));
      alert(`Tugas "${selectedAssignment.title}" berhasil ditandai sebagai Selesai!`);
      // Di aplikasi nyata: Kirim update status ke backend
    }
  };

  const handleFileUpload = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleSubmitAssignment = () => {
    if (!selectedAssignment) return;

    let submissionValid = false;
    let newSubmissionContent = {
      uploadedFile: selectedAssignment.uploadedFile,
      submittedText: selectedAssignment.submittedText,
      submittedLink: selectedAssignment.submittedLink,
    };

    if (selectedAssignment.submissionType === 'file') {
      if (!uploadFile && !selectedAssignment.uploadedFile) {
        alert('Mohon unggah file terlebih dahulu.');
        return;
      }
      if (uploadFile) {
        newSubmissionContent.uploadedFile = { name: uploadFile.name, url: '#' };
        submissionValid = true;
      } else if (selectedAssignment.uploadedFile) {
        submissionValid = true;
      } else {
        alert('Mohon unggah file terlebih dahulu.');
        return;
      }
    } else if (selectedAssignment.submissionType === 'text') {
      if (!submissionText.trim()) {
        alert('Mohon isi teks jawaban Anda.');
        return;
      }
      newSubmissionContent.submittedText = submissionText.trim();
      submissionValid = true;
    } else if (selectedAssignment.submissionType === 'link') {
      if (!submissionLink.trim()) {
        alert('Mohon masukkan link jawaban Anda.');
        return;
      }
      newSubmissionContent.submittedLink = submissionLink.trim();
      submissionValid = true;
    } else {
        submissionValid = true;
    }

    if (submissionValid) {
        const updatedAssignments = assignments.map(assign =>
            assign.id === selectedAssignment.id ? { ...assign, ...newSubmissionContent, status: 'Selesai' } : assign
        );
        setAssignments(updatedAssignments);
        setSelectedAssignment(prev => ({ ...prev, ...newSubmissionContent, status: 'Selesai' }));

        alert(`Tugas "${selectedAssignment.title}" berhasil disubmit dan ditandai Selesai!`);
        // Di aplikasi nyata: Kirim data (file, teks, link) ke backend
        setUploadFile(null);
        setSubmissionText('');
        setSubmissionLink('');
        closeModal();
    }
  };

  const getSubmissionInput = () => {
    if (!selectedAssignment) return null;

    switch (selectedAssignment.submissionType) {
      case 'file':
        return (
          <>
            {selectedAssignment.uploadedFile ? (
                <p className="text-sm text-green-600 mb-2">
                    File sudah diunggah: <a href={selectedAssignment.uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{selectedAssignment.uploadedFile.name}</a>
                </p>
            ) : (
                <p className="text-sm text-gray-600 mb-2">Unggah file hasil tugas Anda (PDF, DOCX, ZIP, dll.).</p>
            )}
            <input
              type="file"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-1 file:px-3
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-bps-blue file:text-white
                hover:file:bg-bps-light-blue"
            />
            {uploadFile && !selectedAssignment.uploadedFile && (
                <p className="mt-2 text-sm text-gray-600">File terpilih: {uploadFile.name}</p>
            )}
            <button
                onClick={handleSubmitAssignment}
                disabled={!uploadFile}
                className={`mt-3 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors duration-200
                    ${(!uploadFile) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Kirim File & Tandai Selesai
            </button>
          </>
        );
      case 'text':
        return (
          <>
            <p className="text-sm text-gray-600 mb-2">Tuliskan jawaban Anda di bawah ini:</p>
            <textarea
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue mb-3"
              rows="5"
              placeholder="Jawaban Anda..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              disabled={selectedAssignment.status === 'Selesai'}
            ></textarea>
            <button
                onClick={handleSubmitAssignment}
                disabled={!submissionText.trim() || selectedAssignment.status === 'Selesai'}
                className={`mt-3 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors duration-200
                    ${(!submissionText.trim() || selectedAssignment.status === 'Selesai') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Kirim Jawaban & Tandai Selesai
            </button>
          </>
        );
      case 'link':
        return (
          <>
            <p className="text-sm text-gray-600 mb-2">Sertakan link ke hasil pekerjaan Anda (Google Drive, GitHub, dll.):</p>
            <input
              type="url"
              className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue mb-3"
              placeholder="https://contoh.com/link-tugas-saya"
              value={submissionLink}
              onChange={(e) => setSubmissionLink(e.target.value)}
              disabled={selectedAssignment.status === 'Selesai'}
            />
            {selectedAssignment.submittedLink && (
              <p className="mt-2 text-sm text-gray-600">Link saat ini: <a href={selectedAssignment.submittedLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{selectedAssignment.submittedLink}</a></p>
            )}
            <button
                onClick={handleSubmitAssignment}
                disabled={!submissionLink.trim() || selectedAssignment.status === 'Selesai'}
                className={`mt-3 bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1.5 px-4 rounded-lg text-sm transition-colors duration-200
                    ${(!submissionLink.trim() || selectedAssignment.status === 'Selesai') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                Kirim Link & Tandai Selesai
            </button>
          </>
        );
      default:
        return (
            <p className="text-sm text-gray-600">Tugas ini tidak memerlukan pengumpulan.</p>
        );
    }
  };

  // Filter tugas berdasarkan tanggal yang dipilih
  const filteredAssignments = assignments.filter(assignment => {
    return assignment.deadline === selectedDate; // Asumsi deadline format YYYY-MM-DD
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Aktivitas Harian</h2>
      
      {/* Filter Tanggal */}
      <div className="mb-6 flex items-center space-x-4">
        <label htmlFor="activityDate" className="text-gray-700 font-bold">Pilih Tanggal:</label>
        <input
          type="date"
          id="activityDate"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
        />
        <p className="text-gray-600">Menampilkan aktivitas untuk: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Bagian Presensi Kehadiran */}
      <div className="mb-8 p-6 border rounded-lg bg-blue-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Presensi Kehadiran</h3>
        {!checkInTime ? (
          <button
            onClick={handleCheckIn}
            className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Presensi Masuk Sekarang
          </button>
        ) : (
          <p className="text-lg text-green-700 font-medium">
            Anda sudah presensi masuk pada pukul <span className="font-bold">{checkInTime}</span>.
          </p>
        )}
        <button
            onClick={getGeoLocation}
            className="mt-3 bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded-lg transition-colors duration-200 text-sm"
        >
            Dapatkan Lokasi
        </button>
        {currentLocation && <p className="text-sm text-gray-600 mt-2">Lokasi: Lat {currentLocation.latitude.toFixed(4)}, Long {currentLocation.longitude.toFixed(4)}</p>}
        {locationError && <p className="text-sm text-red-600 mt-2">{locationError}</p>}
      </div>

      {/* Bagian Penugasan */}
      <div className="mb-8 p-6 border rounded-lg bg-green-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Penugasan Hari Ini</h3>
        {filteredAssignments.length > 0 ? (
          <ul className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <li
                key={assignment.id}
                className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => openModal(assignment)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-lg text-gray-900">{assignment.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${assignment.status === 'Selesai' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                    {assignment.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{assignment.description.substring(0, 100)}...</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">Tidak ada penugasan untuk tanggal ini.</p>
        )}
      </div>

      {/* Bagian Logbook Harian & Presensi Pulang */}
      <div className="mb-8 p-6 border rounded-lg bg-yellow-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Logbook Harian & Presensi Pulang</h3>
        <p className="text-gray-700 mb-4">
          Isi logbook harian Anda sebelum presensi pulang.
        </p>
        <textarea
          className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue mb-4"
          rows="6"
          placeholder="Tuliskan aktivitas harian Anda di sini..."
          value={logbookEntry}
          onChange={handleLogbookChange}
          disabled={!checkInTime || checkOutTime}
        ></textarea>

        {!checkOutTime ? (
          <button
            onClick={handleCheckOut}
            className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200
              ${!checkInTime || !logbookEntry.trim() || !currentLocation ? 'opacity-50 cursor-not-allowed' : ''}`} // Disable jika lokasi belum ada
            disabled={!checkInTime || !logbookEntry.trim() || !currentLocation} // Disable jika lokasi belum ada
          >
            Presensi Pulang & Simpan Logbook
          </button>
        ) : (
          <p className="text-lg text-green-700 font-medium">
            Anda sudah presensi pulang pada pukul <span className="font-bold">{checkOutTime}</span>.
          </p>
        )}
        {!checkInTime && (
            <p className="text-red-500 text-sm mt-2">Anda harus presensi masuk terlebih dahulu.</p>
        )}
        {!currentLocation && <p className="text-red-500 text-sm mt-2">Lokasi diperlukan untuk presensi.</p>}
      </div>

      {/* Modal Detail Tugas */}
      <Transition appear show={isOpen} as={Fragment}>
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
                    {selectedAssignment?.title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      <strong>Deskripsi:</strong> {selectedAssignment?.description}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Deadline:</strong> {selectedAssignment?.deadline}
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                      <strong>Status:</strong>{' '}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold
                        ${selectedAssignment?.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {selectedAssignment?.status}
                      </span>
                    </p>

                    {/* Bagian Pengumpulan Hasil Tugas */}
                    <div className="mt-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Pengumpulan Hasil Tugas</h4>

                      {getSubmissionInput()}

                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    {selectedAssignment?.status !== 'Selesai' && (
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                            onClick={handleSubmitAssignment}
                            disabled={
                                (selectedAssignment?.submissionType === 'file' && (!uploadFile && !selectedAssignment.uploadedFile)) ||
                                (selectedAssignment?.submissionType === 'text' && !submissionText.trim()) ||
                                (selectedAssignment?.submissionType === 'link' && !submissionLink.trim())
                            }
                        >
                            {selectedAssignment?.submissionType === 'none' ? 'Tandai Selesai' : 'Submit & Tandai Selesai'}
                        </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
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
    </div>
  );
}

export default ActivitiesPage;