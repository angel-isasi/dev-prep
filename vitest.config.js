// Tests de la propia app (npm test). Los tests de los ejercicios NO pasan por aquí:
// esos los corre el servidor (server/corredor.js) y el validador.
import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    include: ["server/**/*.test.js", "client/src/**/*.test.{js,jsx}"],
    setupFiles: ["server/vitest-setup.js"],
  },
});
