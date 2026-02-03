import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      filename: "manifest.webmanifest",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Spotify",
        short_name: "Spotify",
        description: "Spotify clone",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#1DB954",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
    // ← qui puoi aggiungere dopo componentTagger() o altri plugin se li usi
    // componentTagger(),   // ← decommenta se lo vuoi attivare
  ],

  // resolve: {
  //   alias: {
  //     "@": path.resolve(__dirname, "./src"),
  //   },
  // },

  // altre configurazioni se servono...
}));
