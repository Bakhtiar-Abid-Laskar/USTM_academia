import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Direct palette tokens as requested
        brand: {
          bg: "#EFF6FF",
          "bg-secondary": "#F8FBFF",
          "bg-card": "#FFFFFF",
          primary: "#1D4ED8",
          secondary: "#2563EB",
          navy: "#172554",
          light: "#DBEAFE",
          border: "#DCE6F1",
          text: "#172B4D",
          muted: "#64748B",
          faint: "#94A3B8",
        },
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          faint: "var(--ink-faint)",
        },
        paper: "var(--paper)",
        surface: {
          DEFAULT: "var(--surface)",
          subtle: "var(--surface-subtle)",
          raised: "var(--surface-raised)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        accent: {
          gold: "var(--accent-gold)",
          "gold-bg": "var(--accent-gold-bg)",
          crimson: "var(--accent-crimson)",
          "crimson-bg": "var(--accent-crimson-bg)",
          navy: "var(--accent-navy)",
          "navy-subtle": "var(--accent-navy-subtle)",
        },
        // Maintained for backward compatibility with existing components
        primary: {
          DEFAULT: "#1D4ED8",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E3A8A",
          900: "#172554",
        },
        "text-main": "var(--ink)",
        "text-muted": "var(--ink-muted)",
        success: "#16A34A",
        warning: "#EA580C",
        error: "#EF4444",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        heading: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1280px",
        editorial: "1360px",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        fine: "0 1px 2px 0 rgba(23, 37, 84, 0.05)",
        card: "0 1px 3px 0 rgba(23, 37, 84, 0.06), 0 1px 2px -1px rgba(23, 37, 84, 0.04)",
        lift: "0 8px 24px -4px rgba(23, 37, 84, 0.08), 0 2px 6px -1px rgba(23, 37, 84, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up": "slideUp 300ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scaleIn 200ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
