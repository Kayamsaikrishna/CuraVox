/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      fontSize: {
        'accessibility-sm': '0.875rem',
        'accessibility-base': '1rem',
        'accessibility-lg': '1.125rem',
        'accessibility-xl': '1.25rem',
        'accessibility-2xl': '1.5rem',
      },
      spacing: {
        'tap-target': '44px', // Minimum touch target size for accessibility
      },
      animation: {
        'slow-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}