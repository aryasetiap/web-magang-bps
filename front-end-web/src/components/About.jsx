import React from 'react';

function About() {
  return (
    <section id="about" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Tentang Magang di BPS Kabupaten Pringsewu
        </h2>
        <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <p className="text-gray-700 leading-relaxed">
            Program magang/kuliah lapangan/kuliah praktik/praktik kerja lapangan di BPS Kabupaten Pringsewu menawarkan kesempatan berharga bagi mahasiswa dan siswa untuk mendapatkan pengalaman praktis di lingkungan kerja profesional. Peserta magang akan terlibat dalam berbagai kegiatan yang relevan dengan statistik dan data, termasuk pengumpulan data, pengolahan data, analisis data, dan penyajian data.
          </p>
          <ul className="list-disc list-inside mt-6 text-gray-700">
            <li>Mendapatkan bimbingan dari para ahli di bidang statistik.</li>
            <li>Mengembangkan keterampilan teknis dan analitis.</li>
            <li>Memperluas jaringan profesional.</li>
            <li>Berkontribusi pada proyek-proyek nyata yang berdampak.</li>
          </ul>
          <p className="text-gray-700 mt-6 leading-relaxed">
            Kami mencari individu yang termotivasi, memiliki kemampuan belajar yang tinggi, dan tertarik pada dunia data. Jika kamu siap untuk tantangan dan ingin mengembangkan diri, magang atau praktik kerja lapangan di BPS Kabupaten Pringsewu adalah pilihan yang tepat.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;