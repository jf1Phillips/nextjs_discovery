/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        customGrey: 'rgba(41, 30, 49, 1)',
        customGrey2: 'rgba(87, 63, 104, 1)',
        customGrey2Hover: 'rgba(68, 50, 82, 1)',
        customWhite: 'rgba(255, 255, 255, 1)',
        darkMode: 'rgba(26, 18, 31, 1)',
        darkModeOp: 'rgba(26, 18, 31, 0.9)',
        whiteMode: 'rgba(255, 255, 255, 1)',
        whiteModeOp: 'rgba(255, 255, 255, 0.9)',
      }
    },
  },
  plugins: [],
}

