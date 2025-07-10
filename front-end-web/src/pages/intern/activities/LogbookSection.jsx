// File: components/LogbookSection.jsx
import React, { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

function LogbookSection() {
  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [selectedDate] = useState(today.toISOString().split('T')[0]);
  const selectedDateObject = new Date(selectedDate);

  const [logbookEntries, setLogbookEntries] = useState(() => {
    const saved = localStorage.getItem('logbookEntries_' + selectedDate);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentLogbookText, setCurrentLogbookText] = useState('');
  const [editingLogbookEntry, setEditingLogbookEntry] = useState(null);

  const isPastDate = selectedDateObject < todayDateOnly;
  const isFutureDate = selectedDateObject > todayDateOnly;
  const isToday = selectedDateObject.toDateString() === todayDateOnly.toDateString();

  useEffect(() => {
    localStorage.setItem('logbookEntries_' + selectedDate, JSON.stringify(logbookEntries));
  }, [logbookEntries, selectedDate]);

  const addLogbookEntry = () => {
    if (!currentLogbookText.trim()) return;
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      activity: currentLogbookText.trim(),
    };
    setLogbookEntries([...logbookEntries, newEntry]);
    setCurrentLogbookText('');
  };

  const saveEditedLogbook = () => {
    if (!editingLogbookEntry) return;
    const updated = logbookEntries.map((entry) =>
      entry.id === editingLogbookEntry.id ? { ...entry, activity: currentLogbookText.trim() } : entry
    );
    setLogbookEntries(updated);
    setEditingLogbookEntry(null);
    setCurrentLogbookText('');
  };

  const deleteLogbookEntry = (id) => {
    if (window.confirm('Yakin ingin menghapus entri ini?')) {
      setLogbookEntries(logbookEntries.filter((entry) => entry.id !== id));
    }
  };

  const startEditLogbook = (entry) => {
    setEditingLogbookEntry(entry);
    setCurrentLogbookText(entry.activity);
  };

  const cancelEdit = () => {
    setEditingLogbookEntry(null);
    setCurrentLogbookText('');
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-yellow-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Logbook Harian</h3>

      {isToday && (
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-gray-700 mb-2">
            {editingLogbookEntry ? 'Edit Entri Logbook' : 'Tambah Entri Logbook'}
          </h4>
          <textarea
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
            rows="3"
            placeholder="Tuliskan aktivitas harian Anda..."
            value={currentLogbookText}
            onChange={(e) => setCurrentLogbookText(e.target.value)}
          ></textarea>
          <div className="flex justify-end gap-2">
            {editingLogbookEntry && (
              <button
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1.5 px-4 rounded-lg text-sm"
              >
                Batal
              </button>
            )}
            <button
              onClick={editingLogbookEntry ? saveEditedLogbook : addLogbookEntry}
              className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-1.5 px-4 rounded-lg text-sm"
              disabled={!currentLogbookText.trim()}
            >
              {editingLogbookEntry ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </div>
      )}

      {logbookEntries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-7/12">Aktivitas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logbookEntries.map((entry) => (
                <tr key={entry.id} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium whitespace-nowrap">{entry.time}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 break-words">{entry.activity}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => startEditLogbook(entry)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5 inline-block" /> Edit
                    </button>
                    <button
                      onClick={() => deleteLogbookEntry(entry.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <TrashIcon className="h-5 w-5 inline-block" /> Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600">Belum ada entri logbook untuk hari ini.</p>
      )}
    </div>
  );
}

export default LogbookSection;