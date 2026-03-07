/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          50: '#e6e9ed',
          100: '#c0c8d4',
          200: '#96a4b8',
          300: '#6c809c',
          400: '#4d6588',
          500: '#2e4a74',
          600: '#29436c',
          700: '#233a61',
          800: '#1d3257',
          900: '#122244',
          950: '#0a1628',
        },
        gold: {
          DEFAULT: '#FFD700',
          50: '#fffef0',
          100: '#fffacc',
          200: '#fff399',
          300: '#ffeb66',
          400: '#ffe033',
          500: '#FFD700',
          600: '#ccac00',
          700: '#998100',
          800: '#665600',
          900: '#332b00',
        },
        silver: {
          DEFAULT: '#C0C0C0',
          50: '#fafafa',
          100: '#f0f0f0',
          200: '#e0e0e0',
          300: '#C0C0C0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#303030',
          900: '#202020',
        },
        bronze: {
          DEFAULT: '#CD7F32',
          500: '#CD7F32',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'shine': 'shine 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        shine: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
      },
    },
  },
  plugins: [],
}
