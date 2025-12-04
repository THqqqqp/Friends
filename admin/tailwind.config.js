import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans]
      },
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9e9ff',
          200: '#bcd9ff',
          300: '#91c2ff',
          400: '#66a4ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4fd7',
          800: '#1e3fb0',
          900: '#1e3a8a'
        }
      }
    }
  },
  plugins: [forms]
}
