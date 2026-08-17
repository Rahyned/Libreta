/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdfbf7",
        ink: "#4a3728",
        "ink-soft": "#8b7355",
        pink: "#d4a5a5",
        "pink-deep": "#c78f8f",
        blue: "#a8d5d5",
        "blue-deep": "#8fbdbd",
        peach: "#ffe4d4",
        line: "#e8dcc8",
        error: "#d88888",
        success: "#a8d0a8",
      },
      fontFamily: {
        body: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "system-ui", "sans-serif"],
        handwritten: ["Caveat", "cursive"],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(74,55,40,0.08)",
        md: "0 4px 12px rgba(74,55,40,0.12)",
        sketch: "3px 3px 0 rgba(74,55,40,0.12)",
      },
      borderRadius: {
        card: "16px",
      },
    },
  },
  plugins: [],
};
