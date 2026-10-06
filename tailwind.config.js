/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        stage: 'var(--stage)',
        line: 'var(--line)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        sage: {
          1: 'var(--sage-1)',
          2: 'var(--sage-2)',
          3: 'var(--sage-3)',
          DEFAULT: 'var(--sage-2)',
        },
        risk: {
          amber: 'var(--risk-amber)',
          red: 'var(--risk-red)',
          live: 'var(--live)',
          mint: 'var(--live)',
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        'stage': '32px',
        'panel': '24px',
        'pill': '999px',
      },
      boxShadow: {
        'stage-frame': '0 30px 80px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        'glass-panel': '0 16px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.06)',
        'pill-nav': '0 12px 35px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
