import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark Theme Palette
                background: "#0f1115", // Main Background (Deep Charcoal)
                paper: {
                    DEFAULT: "#181b21", // Secondary BG (Card)
                    light: "#22262e",   // Hover State
                    border: "#2a2e37",  // Border Color
                },
                ink: {
                    DEFAULT: "#ededed", // Primary Text (Off-white)
                    soft: "#a1a1aa",    // Secondary Text (Light Gray)
                    muted: "#52525b",   // Muted Text (Dark Gray)
                },
                accent: {
                    DEFAULT: "#ff6b3d", // Signature Orange
                    hover: "#ff8f66",
                    secondary: "#3d7bff", // Electric Blue
                    tertiary: "#10b981",  // Neon Green
                    glow: "rgba(255, 107, 61, 0.15)", // Orange Glow
                },
                line: "#2a2e37", // Separator Line
            },
            fontFamily: {
                serif: ["var(--font-newsreader)", "serif"],
                sans: ["var(--font-space-grotesk)", "sans-serif"],
            },
            borderRadius: {
                xl: "12px",
                "2xl": "16px",
                "3xl": "24px",
            },
            boxShadow: {
                soft: "0 10px 40px -10px rgba(0,0,0,0.5)",
                card: "0 0 0 1px #2a2e37, 0 4px 12px rgba(0,0,0,0.3)",
                glow: "0 0 20px var(--accent-glow)",
            },
            backgroundImage: {
                "dark-gradient": `
          radial-gradient(circle at 15% 15%, rgba(61, 123, 255, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 85% 85%, rgba(255, 107, 61, 0.08) 0%, transparent 40%),
          linear-gradient(180deg, #0f1115 0%, #0a0b0d 100%)
        `,
            },
        },
    },
    plugins: [],
};
export default config;