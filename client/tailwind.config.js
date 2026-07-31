/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        custom: "2px 6px 10px rgba(10,10,10,0.3)",
      },
    },
    screens: {
      // media (max-width: 1279px)
      lg: { min: "925px" },
    },
  },
  plugins: [],
};
