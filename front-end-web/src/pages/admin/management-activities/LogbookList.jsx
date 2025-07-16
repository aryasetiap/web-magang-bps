import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { EyeIcon } from "@heroicons/react/24/outline";

function LogbookList() {
  const [logbooks, setLogbooks] = useState([]);
  const [modalData, setModalData] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchLogbooks = async () => {
      try {
        const res = await fetch("http://localhost:3000/logbooks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setLogbooks(data); // diasumsikan array
        }
      } catch (err) {
        console.error("Gagal mengambil logbook:", err);
      }
    };

    fetchLogbooks();
  }, [token]);

  // Kelompokkan logbook per peserta
  const grouped = {};
  logbooks.forEach((entry) => {
    const name = entry.user?.name || "Peserta Tanpa Nama";
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push(entry);
  });

  return (
    <div className="mb-8 p-6 border rounded-lg bg-green-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Logbook Harian Peserta
      </h3>
      {Object.keys(grouped).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([name, logs]) => (
            <div
              key={name}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <h4 className="font-bold text-xl text-bps-blue mb-3">{name}</h4>
              <ul className="space-y-3">
                {logs.map((log, i) => (
                  <li
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => setModalData({ name, ...log })}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-gray-900">
                        {log.logDate}
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
        </div>
      ) : (
        <p className="text-gray-600">Belum ada entri logbook dari peserta.</p>
      )}

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
                  Logbook: {modalData?.name} ({modalData?.logDate})
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
