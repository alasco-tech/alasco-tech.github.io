/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "midnight-blue",
            "--tw-prose-bold": "midnight-blue",
            "--tw-prose-bullets": "midnight-blue",
            "--tw-prose-counters": "midnight-blue",
            "--tw-prose-headings": "midnight-blue",
            "--tw-prose-quotes": "midnight-blue",
          },
        },
      }),
    },
    colors: {
      "midnight-blue": "#004466",
      "bright-teal": "#11CDD4",
      pistacio: "#AEFF9C",
      "pine-green": "#006666",
      "bright-yellow": "#FFFA39",
      lavender: "#A5AAFF",
      "powder-blue": "#A1E6E6",
      oat: "#FFF2DD",
      white: "#FFFFFF",
      "poppy-red": "#BF280B",
      seashell: "#E4E3E3",
    },
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      headers: ["Space Grotesk", "sans-serif"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
