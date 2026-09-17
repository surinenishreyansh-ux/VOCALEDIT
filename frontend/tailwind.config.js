/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#07080B",
          surface: "#0D0F14",
          card: "#13161F",
          cardHover: "#181C27",
          border: "#232836",
          borderLight: "#2E3547",
          textPrimary: "#F1F5F9",
          textSecondary: "#94A3B8",
          textMuted: "#64748B",
          accent: "#F59E0B",
          accentHover: "#D97706",
          accentGlow: "rgba(245, 158, 11, 0.15)",
          cyan: "#38BDF8",
          cyanGlow: "rgba(56, 189, 248, 0.15)",
          success: "#10B981",
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        studio: '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'glow-accent': '0 0 25px -4px rgba(245, 158, 11, 0.3)',
        'glow-cyan': '0 0 25px -4px rgba(56, 189, 248, 0.3)',
      }
    },
  },
  plugins: [],
}
