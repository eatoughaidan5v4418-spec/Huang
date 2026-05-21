import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18211c",
        leaf: "#2f7d58",
        mint: "#dff4e8",
        citrus: "#f2bd42",
        tomato: "#e85c4a",
        oat: "#f7f1e6"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(24, 33, 28, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
