// Vite solo se usa para desarrollar la interfaz (npm run dev) y compilarla (npm run build).
// En el uso diario, Express sirve client/dist ya compilado.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  plugins: [react()],
  build: { outDir: "dist", emptyOutDir: true },
  server: {
    port: 5173,
    // En desarrollo, /api va al servidor Express (incluido /api/eventos, SSE).
    proxy: { "/api": "http://127.0.0.1:4321" },
  },
});
