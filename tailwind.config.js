/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Note: For Tailwind v4, dark mode is handled via the @custom-variant in CSS
  // The darkMode config may not be needed, but including for compatibility
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
