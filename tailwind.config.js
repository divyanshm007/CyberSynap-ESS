/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plasma: {
          DEFAULT: '#4F8EF7',
          light: '#3B74E8',
          soft: 'rgba(79,142,247,0.12)',
        },
        aurora: {
          DEFAULT: '#36C9BE',
          light: '#28B8AE',
          soft: 'rgba(54,201,190,0.10)',
        },
        void: {
          DEFAULT: '#090C14',
          light: '#F2F5FD',
        },
        nebula: {
          DEFAULT: '#111520',
          light: '#FFFFFF',
        },
        slate: {
          csm: '#181E2E',
          light: '#EAEeF8',
        },
        wire: {
          DEFAULT: '#1F2840',
          light: '#D5DBed',
        },
        chalk: {
          DEFAULT: '#DDE4F5',
          light: '#090C14',
        },
        fog: {
          DEFAULT: '#6B7594',
          light: '#52607F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 4px 16px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.08)',
        lg: '0 8px 32px rgba(0,0,0,0.12)',
        plasma: '0 0 24px rgba(79,142,247,0.20)',
        aurora: '0 0 24px rgba(54,201,190,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
