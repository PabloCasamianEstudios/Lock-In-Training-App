/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: 'var(--main-color)',
        secondary: 'var(--secondary-color)',
        back: 'var(--background)',
        'back-secondary': 'var(--secondary-back)',
        'text-main': 'var(--text)',
        'text-secondary': 'var(--secondary-text)',
        alert: 'var(--alert-txt)',
        error: 'var(--error-text)',
        good: 'var(--good)',
        bad: 'var(--bad)',
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
