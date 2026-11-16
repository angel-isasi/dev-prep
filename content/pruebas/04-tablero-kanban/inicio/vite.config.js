// Configuración para verlo en el navegador (npx vite) y correr los tests desde esta carpeta (npx vitest).
// Usa las dependencias de dev-prep: no hace falta instalar nada.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { globals: true },
});
