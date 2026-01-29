import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode color palette
        dark: {
          bg: '#0f172a',        // Main background
          surface: '#1e293b',   // Card/surface background
          border: '#334155',    // Borders
          hover: '#475569',     // Hover states
        },
        primary: {
          DEFAULT: '#3b82f6',   // Blue
          hover: '#2563eb',
          light: '#60a5fa',
        },
        secondary: {
          DEFAULT: '#8b5cf6',   // Purple
          hover: '#7c3aed',
          light: '#a78bfa',
        },
        success: {
          DEFAULT: '#10b981',   // Green
          hover: '#059669',
          light: '#34d399',
        },
        warning: {
          DEFAULT: '#f59e0b',   // Amber
          hover: '#d97706',
          light: '#fbbf24',
        },
        danger: {
          DEFAULT: '#ef4444',   // Red
          hover: '#dc2626',
          light: '#f87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

// Made with Bob
