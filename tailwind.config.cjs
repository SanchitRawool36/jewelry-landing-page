const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { backgroundPosition: '100% 0%' },
          '100%': { backgroundPosition: '-100% 0%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
      },
      fontFamily: {
        'sans': ['Montserrat', ...defaultTheme.fontFamily.sans],
        'serif': ['Playfair Display', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        'ivory': '#F7F3EA',
        'gold': {
          'DEFAULT': '#D4AF37',
          'light': '#EACD6E',
          'dark': '#B8860B',
        },
        'paper': '#FDFBF5',
      }
    },
  },
  plugins: [],
}
