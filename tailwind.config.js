/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0B0F19',
          850: '#0F1524',
          800: '#141D32',
          700: '#1B2744',
        },
        charcoal: {
          900: '#121826',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        lavender: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          light: '#C4B5FD',
          DEFAULT: '#A78BFA',
          deep: '#7C3AED',
        },
        cyan: {
          light: '#67E8F9',
          DEFAULT: '#06B6D4',
          subtle: '#22D3EE',
          deep: '#0891B2',
        },
        surface: {
          DEFAULT: '#0F172A',
          card: 'rgba(18, 25, 41, 0.75)',
          hover: 'rgba(27, 38, 62, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-focus': 'rgba(167, 139, 250, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-lavender': '0 0 20px -3px rgba(167, 139, 250, 0.25)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
