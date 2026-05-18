/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-green': '#1f2a1d',
        'medium-dark-green': '#2d3a2a',
        'button-hover': '#2a3827',
        'body-text-green': '#4b5b47',
        'heading-primary': '#336443',
        'heading-accent': '#85AB8B',
        'bottom-left-text': '#3d5638',
        'bottom-left-button-bg': '#3d5638',
        'bottom-left-button-hover': '#2d4228',
      },
    },
  },
  plugins: [],
}
