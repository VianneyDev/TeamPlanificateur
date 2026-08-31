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
  // Cloud Run terminates TLS in front of the container. Without this, Astro
  // ignores the public Host and CSRF compares Origin: https://*.run.app to
  // localhost on form POSTs such as logout.
  // Hostname only: Astro 5.17.2 drops X-Forwarded-Proto when the pattern also
  // sets protocol (https://github.com/withastro/astro/issues/15559).
  security: {
    allowedDomains: [{ hostname: "**.run.app" }],
  },
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
