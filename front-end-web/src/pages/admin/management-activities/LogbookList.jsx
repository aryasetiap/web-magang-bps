import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PrinterIcon,
} from "@heroicons/react/24/outline";
import { formatTime } from "../../../utils/formatDateTime";

function LogbookList() {
  const [logbooks, setLogbooks] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchLogbooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/logbooks/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setLogbooks(data.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil logbook:", err);
      }
    };

    fetchLogbooks();
  }, [token]);

  // Filter berdasarkan nama & tanggal
  const filteredLogbooks = logbooks.filter((entry) => {
    const nameMatch = entry.user?.name
      ?.toLowerCase()
      .includes(searchName.toLowerCase());

    const logDate = new Date(entry.logDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateMatch = (!start || logDate >= start) && (!end || logDate <= end);

    return nameMatch && dateMatch;
  });

  // Kelompokkan logbook per peserta
  const grouped = {};
  filteredLogbooks.forEach((entry) => {
    const name = entry.user?.name || "Peserta Tanpa Nama";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(entry);
  });

  const totalPages = Math.ceil(Object.keys(grouped).length / itemsPerPage);
  const paginatedNames = Object.keys(grouped).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrintLogbook = async (userId) => {
    if (!startDate || !endDate) {
      alert("Harap isi tanggal awal dan akhir.");
      return;
    }

    try {
      const query = new URLSearchParams({ startDate, endDate });

      const res = await fetch(
        `http://localhost:3000/logbooks/${userId}/report?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mencetak PDF logbook");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logbook-intern-${userId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Gagal mencetak PDF: " + err.message);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-yellow-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Logbook Harian Peserta
      </h3>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari nama peserta..."
          value={searchName}
          onChange={(e) => {
            setSearchName(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 focus:outline-none"
        />
      </div>

      {paginatedNames.length > 0 ? (
        <div className="space-y-6">
          {paginatedNames.map((name) => (
            <div
              key={name}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <h4 className="text-xl text-bps-blue mb-3 flex justify-between items-center">
                <p className="font-bold">{name}</p>
                <button
                  onClick={() => handlePrintLogbook(grouped[name][0].user?.id)}
                  className="h-100 font-semibold text-sm px-3 py-1 rounded bg-bps-blue text-white hover:bg-bps-dark"
                >
                  <PrinterIcon className="h-5 w-5 inline-block mr-2" />
                  Cetak
                </button>
              </h4>
              <ul className="space-y-3">
                {grouped[name].map((log, i) => (
                  <li
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setModalData({ name, ...log })}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900">
                        {formatTime(log.logDate)}
                      </span>
                      <EyeIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {log.content}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
      ) : (
        <p className="text-gray-600">
          Tidak ditemukan logbook dengan filter tersebut.
        </p>
      )}

      {/* Modal Logbook */}
      <Transition appear show={!!modalData} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setModalData(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-25">
              <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-2">
                  Logbook: {modalData?.name} ({formatTime(modalData?.logDate)})
                </h3>
                <p className="text-sm text-gray-700">{modalData?.content}</p>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setModalData(null)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}

export default LogbookList;
