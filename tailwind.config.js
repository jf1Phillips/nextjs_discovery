/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        customGrey: 'rgba(41, 30, 49, 1)',
        customWhite: 'rgba(255, 255, 255, 1)',
      }
    },
  },
  plugins: [],
}

