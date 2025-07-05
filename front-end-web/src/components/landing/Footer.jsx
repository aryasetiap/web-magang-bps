import React from "react";

function Footer() {
  return (
    <footer className="bg-bps-white text-bps-blue shadow-sm py-10 px-4">
      <div className="container mx-auto text-center text-sm">
        <p>
          &copy; {new Date().getFullYear()} BPS Kabupaten Pringsewu. Hak Cipta
          Dilindungi Undang-Undang.
        </p>
        <p className="mt-2">
          Dikembangkan oleh Tim Magang BPS Kabupaten Pringsewu.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
