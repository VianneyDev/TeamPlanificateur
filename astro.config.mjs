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
    // Prebundle island deps at startup so Vite does not re-optimize mid-session
    // when MemberSelector (logout gate) first loads Radix/Select - that race
    // 404s stale chunk-*.js and leaves the island unhydrated.
    optimizeDeps: {
      include: [
        "@radix-ui/react-dialog",
        "@radix-ui/react-select",
        "@tanstack/react-query",
        "clsx",
        "lucide-react",
        "radix-ui",
        "sonner",
        "tailwind-merge",
      ],
    },
  },
});
