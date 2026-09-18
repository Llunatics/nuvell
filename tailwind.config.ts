import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderColor: {
        DEFAULT: 'var(--border-subtle)',
        subtle: 'var(--border-subtle)',
        medium: 'var(--border-medium)',
        bold: 'var(--border-bold)',
      },
      colors: {
        background: 'rgb(var(--bg-rgb) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised-rgb) / <alpha-value>)',
          sunken: 'rgb(var(--surface-sunken-rgb) / <alpha-value>)',
          overlay: 'rgb(var(--surface-overlay-rgb) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'var(--border-subtle)',
          subtle: 'var(--border-subtle)',
          medium: 'var(--border-medium)',
          bold: 'var(--border-bold)',
        },
        gold: {
          50: '#FDFBF5',
          100: '#FAF5E6',
          200: '#F4E9C7',
          300: '#EBD99F',
          400: '#DFC26F',
          DEFAULT: 'rgb(var(--gold-rgb, 197 160 89) / <alpha-value>)',
          600: '#A9843F',
          700: '#86652C',
          800: '#644921',
          900: '#473318',
        },
        burgundy: {
          50: '#FAF2F4',
          100: '#F4E3E7',
          200: '#E8C5CE',
          300: '#D79EAC',
          400: '#BE6D82',
          DEFAULT: 'rgb(var(--burgundy-rgb, 139 38 62) / <alpha-value>)',
          600: '#751E33',
          700: '#5C1627',
          800: '#43101C',
          900: '#2F0B13',
        },
        editorial: {
          title: 'var(--editorial-title)',
          body: 'var(--editorial-body)',
          muted: 'var(--editorial-muted)',
          faint: 'var(--editorial-faint)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.18)',
        'glow-gold': '0 0 24px -4px rgba(197, 160, 89, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
