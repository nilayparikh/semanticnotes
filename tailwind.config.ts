import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#131313",
        "surface-dim": "#131313",
        "surface-bright": "#3a3939",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-low": "#1c1b1b",
        "surface-container": "#201f1f",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353534",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#b9cacb",
        primary: "#dbfcff",
        "primary-container": "#00f0ff",
        "on-primary": "#00363a",
        "on-primary-container": "#006970",
        secondary: "#4edea3",
        "secondary-container": "#00a572",
        "on-secondary": "#003824",
        "on-secondary-container": "#00311f",
        background: "#131313",
        "on-background": "#e5e2e1",
      },
      fontFamily: {
        geist: ["Geist", "sans-serif"],
        jetbrains: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        gutter: "16px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
      },
    },
  },
};
