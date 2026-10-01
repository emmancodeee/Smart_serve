module.exports = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './public/**/*.html',
    './public/js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          700: '#1D4ED8',
          600: '#2563EB',
          500: '#3B82F6'
        },
        accent: {
          500: '#FACC15',
          300: '#FDE047',
          100: '#FEF9C3'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
