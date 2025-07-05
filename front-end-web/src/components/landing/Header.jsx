import React from 'react';
// import BPSLogo from '../../assets/logo-bps.png'
import BrandLogo from '../BrandLogo';

function Header() {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* <img src={BPSLogo} alt="Logo BPS Pringsewu" className="h-10 mr-3" />
          <h1 className="text-lg md:text-xl font-bold text-bps-blue leading-tight">
            Sistem Magang<br />
            BPS Kabupaten Pringsewu
          </h1> */}
          <BrandLogo />
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <a
                href="#about"
                className="text-gray-600 hover:text-bps-blue transition-colors duration-200"
              >
                Tentang
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-gray-600 hover:text-bps-blue transition-colors duration-200"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-gray-600 hover:text-bps-blue transition-colors duration-200"
              >
                Kontak
              </a>
            </li>
            <li>
              <a
                href="/login"
                className="border-2 border-bps-blue text-bps-blue font-semibold py-2 px-4 rounded-lg shadow-md  transition-colors duration-200"
              >
                Login
              </a>
            </li>
            <li>
              <a
                href="/register"
                className="bg-bps-blue hover:bg-bps-light-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Registrasi
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
