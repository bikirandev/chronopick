/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // For the demo app
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all component files
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Example: Adding Inter font
      },
    },
  },
  plugins: [],
}
