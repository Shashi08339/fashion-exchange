// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#059669', dark: '#047857', light: '#34d399' },
        secondary: { DEFAULT: '#4f46e5', dark: '#4338ca', light: '#818cf8' },
        accent: { DEFAULT: '#ea580c', dark: '#c2410c', light: '#fb923c' },
        surface: { DEFAULT: '#ffffff', dark: '#111827' }
      },
      boxShadow: {
        'smooth': '0 4px 30px rgba(0, 0, 0, 0.03)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }
    },
  },
  plugins: [],
}