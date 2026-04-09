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
        primaryBlue: "#3b82f6",
        darkBg: "#0f172a",
        cardBg: "rgba(30, 41, 59, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
