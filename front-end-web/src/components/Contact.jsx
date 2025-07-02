import React from 'react';

function Contact() {
  return (
    <section id="contact" className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Informasi Kontak BPS Kabupaten Pringsewu
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-bps-blue mb-3">Alamat</h3>
            <p className="text-gray-700">
              Jl. Raya Gading Rejo KM.33,<br />
              Wonodadi, Gading Rejo,<br />
              Kabupaten Pringsewu, Lampung, 35372
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-bps-blue mb-3">Kontak</h3>
            <p className="text-gray-700">
              <strong>Telepon:</strong> (62-729) 7330811<br />
              <strong>E-mail:</strong> bps1810@bps.go.id<br />
              <strong>Website:</strong> <a href="https://pringsewukab.bps.go.id/" className="text-blue-500 hover:underline">https://pringsewukab.bps.go.id/</a>
            </p>
          </div>
        </div>
        <div className="text-center mt-12">
          <p className="text-gray-700">
            Untuk pertanyaan lebih lanjut mengenai program magang, silakan hubungi kami melalui informasi di atas.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Contact;