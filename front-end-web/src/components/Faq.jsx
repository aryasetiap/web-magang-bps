import React from "react";
import { Disclosure } from "@headlessui/react"; // Import Disclosure

function Faq() {
  const questions = [
    {
      question:
        "Apa saja persyaratan untuk mendaftar magang di BPS Kabupaten Pringsewu?",
      answer:
        "Persyaratan umum meliputi surat permohonan magang dari universitas/sekolah, CV, transkrip nilai, dan dokumen pendukung lainnya. Detail lengkap dapat dilihat di halaman pendaftaran.",
    },
    {
      question: "Berapa lama periode magang di BPS Kabupaten Pringsewu?",
      answer:
        "Periode magang bervariasi, umumnya antara 1 hingga 3 bulan, tergantung pada kesepakatan dengan pihak universitas/sekolah dan BPS.",
    },
    {
      question: "Apakah ada kompensasi atau uang saku untuk peserta magang?",
      answer:
        "Tidak ada kompensasi atau uang saku khusus untuk peserta magang.",
    },
    {
      question:
        "Bagaimana cara saya mengetahui status pendaftaran magang saya?",
      answer:
        "Kamu dapat melihat status pendaftaran magang kamu di dashboard pribadi setelah login ke sistem.",
    },
    {
      question:
        "Siapa yang dapat saya hubungi jika memiliki pertanyaan lebih lanjut?",
      answer:
        "Kamu dapat menghubungi BPS Kabupaten Pringsewu melalui informasi kontak yang tertera di halaman Kontak.",
    },
  ];

  return (
    <section id="faq" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Pertanyaan yang Sering Diajukan (FAQ)
        </h2>
        <div className="space-y-4">
          {" "}
          {/* Adjusted spacing for accordion */}
          {questions.map((item, index) => (
            <Disclosure
              as="div"
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between items-center w-full px-6 py-4 text-left text-lg font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-bps-blue focus-visible:ring-opacity-75 rounded-t-lg">
                    <span>{item.question}</span>
                    <svg
                      className={`${
                        open ? "transform rotate-180" : ""
                      } w-5 h-5 text-bps-blue`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-6 pt-0 pb-4 text-gray-700">
                    {item.answer}
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
