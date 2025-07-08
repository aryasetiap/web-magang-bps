import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { EyeIcon } from '@heroicons/react/24/outline';

function AdminMonitoringPage() {
  // Dummy data interns (ambil dari StaffAssignmentsPage atau buat baru jika tidak ada)
  const [interns, setInterns] = useState([
    { id: 'int001', name: 'Budi Santoso', email: 'budi.santoso@example.com' },
    { id: 'int002', name: 'Siti Aminah', email: 'siti.aminah@example.com' },
    { id: 'int003', name: 'Dedi Kurniawan', email: 'dedi.kurniawan@example.com' },
    { id: 'int004', name: 'Nurul Hidayah', email: 'nurul.hidayah@example.com' },
  ]);

  // Dummy data presensi dan logbook
  const [dailyActivities, setDailyActivities] = useState(() => {
    const savedActivities = localStorage.getItem('adminDailyActivities');
    if (savedActivities) {
      return JSON.parse(savedActivities);
    }
    // Struktur: { internId: [{ date: 'YYYY-MM-DD', checkIn: 'HH:MM', checkOut: 'HH:MM', logbook: '...' }] }
    return {
      'int001': [
        { date: '2025-07-01', checkIn: '08:00', checkOut: '17:00', logbook: 'Mempelajari struktur organisasi BPS dan membantu pengarsipan dokumen.' },
        { date: '2025-07-02', checkIn: '08:15', checkOut: '16:45', logbook: 'Melakukan input data survei baru dan verifikasi data lama.' },
        { date: '2025-07-03', checkIn: '08:05', checkOut: '17:10', logbook: 'Mengikuti rapat divisi dan menyusun laporan singkat hasil rapat.' },
      ],
      'int002': [
        { date: '2025-07-01', checkIn: '08:30', checkOut: '17:00', logbook: 'Membantu persiapan materi presentasi untuk rapat mingguan.' },
        { date: '2025-07-02', checkIn: '08:00', checkOut: '16:30', logbook: 'Melakukan analisis data sederhana menggunakan Excel.' },
      ],
      'int003': [
        { date: '2025-07-01', checkIn: '09:00', checkOut: null, logbook: 'Memulai proyek baru.' }, // Belum pulang
      ],
    };
  });

  // State untuk modal Logbook Detail
  const [isLogbookModalOpen, setIsLogbookModalOpen] = useState(false);
  const [selectedLogbook, setSelectedLogbook] = useState(null); // { internName, date, entry }

  // Efek untuk menyimpan data aktivitas ke localStorage
  useEffect(() => {
    localStorage.setItem('adminDailyActivities', JSON.stringify(dailyActivities));
  }, [dailyActivities]);

  // Fungsi untuk menghitung rekap presensi
  const getPresensiRecap = () => {
    const recap = interns.map(intern => {
      const activities = dailyActivities[intern.id] || [];
      const totalDays = activities.length;
      const presentDays = activities.filter(act => act.checkIn && act.checkOut).length;
      const pendingCheckOutDays = activities.filter(act => act.checkIn && !act.checkOut).length;
      return {
        internId: intern.id,
        internName: intern.name,
        totalDays: totalDays,
        presentDays: presentDays,
        pendingCheckOutDays: pendingCheckOutDays,
      };
    });
    return recap;
  };

  // --- Fungsi untuk mendapatkan dan mengelompokkan entri logbook per peserta ---
  const getGroupedLogbookEntries = () => {
    const groupedEntries = {};
    interns.forEach(intern => {
      const activities = dailyActivities[intern.id] || [];
      const internLogbooks = activities
        .filter(activity => activity.logbook)
        .map(activity => ({
          internId: intern.id,
          internName: intern.name,
          date: activity.date,
          logbook: activity.logbook,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Urutkan logbook per peserta berdasarkan tanggal terbaru

      if (internLogbooks.length > 0) {
        groupedEntries[intern.name] = internLogbooks;
      }
    });
    return groupedEntries;
  };

  const presensiRecap = getPresensiRecap();
  const groupedLogbookEntries = getGroupedLogbookEntries(); // Gunakan fungsi baru ini

  // --- Logbook Detail Modal ---
  function openLogbookModal(logbookEntry) {
    setSelectedLogbook(logbookEntry);
    setIsLogbookModalOpen(true);
  }

  function closeLogbookModal() {
    setIsLogbookModalOpen(false);
    setSelectedLogbook(null);
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Monitoring Peserta</h2>
      <p className="text-gray-700 mb-6">
        Pantau rekapitulasi presensi dan baca logbook harian dari semua peserta magang.
      </p>

      {/* Bagian Rekap Presensi */}
      <div className="mb-8 p-6 border rounded-lg bg-blue-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Rekap Presensi Peserta</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Peserta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hari Aktivitas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Presensi Penuh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menunggu Presensi Pulang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {presensiRecap.map((recap) => (
                <tr key={recap.internId} className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{recap.internName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recap.totalDays} Hari</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recap.presentDays} Hari</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{recap.pendingCheckOutDays} Hari</td>
                </tr>
              ))}
              {presensiRecap.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">Belum ada data presensi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bagian Logbook Harian - Dikelompokkan per Peserta */}
      <div className="mb-8 p-6 border rounded-lg bg-green-50">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Logbook Harian Peserta</h3>
        {Object.keys(groupedLogbookEntries).length > 0 ? (
          <div className="space-y-6">
            {Object.keys(groupedLogbookEntries).map(internName => (
              <div key={internName} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-xl text-bps-blue mb-3">{internName}</h4>
                <ul className="space-y-3">
                  {groupedLogbookEntries[internName].map((entry, index) => (
                    <li
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => openLogbookModal(entry)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900">{entry.date}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); openLogbookModal(entry); }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                          title="Baca Logbook"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">{entry.logbook}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Belum ada entri logbook dari peserta.</p>
        )}
      </div>

      {/* Modal Logbook Detail */}
      <Transition appear show={isLogbookModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeLogbookModal}>
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
                    Logbook: {selectedLogbook?.internName} ({selectedLogbook?.date})
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      {selectedLogbook?.logbook}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeLogbookModal}
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

export default AdminMonitoringPage;