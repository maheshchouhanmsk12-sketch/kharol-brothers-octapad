/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00e5ff',
          blue: '#3b82f6',
          purple: '#a855f7',
          magenta: '#ec4899',
          orange: '#ff6b00',
          amber: '#f59e0b',
          navy: '#070913',
          dark: '#0a0d1d',
        },
        devotional: {
          dark: '#0c080b',
          surface: '#150f14',
          card: '#1e141c',
          border: '#38222d',
          gold: '#e5a93b',
          'gold-light': '#fbd278',
          'gold-dark': '#a67215',
          saffron: '#ff7700',
          'saffron-light': '#ff9f43',
          'saffron-dark': '#cc5500',
          vermilion: '#d9381e',
          copper: '#c86432',
          brass: '#d4af37',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'Merriweather', 'serif'],
        devanagari: ['Rozha One', 'Yatra One', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
        script: ['"Kaushan Script"', '"Caveat"', 'cursive'],
        orbitron: ['"Orbitron"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -3px rgba(229, 169, 59, 0.45)',
        'glow-saffron': '0 0 25px -3px rgba(255, 119, 0, 0.45)',
        'pad-struck': '0 0 35px 8px rgba(251, 210, 120, 0.65), inset 0 0 20px rgba(255, 159, 67, 0.4)',
        'temple': '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px 2px rgba(229, 169, 59, 0.15)',
      },
      keyframes: {
        strike: {
          '0%': { transform: 'scale(0.97)', filter: 'brightness(1.5)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        pulseAura: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        strike: 'strike 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        'pulse-aura': 'pulseAura 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
