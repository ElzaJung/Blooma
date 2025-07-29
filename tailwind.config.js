/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        statusGreen: "#68DB94",
        statusOrange: "#FEA439",
        statusRed: "#FF7F70",
      },
    },
  },
  plugins: [],
};
