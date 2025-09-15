/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Ensure custom CSS classes are not purged
  safelist: [
    {
      pattern: /^ad-card/,
    },
    {
      pattern: /^ads-page/,
    },
    {
      pattern: /^sort-bar/,
    }
  ],
}
