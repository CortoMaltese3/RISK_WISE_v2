import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        // Vite bundles everything (React, MUI, Chart.js, Leaflet, i18n, etc) into one giant file
        // at build/assets/index-DkvfLIxn.js. With manualChunks it splits vendors by domain to
        // gain faster initial load, better caching and parallel loading.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
          if (id.includes("@mui") || id.includes("@emotion")) return "vendor-mui";
          if (
            id.includes("chart.js") ||
            id.includes("react-chartjs-2") ||
            id.includes("chartjs-adapter")
          )
            return "vendor-chart";
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "vendor-leaflet";
          if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n";
          return "vendor";
        },
      },
    },
    // optional: only if you want to silence the warning without changing code-splitting
    // chunkSizeWarningLimit: 1200
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
