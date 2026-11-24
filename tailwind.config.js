/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        muted: "#78828d",
        line: "#e9edf0",
        canvas: "#f6f7f8",
        brand: "#168c74",
        "brand-dark": "#0b765f"
      },
      boxShadow: {
        panel: "0 10px 40px rgba(27, 44, 54, 0.06)"
      }
    }
  },
  plugins: []
};
