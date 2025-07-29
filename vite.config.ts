import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 5173,
    watch: {
      usePolling: true, // Use polling for file watching in Docker
      interval: 50, // More frequent polling
    },
    hmr: {
      port: 5173, // HMR over same port
      host: "localhost", // HMR host
    },
  },
  optimizeDeps: {
    exclude: ["@vitejs/plugin-react"],
  },
});
