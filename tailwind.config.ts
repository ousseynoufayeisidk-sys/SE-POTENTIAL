import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        baobab: '#0E6B4F',
        nuit: '#14212B',
        brume: '#F5F7F6',
        ocean: '#1D5C8A',
        soleil: '#E8A317',
        alerte: '#B3261E',
        'band-eleve': '#0E6B4F',
        'band-interessant': '#1D5C8A',
        'band-consolider': '#B7791F',
        'band-insuffisant': '#5B6B78',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      maxWidth: {
        measure: '66ch',
      },
    },
  },
  plugins: [],
}
export default config
