/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#121626',
          secondary: '#1E2035',
          card: '#2E303A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B6B8C2',
        },
        accent: {
          300: '#e072ff',
          500: '#d323ff',
          700: '#b100e3',
        },
      },
    },
  },
  plugins: [],
}