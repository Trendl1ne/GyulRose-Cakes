import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://gyulrosecakes.com",
  output: "static",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/owner-upload/") && !page.endsWith("/home-motion-test/") })],
  build: {
    format: "directory"
  }
});
