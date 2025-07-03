// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bps-blue": "#2A3C7E", // Contoh warna dasar BPS
        "bps-light-blue": "#4A60A8",
        "bps-green": "#10B981", // Untuk success/accent
      },
    },
  },
  plugins: [],
};
