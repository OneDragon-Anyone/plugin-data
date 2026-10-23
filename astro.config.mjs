import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://your-org.github.io",
  base: "/plugin-registry",
  output: "static",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false
    })
  ],
  vite: {
    define: {
      "import.meta.env.PUBLIC_GITHUB_OWNER": JSON.stringify(process.env.PUBLIC_GITHUB_OWNER ?? "your-org"),
      "import.meta.env.PUBLIC_GITHUB_REPO": JSON.stringify(process.env.PUBLIC_GITHUB_REPO ?? "plugin-registry")
    }
  }
});
