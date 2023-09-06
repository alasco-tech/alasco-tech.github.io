import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import prefetch from "@astrojs/prefetch";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://alasco.tech",
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    prefetch(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],
});
