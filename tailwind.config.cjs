/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": theme("colors.midnight-blue"),
            "--tw-prose-bold": theme("colors.midnight-blue"),
            "--tw-prose-bullets": theme("colors.midnight-blue"),
            "--tw-prose-counters": theme("colors.midnight-blue"),
            "--tw-prose-headings": theme("colors.midnight-blue"),
            "--tw-prose-quotes": theme("colors.midnight-blue"),
            "--code-padding": "0.25rem",
            "--code-border-radius": "0.25rem",
            code: {
              backgroundColor: theme("colors.seashell"),
              color: theme("colors.midnight-blue"),
              fontWeight: 400,
              "border-radius": "var(--code-border-radius)",
            },
            "code::before": {
              content: '""',
              "padding-left": "var(--code-padding)",
            },
            "code::after": {
              content: '""',
              "padding-right": "var(--code-padding)",
            },
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
