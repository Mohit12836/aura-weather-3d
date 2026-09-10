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
        weather: {
          sunny: {
            from: '#f59e0b',
            to: '#ea580c',
            glow: 'rgba(245, 158, 11, 0.4)'
          },
          night: {
            from: '#0f172a',
            to: '#1e1b4b',
            glow: 'rgba(99, 102, 241, 0.3)'
          },
          rainy: {
            from: '#0284c7',
            to: '#0369a1',
            glow: 'rgba(14, 165, 233, 0.35)'
          },
          thunder: {
            from: '#4338ca',
            to: '#312e81',
            glow: 'rgba(168, 85, 247, 0.4)'
          },
          snow: {
            from: '#38bdf8',
            to: '#64748b',
            glow: 'rgba(56, 189, 248, 0.3)'
          },
          cloudy: {
            from: '#475569',
            to: '#334155',
            glow: 'rgba(148, 163, 184, 0.25)'
          }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
