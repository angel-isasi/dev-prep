// npm run dev: servidor Express (se reinicia al cambiar server/) + Vite con recarga en caliente.
// Abre http://localhost:5173 mientras desarrollas la app.
import { spawn } from "node:child_process";

const procesos = [
  spawn("node --watch-path=server server/index.js", { shell: true, stdio: "inherit" }),
  spawn("npx vite", { shell: true, stdio: "inherit" }),
];

const cerrar = () => procesos.forEach((p) => p.kill());
process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
procesos.forEach((p) => p.on("exit", cerrar));
