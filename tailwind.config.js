/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
  "./src/pages/**/*.{js,ts,jsx,tsx}",
  "./src/components/**/*.{js,ts,jsx,tsx}",
  "./src/app/**/*.{js,ts,jsx,tsx}",
],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#4F46E5",
        accent: "#06B6D4",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        dark: "#111827",
        light: "#6B7280",
        textPrimary: "#111827",
        textSecondary: "#6B7280",
        borders: "#E5E7EB",
      },
    },
  },
  plugins: [],
}
