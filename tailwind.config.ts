import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-space-grotesk)'],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        attribute: {
          health: "#ef4444", // Red
          friends: "#f97316", // Orange
          family: "#eab308", // Yellow
          money: "#84cc16", // Lime
          career: "#10b981", // Emerald
          spirituality: "#8b5cf6", // Violet
          development: "#3b82f6", // Blue
          brightness: "#ec4899", // Pink
        }
      },
    },
  },
  plugins: [],
}

export default config
