/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./script/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        customBackground: '#040213',
        darkMode: '#1D1448',
        bgDarkMode: "#ffffff",
        whiteMode: '#e2e2e2ff',
        bgWhiteMode: "#3E3D3C",
      }
    },
  },
  plugins: [],
}

