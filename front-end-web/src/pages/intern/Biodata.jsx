import React, { useState, useEffect } from 'react';

function BiodataPage() { // Pastikan nama fungsi adalah BiodataPage
  // State untuk data identitas diri
   const [formData, setFormData] = useState({
    namaLengkap: '',
    nimNisn: '',
    asalInstitusi: '',
    jurusanProdi: '',
    nomorTelepon: '',
    email: '',
    alamat: '',
  });

  const [files, setFiles] = useState({
    cv: null,
    transkripNilai: null,
    suratPermohonan: null,
  });

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3000/auth/profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setFormData({
            namaLengkap: data.namaLengkap || '',
            nimNisn: data.nimNisn || '',
            asalInstitusi: data.asalInstitusi || '',
            jurusanProdi: data.jurusanProdi || '',
            nomorTelepon: data.nomorTelepon || '',
            email: data.email || '',
            alamat: data.alamat || '',
          });
        }
      } catch (err) {
        console.error('Gagal mengambil data biodata:', err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles((prevFiles) => ({ ...prevFiles, [name]: selectedFiles[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Token tidak ditemukan. Silakan login ulang.');
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    if (files.cv) formDataToSend.append('cv', files.cv);
    if (files.transkripNilai) formDataToSend.append('transkripNilai', files.transkripNilai);
    if (files.suratPermohonan) formDataToSend.append('suratPermohonan', files.suratPermohonan);

    try {
      const res = await fetch('http://localhost:3000/auth/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await res.json();

      if (res.ok) {
        alert('Biodata berhasil diperbarui!');
      } else {
        alert(result.message || 'Gagal memperbarui biodata.');
      }
    } catch (error) {
      console.error('Error updating biodata:', error);
      alert('Terjadi kesalahan saat menyimpan biodata.');
    }
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Di sini Anda akan mengirim formData dan files ke API backend.
  //   // Contoh simulasi pengiriman data:
  //   console.log('Data Identitas Diri:', formData);
  //   console.log('Berkas CV:', files.cv ? files.cv.name : 'Belum diunggah');
  //   console.log('Berkas Transkrip Nilai/Rapor:', files.transkripNilai ? files.transkripNilai.name : 'Belum diunggah');
  //   console.log('Berkas Surat Permohonan:', files.suratPermohonan ? files.suratPermohonan.name : 'Belum diunggah');

  //   // Anda bisa menambahkan validasi di sini untuk memastikan file wajib sudah diunggah
  //   if (!files.cv || !files.transkripNilai || !files.suratPermohonan) {
  //       alert('Mohon lengkapi semua berkas yang wajib diunggah.');
  //       return;
  //   }

  //   alert('Data biodata dan berkas berhasil disimpan (simulasi)!');
  //   // Anda bisa menambahkan logika redirect atau pesan sukses di sini
  // };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Biodata Diri</h2>
      <p className="text-gray-700 mb-6">
        Mohon lengkapi data identitas diri dan unggah berkas yang diperlukan untuk kelengkapan data magang.
        Bidang dengan tanda (<span className="text-red-500">*</span>) wajib diisi.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Bagian Identitas Diri */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Identitas Diri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="namaLengkap" className="block text-gray-700 text-sm font-bold mb-2">
                Nama Lengkap: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="namaLengkap"
                name="namaLengkap"
                value={formData.namaLengkap}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="nimNisn" className="block text-gray-700 text-sm font-bold mb-2">
                NIM / NISN: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nimNisn"
                name="nimNisn"
                value={formData.nimNisn}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                // required
              />
            </div>
            <div>
              <label htmlFor="asalInstitusi" className="block text-gray-700 text-sm font-bold mb-2">
                Asal Sekolah / Universitas: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="asalInstitusi"
                name="asalInstitusi"
                value={formData.asalInstitusi}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="jurusanProdi" className="block text-gray-700 text-sm font-bold mb-2">
                Jurusan / Program Studi: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jurusanProdi"
                name="jurusanProdi"
                value={formData.jurusanProdi}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="nomorTelepon" className="block text-gray-700 text-sm font-bold mb-2">
                Nomor Telepon: <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="nomorTelepon"
                name="nomorTelepon"
                value={formData.nomorTelepon}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email: <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="alamat" className="block text-gray-700 text-sm font-bold mb-2">
                Alamat Lengkap: <span className="text-red-500">*</span>
              </label>
              <textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows="3"
                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-bps-blue"
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Bagian Unggah Berkas */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Unggah Berkas</h3>
          <p className="text-gray-600 text-sm mb-4">
            Unggah berkas dalam format PDF. Ukuran maksimal 2MB per berkas.
            Berkas dengan tanda (<span className="text-red-500">*</span>) wajib diunggah.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cv" className="block text-gray-700 text-sm font-bold mb-2">
                Curriculum Vitae (CV): <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="cv"
                name="cv"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-bps-blue file:text-white
                  hover:file:bg-bps-light-blue"
                // required
              />
              {files.cv && <p className="mt-2 text-sm text-gray-600">Terpilih: {files.cv.name}</p>}
            </div>
            <div>
              <label htmlFor="transkripNilai" className="block text-gray-700 text-sm font-bold mb-2">
                Transkrip Nilai / Rapor: <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="transkripNilai"
                name="transkripNilai"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-bps-blue file:text-white
                  hover:file:bg-bps-light-blue"
                // required 
              />
              {files.transkripNilai && <p className="mt-2 text-sm text-gray-600">Terpilih: {files.transkripNilai.name}</p>}
            </div>
            <div>
              <label htmlFor="suratPermohonan" className="block text-gray-700 text-sm font-bold mb-2">
                Surat Permohonan Magang: <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="suratPermohonan"
                name="suratPermohonan"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-bps-blue file:text-white
                  hover:file:bg-bps-light-blue"
                // required 
              />
              {files.suratPermohonan && <p className="mt-2 text-sm text-gray-600">Terpilih: {files.suratPermohonan.name}</p>}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="bg-bps-green hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Simpan Biodata
        </button>
      </form>
    </div>
  );
}

export default BiodataPage;