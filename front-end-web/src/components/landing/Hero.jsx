import React from 'react';
import kantorBPS from '../../assets/kantor-bps-1.jpg'; // Pastikan path ini benar

function Hero() {
  return (
    <section
      className="relative text-white py-40 px-4 bg-cover bg-center bg-no-repeat" // Tambahkan 'relative' dan kelas background
      style={{ backgroundImage: `url(${kantorBPS})` }} // Gunakan style untuk gambar background
    >
      {/* Overlay hitam semi-transparan */}
      <div className="absolute inset-0 bg-black bg-opacity-45"></div> {/* Hapus mb-40 */}
      
      {/* Konten Hero, pastikan di atas overlay dengan z-index */}
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-xl md:text-2xl opacity-90">
          Selamat Datang
        </h2>
        <p className="text-2xl md:text-4xl font-extrabold leading-tight mb-6 mb-8">
          PLATFORM MAGANG BPS KABUPATEN PRINGSEWU
        </p>
        
        <div className="space-x-4">
          <a 
            href="/register" 
            className="bg-bps-green hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Daftar Sekarang!
          </a>
          <a 
            href="/login" 
            className="border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white hover:text-bps-blue shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Masuk ke Sistem
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;