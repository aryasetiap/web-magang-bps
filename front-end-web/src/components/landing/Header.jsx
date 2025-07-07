import React, { useState } from 'react';
import BrandLogo from '../BrandLogo';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <BrandLogo />
        </div>

        {/* Tombol Hamburger di Mobile */}
        <button
          className="text-bps-blue md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {menuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>

        {/* Menu Navigasi (Desktop) */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <a href="#about" className="text-gray-600 hover:text-bps-blue transition">
                Tentang
              </a>
            </li>
            <li>
              <a href="#faq" className="text-gray-600 hover:text-bps-blue transition">
                FAQ
              </a>
            </li>
            <li>
              <a href="#contact" className="text-gray-600 hover:text-bps-blue transition">
                Kontak
              </a>
            </li>
            <li>
              <a href="/login" className="border-2 border-bps-blue text-bps-blue font-semibold py-2 px-4 rounded-lg shadow-md">
                Login
              </a>
            </li>
            <li>
              <a href="/register" className="bg-bps-blue hover:bg-bps-light-blue text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105">
                Registrasi
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Dropdown Menu (Mobile) */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <ul className="flex flex-col p-4 space-y-2 gap-y-3">
            <li>
              <a href="#about" className="text-gray-600 hover:text-bps-blue">Tentang</a>
            </li>
            <li>
              <a href="#faq" className="text-gray-600 hover:text-bps-blue">FAQ</a>
            </li>
            <li>
              <a href="#contact" className="text-gray-600 hover:text-bps-blue">Kontak</a>
            </li>
            <li>
              <a href="/login" className="text-bps-blue border-2 border-bps-blue font-semibold py-2 px-4 rounded-lg text-center">
                Login
              </a>
            </li>
            <li className="mt-4">
              <a href="/register" className="bg-bps-blue text-white font-semibold py-2 px-4 rounded-lg text-center">
                Registrasi
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Header;
