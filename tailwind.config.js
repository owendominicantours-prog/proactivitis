/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1d3b6c",
          light: "#2f5c9d",
          soft: "#8fb8d7"
        },
        accent: "#22c1c3"
      },
      boxShadow: {
        card: "0 20px 45px rgba(13, 40, 73, 0.15)",
        glass: "0 15px 35px rgba(255, 255, 255, 0.3)"
      },
      fontFamily: {
        slate: ["Slate", "Inter", "sans-serif"],
        "dm-sans": ["'DM Sans'", "Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};
