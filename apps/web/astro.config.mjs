// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // Prebundle island client deps at startup. Astro loads islands dynamically,
    // so Vite cannot discover these imports during the initial dep crawl and
    // would otherwise re-optimize mid-session (stale chunk 404s, failed hydration).
    optimizeDeps: {
      include: [
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@tanstack/react-query",
        "@vianneytraina/ui",
        "clsx",
        "lucide-react",
        "radix-ui",
        "sonner",
        "tailwind-merge",
      ],
    },
  },
});
