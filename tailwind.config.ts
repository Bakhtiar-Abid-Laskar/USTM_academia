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
        // Maintained for backward compatibility with existing admin & utility classes
        primary: {
          DEFAULT: "#1E3A8A",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E3A8A",
          900: "#1E3A6E",
        },
        "text-main": "var(--ink)",
        "text-muted": "var(--ink-muted)",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1280px",
        editorial: "1400px",
      },
      borderRadius: {
        editorial: "12px",
        pill: "9999px",
      },
      boxShadow: {
        fine: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        editorial: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        lift: "0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
      },
      animation: {
        "fade-in": "fadeIn 250ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up": "slideUp 400ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-in": "scaleIn 250ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
        400: "400ms",
        700: "700ms",
      },
    },
  },
  plugins: [],
};

export default config;
