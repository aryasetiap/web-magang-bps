// File: components/AssignmentSection.jsx
import React, { useState } from 'react';

function AssignmentSection() {
  const today = new Date();
  const [selectedDate] = useState(today.toISOString().split('T')[0]);

  const assignments = [
    {
      id: 1,
      title: 'Mempelajari Struktur Organisasi BPS',
      description: 'Pelajari hierarki dan fungsi setiap divisi di BPS Kabupaten Pringsewu. Buat ringkasan 2 halaman.',
      status: 'Belum Selesai',
      deadline: selectedDate,
      submissionType: 'file',
    },
    {
      id: 2,
      title: 'Beri Tanggapan tentang Survei X',
      description: 'Berikan opini Anda mengenai hasil Survei X. Tulis dalam 200 kata.',
      status: 'Belum Selesai',
      deadline: selectedDate,
      submissionType: 'text',
    },
    {
      id: 3,
      title: 'Menyusun Laporan Mingguan',
      description: 'Buat draf laporan kegiatan mingguan yang telah dilakukan dan kumpulkan ke Koordinator Magang.',
      status: 'Selesai',
      deadline: '2025-06-28',
      submissionType: 'file',
    },
  ];

  const filteredAssignments = assignments.filter((a) => a.deadline === selectedDate);

  return (
    <div className="mb-8 p-6 border rounded-lg bg-green-50">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Penugasan Hari Ini</h3>
      {filteredAssignments.length > 0 ? (
        <ul className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <li key={assignment.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg text-gray-900">{assignment.title}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${assignment.status === 'Selesai' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}
                >
                  {assignment.status}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{assignment.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Tidak ada penugasan untuk tanggal ini.</p>
      )}
    </div>
  );
}

export default AssignmentSection;
