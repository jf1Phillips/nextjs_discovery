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
        customBackground: '#1C0B19',
        darkMode: '#171219',
        bgDarkMode: "#f3ebf7ff",
        whiteMode: '#ffffffff',
        bgWhiteMode: "#626C66",
      }
    },
  },
  plugins: [],
}

