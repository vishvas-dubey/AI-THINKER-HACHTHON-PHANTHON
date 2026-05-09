/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#ededed",
        primary: {
          DEFAULT: "#3b82f6",
          glow: "rgba(59, 130, 246, 0.5)",
        },
        alert: {
          DEFAULT: "#ef4444",
          glow: "rgba(239, 68, 68, 0.5)",
        },
        success: "#22c55e",
        panel: {
          bg: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.08)",
        },
      },
    },
  },
  plugins: [],
};
