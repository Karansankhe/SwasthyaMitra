/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141615',      // primary text
        body: '#3D423F',     // secondary body text
        muted: '#5E6460',    // muted labels
        faint: '#8F9591',    // faint / meta
        hint: '#AEB3AF',     // inactive icons
        canvas: '#FFFFFF',   // page background
        panel: '#FFFFFF',    // surfaces
        field: '#F1F2F1',    // inputs / chips (neutral)
        dark: '#111312',     // near-black surfaces
        // Driven by CSS variables so a subtree can re-theme (see .theme-glass in
        // index.css / .theme-studio): teal on the landing page and inside the app.
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          light: 'rgb(var(--brand-light) / <alpha-value>)',
        },
        navy: '#15201F', // app headings / dark accents (matches the landing ink)
        danger: '#DC2626',
        warn: '#D97706',
        ok: '#2F7A4F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
