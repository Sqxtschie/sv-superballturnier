/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tournament: {
          purple: '#8B7BB8',
          'purple-dark': '#6B5B98',
          'purple-light': '#AB9BC8',
          yellow: '#F4D03F',
        },
      },
    },
  },
  plugins: [],
}
