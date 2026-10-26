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
        sidebar: 'var(--sidebar)',
        line: 'var(--line)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        caption: 'var(--caption)',
        brand: {
          orange: '#FF6A2B',
          deep: '#FF4D1A',
          DEFAULT: '#FF6A2B',
          glow: 'rgba(255, 106, 43, 0.25)',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--card-border)',
        },
        risk: {
          red: '#E5484D',
          amber: '#F5C04A',
          yellow: '#F5C04A',
          green: '#4ADE9A',
          live: '#4ADE9A',
          mint: '#4ADE9A',
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SF Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        'card': '16px',
        'item': '12px',
        'pill': '999px',
        'stage': '24px',
        'panel': '16px',
      },
      boxShadow: {
        'brand': '0 4px 20px rgba(255, 106, 43, 0.35)',
        'brand-glow': '0 0 25px rgba(255, 106, 43, 0.45)',
        'card': '0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        'dropdown': '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
