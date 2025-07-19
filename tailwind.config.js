// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pastel: {
          50: "#fdfdfe",
          100: "#fef6fb",
          200: "#fdeef6",
          300: "#fbddea",
          400: "#f9c7d8",
        },
      },
    },
  },
  plugins: [],
};
