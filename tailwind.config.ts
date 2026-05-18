import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
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
        surface: "#FFFFFF",
        background: "#F8FAFC",
        border: "#E2E8F0",
        "text-main": "#0F172A",
        "text-muted": "#64748B",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "1200px",
      },
      // ✅ ANIMATIONS: Add performant animation utilities
      animation: {
        "fade-in": "fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-up": "slideUp 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-left": "slideInLeft 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "slide-in-right": "slideInRight 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "scale-in": "scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      // ✅ PERFORMANCE: Transition utilities for smooth interactions
      transitionDuration: {
        250: "250ms",
      },
    },
  },
  plugins: [],
};
export default config;
