import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

function AdminAssignmentsPage() { // Ubah nama fungsi menjadi AdminAssignmentsPage
  // Dummy data interns (bisa diambil dari sumber data global jika ada)
  const [interns, setInterns] = useState([
    { id: 'int001', name: 'Budi Santoso', email: 'budi.santoso@example.com' },
    { id: 'int002', name: 'Siti Aminah', email: 'siti.aminah@example.com' },
    { id: 'int003', name: 'Dedi Kurniawan', email: 'dedi.kurniawan@example.com' },
    { id: 'int004', name: 'Nurul Hidayah', email: 'nurul.hidayah@example.com' },
  ]);

  // Dummy data penugasan yang dikelola Admin
  const [assignments, setAssignments] = useState(() => {
    const savedAssignments = localStorage.getItem('adminAssignmentsData'); // Ubah kunci localStorage
    if (savedAssignments) {
      return JSON.parse(savedAssignments);
    }
    return [
      {
        id: 1,
        title: 'Analisis Data Penjualan Kuartal 1 dan Buat Ringkasan Eksekutif yang Komprehensif',
        description: 'Lakukan analisis data penjualan kuartal 1 dan buat ringkasan eksekutif.',
        assignedTo: ['int001', 'int002'],
        submissionType: 'file',
        deadline: '2025-07-10',
        submissions: {
          'int001': { status: 'Submitted', content: { name: 'Laporan_Budi.pdf', url: '#' }, feedback: '', score: null },
          'int002': { status: 'Not Submitted' },
        }
      },
      {
        id: 2,
        title: 'Tanggapan Draft Kebijakan Baru',
        description: 'Baca draft kebijakan baru dan berikan tanggapan tertulis Anda.',
        assignedTo: ['int003'],
        submissionType: 'text',
        deadline: '2025-07-15',
        submissions: {
          'int003': { status: 'Submitted', content: { text: 'Kebijakan ini sangat baik, namun perlu penyesuaian...' }, feedback: '', score: null },
        }
      },
      {
        id: 3,
        title: 'Ulasan Website BPS',
        description: 'Berikan ulasan komprehensif terhadap website BPS Pringsewu. Sertakan link Google Docs jika reviewnya panjang.',
        assignedTo: ['int004'],
        submissionType: 'link',
        deadline: '2025-07-20',
        submissions: {
          'int004': { status: 'Not Submitted' },
        }
      },
    ];
  });

  // State untuk modal Create/Edit Tugas
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // State untuk form Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState([]);
  const [formSubmissionType, setFormSubmissionType] = useState('file');
  const [formDeadline, setFormDeadline] = useState('');

  // State untuk modal Review Submission
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingAssignment, setReviewingAssignment] = useState(null);
  const [reviewingInternId, setReviewingInternId] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewScore, setReviewScore] = useState('');

  useEffect(() => {
    const savedAssignments = localStorage.getItem('adminAssignmentsData'); // Gunakan kunci yang sama
    if (savedAssignments) {
      setAssignments(JSON.parse(savedAssignments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adminAssignmentsData', JSON.stringify(assignments)); // Simpan dengan kunci yang sama
  }, [assignments]);


  // --- CRUD Tugas ---
  function openCreateModal() {
    setEditingAssignment(null);
    setFormTitle('');
    setFormDescription('');
    setFormAssignedTo([]);
    setFormSubmissionType('file');
    setFormDeadline('');
    setIsCreateModalOpen(true);
  }

  function openEditModal(assignment) {
    setEditingAssignment(assignment);
    setFormTitle(assignment.title);
    setFormDescription(assignment.description);
    setFormAssignedTo(assignment.assignedTo);
    setFormSubmissionType(assignment.submissionType);
    setFormDeadline(assignment.deadline);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
  }

  const handleCreateOrUpdateAssignment = (e) => {
    e.preventDefault();
    if (!formTitle || !formDescription || formAssignedTo.length === 0 || !formDeadline) {
      alert('Mohon lengkapi semua bidang yang wajib diisi.');
      return;
    }

    const newAssignment = {
      title: formTitle,
      description: formDescription,
      assignedTo: formAssignedTo,
      submissionType: formSubmissionType,
      deadline: formDeadline,
      submissions: {},
    };

    formAssignedTo.forEach(internId => {
      newAssignment.submissions[internId] = { status: 'Not Submitted', content: null, feedback: '', score: null };
    });

    if (editingAssignment) {
      setAssignments(assignments.map(assign =>
        assign.id === editingAssignment.id ? { ...assign, ...newAssignment, id: editingAssignment.id } : assign
      ));
      alert('Tugas berhasil diperbarui!');
    } else {
      newAssignment.id = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
      setAssignments([...assignments, newAssignment]);
      alert('Tugas baru berhasil dibuat!');
    }
    closeCreateModal();
  };

  const handleDeleteAssignment = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      setAssignments(assignments.filter(assign => assign.id !== id));
      alert('Tugas berhasil dihapus!');
    }
  };


  // --- Review Submission ---
  function openReviewModal(assignment, internId) {
    setReviewingAssignment(assignment);
    setReviewingInternId(internId);
    const submission = assignment.submissions ?.[internId];
    if (submission) {
      setReviewFeedback(submission.feedback || '');
      setReviewScore(submission.score || '');
    } else {
      setReviewFeedback('');
      setReviewScore('');
    }
    setIsReviewModalOpen(true);
  }

  function closeReviewModal() {
    setIsReviewModalOpen(false);
    setReviewingAssignment(null);
    setReviewingInternId(null);
    setReviewFeedback('');
    setReviewScore('');
  }

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewingAssignment || !reviewingInternId) return;

    const updatedAssignments = assignments.map(assign => {
      if (assign.id === reviewingAssignment.id) {
        return {
          ...assign,
          submissions: {
            ...assign.submissions,
            [reviewingInternId]: {
              ...assign.submissions[reviewingInternId],
              feedback: reviewFeedback,
              score: reviewScore ? parseFloat(reviewScore) : null,
              status: 'Reviewed'
            }
          }
        };
      }
      return assign;
    });
    setAssignments(updatedAssignments);
    alert('Review berhasil disimpan!');
    closeReviewModal();
  };


  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Manajemen Penugasan (Admin)</h2> {/* Ubah judul */}
      <p className="text-gray-700 mb-6">
        Sebagai Admin, Anda dapat mengelola semua penugasan untuk peserta magang.
      </p>

      {/* Tombol Buat Tugas Baru */}
      <div className="mb-6 text-right">
        <button
          onClick={openCreateModal}
          className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Buat Tugas Baru
        </button>
      </div>

      {/* Daftar Penugasan */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/12">Judul Tugas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Tipe Input</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Batas Waktu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-3/12">Ditugaskan Kepada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4/12">Status Submission</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assignments.map((assignment) => (
              <Fragment key={assignment.id}>
                <tr className="bg-white hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">{assignment.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    <span className="capitalize">{assignment.submissionType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">{assignment.deadline}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 break-words">
                    {assignment.assignedTo.map(internId => {
                      const intern = interns.find(i => i.id === internId);
                      return <span key={internId} className="block">{intern ? intern.name : `ID:${internId}`}</span>;
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 break-words">
                    {Object.keys(assignment.submissions).map(internId => {
                      const intern = interns.find(i => i.id === internId);
                      const submission = assignment.submissions ?.[internId];
                      return (
                        <div key={internId} className="flex flex-wrap items-center space-x-2">
                          <span className="font-medium">{intern ? intern.name : `ID:${internId}`}:</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                            ${submission?.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                              submission?.status === 'Reviewed' ? 'bg-green-100 text-green-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {submission?.status}
                          </span>
                          {submission?.status !== 'Not Submitted' && (
                            <button
                              onClick={() => openReviewModal(assignment, internId)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                              title="Review Submission"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          {/* {(submission?.status === 'Submitted' || submission?.status === 'Reviewed') && (
                            <button
                              onClick={() => openReviewModal(assignment, internId)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100"
                              title="Edit Review"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          )} */}
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              </Fragment>
            ))}
            {assignments.length === 0 && (
                <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Belum ada tugas yang dibuat.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Modal Buat/Edit Tugas */}
      <Transition appear show={isCreateModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeCreateModal}>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-4">
                    {editingAssignment ? 'Edit Tugas' : 'Buat Tugas Baru'}
                  </Dialog.Title>

                  <form onSubmit={handleCreateOrUpdateAssignment}>
                    <div className="mb-4">
                      <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Judul Tugas:</label>
                      <input
                        type="text"
                        id="title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Deskripsi Tugas:</label>
                      <textarea
                        id="description"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="4"
                        required
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="assignedTo" className="block text-gray-700 text-sm font-bold mb-2">Ditugaskan Kepada:</label>
                      <select
                        id="assignedTo"
                        multiple
                        value={formAssignedTo}
                        onChange={(e) => setFormAssignedTo(Array.from(e.target.selectedOptions, option => option.value))}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue h-32"
                        required
                      >
                        {interns.map(intern => (
                          <option key={intern.id} value={intern.id}>{intern.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Pilih satu atau beberapa peserta magang (gunakan Ctrl/Cmd + klik untuk multiple select).</p>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="submissionType" className="block text-gray-700 text-sm font-bold mb-2">Jenis Input Tugas:</label>
                      <select
                        id="submissionType"
                        value={formSubmissionType}
                        onChange={(e) => setFormSubmissionType(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      >
                        <option value="file">File (PDF, DOCX, ZIP, dll.)</option>
                        <option value="text">Teks Langsung</option>
                        <option value="link">Link (Google Drive, GitHub, dll.)</option>
                        <option value="none">Tidak ada pengumpulan (hanya tandai selesai)</option>
                      </select>
                    </div>
                    <div className="mb-6">
                      <label htmlFor="deadline" className="block text-gray-700 text-sm font-bold mb-2">Batas Waktu (Deadline):</label>
                      <input
                        type="date"
                        id="deadline"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeCreateModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        {editingAssignment ? 'Simpan Perubahan' : 'Buat Tugas'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>


      {/* Modal Review Submission */}
      <Transition appear show={isReviewModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeReviewModal}>
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
                    Review Tugas: {reviewingAssignment?.title}
                  </Dialog.Title>
                  <p className="text-sm text-gray-700 mb-2">
                    **Peserta:** {interns.find(i => i.id === reviewingInternId)?.name}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    **Status:**{' '}
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                      ${reviewingAssignment?.submissions[reviewingInternId]?.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                        reviewingAssignment?.submissions[reviewingInternId]?.status === 'Reviewed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {reviewingAssignment?.submissions[reviewingInternId]?.status}
                    </span>
                  </p>

                  {/* Tampilkan konten submission */}
                  <div className="mb-4 p-3 border rounded-lg bg-gray-50">
                    <h4 className="font-semibold text-gray-800 mb-2">Konten Submission:</h4>
                    {reviewingAssignment?.submissionType === 'file' && reviewingAssignment?.submissions[reviewingInternId]?.content?.name && (
                      <p className="text-sm text-gray-700">
                        File: <a href={reviewingAssignment.submissions[reviewingInternId].content.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {reviewingAssignment.submissions[reviewingInternId].content.name}
                        </a>
                      </p>
                    )}
                    {reviewingAssignment?.submissionType === 'text' && reviewingAssignment?.submissions[reviewingInternId]?.content?.text && (
                      <p className="text-sm text-gray-700 italic">
                        "{reviewingAssignment.submissions[reviewingInternId].content.text}"
                      </p>
                    )}
                    {reviewingAssignment?.submissionType === 'link' && reviewingAssignment?.submissions[reviewingInternId]?.content?.link && (
                      <p className="text-sm text-gray-700">
                        Link: <a href={reviewingAssignment.submissions[reviewingInternId].content.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {reviewingAssignment.submissions[reviewingInternId].content.link}
                        </a>
                      </p>
                    )}
                    {(reviewingAssignment?.submissions[reviewingInternId]?.status === 'Not Submitted' || !reviewingAssignment?.submissions[reviewingInternId]?.content) && (
                      <p className="text-sm text-gray-500">Peserta belum melakukan submission atau tidak ada konten.</p>
                    )}
                  </div>

                  {/* Form Feedback dan Nilai */}
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label htmlFor="feedback" className="block text-gray-700 text-sm font-bold mb-2">Feedback:</label>
                      <textarea
                        id="feedback"
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="score" className="block text-gray-700 text-sm font-bold mb-2">Nilai (0-100):</label>
                      <input
                        type="number"
                        id="score"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(e.target.value)}
                        className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeReviewModal}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-bps-blue hover:bg-bps-light-blue text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        Simpan Review
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

export default AdminAssignmentsPage;