import React from 'react';

function Hero() {
  return (
    <section className="bg-bps-blue text-white py-20 px-4">
      <div className="container mx-auto text-center">
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