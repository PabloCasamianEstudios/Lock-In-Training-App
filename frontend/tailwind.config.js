export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: 'var(--main-color)',
        'main-rgb': 'var(--main-color-rgb)',
        secondary: 'var(--secondary-color)',
        'secondary-rgb': 'var(--secondary-color-rgb)',
        'text-main': 'var(--text)',
        'text-secondary': 'var(--secondary-text)',
        surface: 'var(--surface)',
        'neutral-black': 'var(--neutral-black)',
        'neutral-white': 'var(--neutral-white)',
        border: 'var(--border)',
        alert: 'var(--alert-txt)',
        error: 'var(--error-text)',
        good: 'var(--good)',
        bad: 'var(--bad)',
        'overlay-bg': 'var(--overlay-bg)',
      },
      fontFamily: {
        console: ['"JetBrains Mono"', 'monospace'],
        rpg: ['"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 5px var(--main-color), 0 0 20px var(--main-glow)',
      }
    },
  },
  plugins: [],
}
