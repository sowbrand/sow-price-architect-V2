/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'sow-black': '#000000',    // Preto Absoluto
          'sow-grey': '#545454',     // Cinza Chumbo
          'sow-green': '#72BF03',    // Verde Limão (Cor Complementar)
          'sow-white': '#FFFFFF',    // Branco Puro
          'sow-border': '#E5E5E5',   // Bordas suaves
          'sow-light': '#F9FAFB',    // Fundo alternativo
        },
        fontFamily: {
          helvetica: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
          montserrat: ['Montserrat', 'sans-serif'],
        },
        boxShadow: {
          'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        }
      },
    },
    plugins: [],
  }