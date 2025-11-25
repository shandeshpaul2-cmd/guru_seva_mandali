import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        temple: {
          maroon: '#8B0000',
          gold: '#DAA520',
          cream: '#FFF8DC',
          orange: '#FF8C42',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter: ['Inter', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(218, 165, 32, 0.5)' },
          to: { boxShadow: '0 0 30px rgba(218, 165, 32, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
