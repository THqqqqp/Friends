/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          light: '#60a5fa',
          dark: '#1e3a8a'
        }
      }
    }
  },
  plugins: []
}
