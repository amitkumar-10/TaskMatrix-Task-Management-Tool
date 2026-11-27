/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F5F3FA',
          100: '#EDE9F5',
          200: '#D8D0EC',
          300: '#BDB0DE',
          400: '#9D8DCC',
          500: '#7C6FA0',  
          600: '#6B5F8E',
          700: '#5A4F7A',
          800: '#3D3554',
          900: '#1A1625',
        },
        surface: '#F8F7FB',  // page background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}