/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2220',      // primary text / dark surface
        body: '#3F4A46',     // secondary body text
        muted: '#5C665F',    // muted labels
        faint: '#939B94',    // faint / meta
        hint: '#AAB1AA',     // inactive icons
        canvas: '#FFFFFF',   // page background
        panel: '#FFFFFF',    // surfaces
        field: '#F3F3F2',    // inputs / chips (neutral)
        dark: '#1C2220',     // dark sidebar / footer
        brand: {
          DEFAULT: '#F2785C', // coral
          dark: '#E15D3F',
        },
        danger: '#DC2626',
        warn: '#D97706',
        ok: '#1C2220',
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
