// components/DocumentPreview.jsx
import React, { useState } from "react";

function DocumentPreview({ file }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewURL, setPreviewURL] = useState(null);

  const handlePreview = () => {
    if (file) {
      const blobURL = URL.createObjectURL(file);
      setPreviewURL(blobURL);
      setShowPreview(true);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    URL.revokeObjectURL(previewURL); // Bersihkan URL blob
  };

  if (!file) return null;

  return (
    <div className="mt-2">
      <p className="text-sm text-gray-600">Terpilih: {file.name}</p>
      <button
        type="button"
        onClick={handlePreview}
        className="text-sm text-blue-600 hover:underline mt-1"
      >
        Lihat Dokumen
      </button>

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl h-[90vh] rounded shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
              onClick={closePreview}
            >
              ✕
            </button>
            <iframe
              src={previewURL}
              title="Preview PDF"
              className="rounded-b"
              allow="fullscreen"
              style={{ border: "none", width: "100%", height: "100%" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentPreview;
