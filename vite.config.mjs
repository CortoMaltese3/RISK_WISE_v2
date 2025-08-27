import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "build",
    emptyOutDir: true,
    sourcemap: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          // Group React + Emotion + MUI together to avoid init order issues
          if (
            id.includes("react") ||
            id.includes("scheduler") ||
            id.includes("@emotion") ||
            id.includes("@mui")
          ) {
            return "vendor-ui";
          }

          if (id.includes("chart.js") || id.includes("react-chartjs-2") || id.includes("chartjs-adapter"))
            return "vendor-chart";

          if (id.includes("leaflet") || id.includes("react-leaflet"))
            return "vendor-leaflet";

          if (id.includes("i18next") || id.includes("react-i18next"))
            return "vendor-i18n";

          return "vendor";
        }
      }
    }
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    // Ensure single instances at runtime
    dedupe: [
      "react",
      "react-dom",
    ]
  },
  // Prebundle these to stabilize dependency graphs
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@mui/material",
      "@mui/icons-material"
    ]
  }
});
