/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#4A5CDB',
            dark: '#3A4Ac8',
            light: '#6070E6',
          },
          secondary: {
            DEFAULT: '#8A2BE2',
            dark: '#7A1BD2',
            light: '#9A3BF2',
          },
          background: {
            dark: '#161A2B',
            DEFAULT: '#1E2235',
            light: '#2A2F45',
          },
          accent: {
            DEFAULT: '#FF6B6B',
            dark: '#E55A5A',
            light: '#FF8A8A',
          },
          text: {
            primary: '#F0F2F5',
            secondary: '#B0B4C1',
            muted: '#7A7F92',
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
        boxShadow: {
          'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
          'inner-soft': 'inset 0 2px 5px 0 rgba(0, 0, 0, 0.1)',
        },
        animation: {
          'fade-in': 'fadeIn 0.3s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-in-out',
          'slide-down': 'slideDown 0.3s ease-in-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          slideDown: {
            '0%': { transform: 'translateY(-20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
      },
    },
    plugins: [],
  }