/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./views/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
      extend: {
        colors: {
          // Cores Oficiais do Manual SOW BRAND
          'sow-black': '#000000',
          'sow-grey': '#545454',
          'sow-green': '#72BF03',
          'sow-white': '#FFFFFF',
          'sow-border': '#E5E5E5', // Para bordas sutis
          'sow-light': '#F9FAFB',  // Para fundos de contraste leve
        },
        fontFamily: {
          // Tipografia Oficial
          helvetica: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
          montserrat: ['Montserrat', 'sans-serif'],
        },
        boxShadow: {
          'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        }
      },
    },
    plugins: [],
  }