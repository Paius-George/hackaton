import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  server: {
    proxy: {
      "/dashboard.json": "http://127.0.0.1:8765",
      "/api": "http://127.0.0.1:8765",
      "/tickets": "http://127.0.0.1:8765",
    },
  },
});
