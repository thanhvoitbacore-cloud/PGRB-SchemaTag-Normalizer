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
        background: "#0f172a",
        foreground: "#f8fafc",
        card: "rgba(30, 41, 59, 0.7)",
        accent: "#22d3ee",
        success: "#10b981",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
