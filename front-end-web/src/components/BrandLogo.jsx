import React from 'react';
import BPSLogo from '../assets/logo-bps.png'

function BrandLogo({ showText = true, textColor = 'text-bps-blue', textFontWeight = 'font-bold', textLeading = 'leading-tight', logoSizeClass = 'h-10', onClick, textClassName = '', isTextItalic = true }) { // Tambahkan prop isTextItalic
  return (
    <div className="flex items-center" onClick={onClick}>
      <img
        src={BPSLogo}
        alt="Logo BPS Pringsewu"
        className={`${logoSizeClass} cursor-pointer mr-3`}
      />
      {showText && (
        <h1 className={`${textColor} ${textFontWeight} ${textLeading} flex-grow ${textClassName} ${isTextItalic ? 'italic' : ''}`}> {/* Tambahkan kelas italic kondisional */}
          SISTEM MAGANG<br />
          BPS KABUPATEN PRINGSEWU
        </h1>
      )}
    </div>
  );
}

export default BrandLogo;