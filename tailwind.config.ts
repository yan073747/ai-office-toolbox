import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        muted: "#667085",
        line: "#E4E7EC",
        soft: "#F6F7F9",
        brand: "#2563EB"
      },
      boxShadow: {
        card: "0 12px 30px rgba(16, 24, 40, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
