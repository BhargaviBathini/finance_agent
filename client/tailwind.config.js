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
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#030712',
        },
        cyber: {
          purple: '#a855f7',
          emerald: '#10b981',
          cyan: '#06b6d4',
          pink: '#ec4899',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow-indigo': '0 0 20px 2px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 20px 2px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 20px 2px rgba(6, 182, 212, 0.25)',
        'glow-purple': '0 0 20px 2px rgba(168, 85, 247, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'aurora-slow': 'aurora 20s infinite alternate',
        'aurora-fast': 'aurora 10s infinite alternate',
        'laser-sweep': 'laser 2.5s infinite linear',
        'float-slow': 'float 6s ease-in-out infinite',
        'shimmer-fast': 'shimmer 1.5s infinite linear',
      },
      keyframes: {
        aurora: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        laser: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Custom CSS classes used in the project
    'input-field',
    'btn-primary',
    'btn-secondary',
    'card',
    'bottom-nav-item',
    'no-scrollbar',
    'glass-panel',
    'glass-card',
    'glass-input',
    'aurora-bg',
  ],
}
