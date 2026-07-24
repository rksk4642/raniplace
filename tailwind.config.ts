import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'Pretendard', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      colors: {
        background: '#F8FAF9',
        foreground: '#2C3E35',
        ocean: {
          light: '#A0C4E2',
          DEFAULT: '#5B88B2',
        },
        sage: {
          light: '#B8C4A9',
          DEFAULT: '#6E815C',
        },
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(160, 196, 226, 0.1)',
      },
    },
  },
  plugins: [],
};
export default config;
