/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--color-ink-soft) / <alpha-value>)",
        pink: "rgb(var(--color-pink) / <alpha-value>)",
        "pink-deep": "rgb(var(--color-pink-deep) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        "blue-deep": "rgb(var(--color-blue-deep) / <alpha-value>)",
        peach: "rgb(var(--color-peach) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "error-deep": "rgb(var(--color-error-deep) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        overlay: "rgb(var(--color-overlay) / <alpha-value>)",
        "accent-ink": "rgb(var(--color-on-accent) / <alpha-value>)",
      },
      fontFamily: {
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        handwritten: ["Caveat", "cursive"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        sketch: "var(--shadow-sketch)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
