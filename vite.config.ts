import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { readFileSync } from "node:fs";

const httpsOptions = {
  key: readFileSync("./certs/local-key.pem"),
  cert: readFileSync("./certs/local-cert.pem"),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "Spevnik",
        short_name: "Spevnik",
        description: "Spevnik s piesnami, akordami a projektorovym zobrazenim",
        theme_color: "#111827",
        background_color: "#111827",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "pwa/icon-any-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa/icon-any-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"],
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    port: 5179,
    strictPort: true,
    host: "0.0.0.0",
    https: httpsOptions,

    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5179,
    strictPort: true,
    https: httpsOptions,

    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});
