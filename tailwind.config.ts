import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium Paper Concept Palette
                paper: {
                    DEFAULT: "#f6f1ea",
                    light: "#fffdfa",
                },
                ink: {
                    DEFAULT: "#121417",
                    soft: "#2b2f3a",
                    muted: "#6b7280",
                },
                accent: {
                    DEFAULT: "#ff6b3d", // Orange (Primary)
                    hover: "#e55a2b",
                    secondary: "#3d7bff", // Blue (Secondary)
                    tertiary: "#13b886", // Green (Success/Growth)
                },
                line: "#e6dfd5",
            },
            fontFamily: {
                serif: ["var(--font-newsreader)", "serif"], // Headings
                sans: ["var(--font-space-grotesk)", "sans-serif"], // Body/UI
            },
            borderRadius: {
                xl: "12px",
                "2xl": "16px",
                "3xl": "20px", // SENTINEL Signature Radius
            },
            boxShadow: {
                soft: "0 20px 50px rgba(18, 20, 23, 0.14)",
                card: "0 4px 20px rgba(18, 20, 23, 0.06)",
            },
            backgroundImage: {
                "paper-gradient": `
          radial-gradient(circle at 20% 20%, #fff1df 0%, transparent 55%),
          radial-gradient(circle at 80% 0%, #e7efff 0%, transparent 52%),
          linear-gradient(180deg, #f8f3ea 0%, #efe8dd 100%)
        `,
            },
        },
    },
    plugins: [],
};
export default config;