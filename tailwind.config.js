/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syne:   ["Syne", "sans-serif"],
        dm:     ["DM Sans", "sans-serif"],
      },
      colors: {
        navy: {
          900: "#080d1a",
          800: "#0a0f1e",
          700: "#0d1526",
          600: "#0f172a",
          500: "#111827",
        },
      },
      animation: {
        "fade-in":     "fadeIn 0.4s ease forwards",
        "slide-up":    "slideUp 0.4s ease forwards",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
