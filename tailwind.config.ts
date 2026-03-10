import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
      },
      boxShadow: {
        card: '0 16px 60px rgba(15, 23, 42, 0.12)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
} satisfies Config
