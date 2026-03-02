/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:  '#FE9920',
        gold2: '#FFAD47',
        gold3: '#FFCA7A',
        bg:    '#0F0E0E',
        bg2:   '#141313',
        bg3:   '#1A1918',
        bg4:   '#221F1E',
        tx:    '#F0EFE8',
        tx2:   '#9B9A9F',
        tx3:   '#5A5960',
        green: '#22C55E',
        red:   '#EF4444',
        orange:'#F97316',
        yellow:'#EAB308',
        blue:  '#3B82F6',
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        sm:   '10px',
      },
      keyframes: {
        shimmer: {
          '0%,40%': { left: '-75%' },
          '100%':   { left: '130%' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        slideUp: {
          from: { transform: 'translateY(50px)', opacity: '0' },
        },
      },
      animation: {
        shimmer:  'shimmer 2.5s ease-in-out infinite',
        'spin-fast': 'spin 0.7s linear infinite',
        slideUp: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      },
    },
  },
  plugins: [],
}
