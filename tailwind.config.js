/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B3D2E',
          50: '#E8F5EE',
          100: '#C8E6D4',
          500: '#0B3D2E',
          600: '#092E23',
          700: '#07201A',
        },
        accent: {
          DEFAULT: '#F47920',
          50: '#FEF3E8',
          100: '#FDE0BE',
          500: '#F47920',
          600: '#D4661A',
        },
      },
    },
  },
  plugins: [],
};
