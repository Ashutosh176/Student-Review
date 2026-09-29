import type { Config } from 'tailwindcss';

// Design tokens extracted from the provided Figma reference
// (docs/figma-reference.html :root custom properties).
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161F',
        sub: '#6B7078',
        line: '#E3E5EC',
        surface: '#F6F7F8',
        brand: {
          DEFAULT: '#2A3B7C',
          dark: '#1B2757',
          deep: '#161B33',
          light: '#EEF0FA',
        },
        success: { DEFAULT: '#187A52', bg: '#E7F5EE' },
        warning: { DEFAULT: '#A9660A', bg: '#FCF1DE' },
        danger: { DEFAULT: '#B23A34', bg: '#FBEAE8' },
        info: { DEFAULT: '#2F5FD1', bg: '#EAF0FD' },
        trending: { DEFAULT: '#B8541C', bg: '#FDEFE6' },
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      // Tailwind 3's default scale stops its half-steps at 3.5; the Figma
      // spacing uses 18px (mb-4.5, gap-4.5, the toggle knob's h/w-4.5), which
      // were silently generating no CSS without this.
      spacing: {
        4.5: '1.125rem',
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,32,.06), 0 1px 1px rgba(16,24,32,.04)',
      },
    },
  },
  plugins: [],
} satisfies Config;
