/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color scheme
        'primary-purple': '#8C00FF',
        'primary-pink': '#FF3F7F',
        'primary-dark': '#450693',
        'neutral-dark': '#423F3E',
        'neutral-light': '#FFFFFF',
      },
    },
  },
  plugins: [],
}
