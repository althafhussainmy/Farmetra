/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#2e7d32', // main
          600: '#27692a',
          700: '#1f5222',
          800: '#183f1b',
          900: '#102913',
        },
        secondary: {
          50: '#f1f8f3',
          100: '#dbeee0',
          200: '#a5d6a7',
          300: '#7fc68a',
          400: '#5ab56d',
          500: '#3da450',
          600: '#2f8340',
          700: '#236333',
          800: '#164226',
          900: '#0a2316',
        },
        accent: '#ffc107',
        background: '#F9FBF7',
        earth: { 100: '#f5f0e8', 200: '#e8dcc8', 300: '#c4a574', 400: '#8b6914', 500: '#5c4a1a', 600: '#4a3b14', 700: '#3d3010', 800: '#2e240c' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Merriweather"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
