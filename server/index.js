// Punto de entrada: npm start
import { config } from "./config.js";
import { crearIndice } from "./contenido.js";
import { crearWorkspace } from "./workspace.js";
import { crearEventos } from "./eventos.js";
import { crearCorredor } from "./corredor.js";
import { crearProgreso } from "./progreso.js";
import { cargarEntrevistas } from "./entrevistas.js";
import { crearMisRespuestas } from "./mis-respuestas.js";
import { exec } from "node:child_process";
import { abrirEnVSCode } from "./vscode.js";
import { crearApp } from "./app.js";

const indice = await crearIndice(config.contenidoDir);
for (const error of indice.errores) console.warn(`[contenido] ${error}`);

const workspace = crearWorkspace({ workspaceDir: config.workspaceDir });
const eventos = crearEventos();
const progreso = await crearProgreso({ datosDir: config.datosDir });
const entrevistas = await cargarEntrevistas(config.contenidoDir);
const misRespuestas = await crearMisRespuestas({ datosDir: config.datosDir });

const corredor = await crearCorredor({
  workspace,
  alEmpezar: (ids) => eventos.emitir("corriendo", { ids }),
  alResultado: async (id, resultado, info) => {
    if (!indice.porId.has(id)) return; // carpeta ajena en workspace/
    const { registro, resueltoAhora, repasoCompletado } = await progreso.registrarResultado(id, resultado, info);
    eventos.emitir("resultado", { id, resultado, progreso: registro, resueltoAhora, repasoCompletado });
  },
});

const vscode = config.abrirVSCode ? abrirEnVSCode : async () => {};
const app = crearApp({
  indice,
  workspace,
  corredor,
  eventos,
  progreso,
  entrevistas,
  misRespuestas,
  vscode,
  clienteDir: config.clienteDir,
});

const url = `http://localhost:${config.puerto}`;
const servidor = app.listen(config.puerto, config.host, () => {
  console.log(`dev-prep listo en ${url} (${indice.ejercicios.length} ejercicios)`);
  console.log("Deja esta ventana abierta mientras practicas. Para cerrar la app: Ctrl + C.");
  // iniciar.bat pide abrir el navegador; con npm start no se abre solo.
  if (process.env.DEVPREP_ABRIR_NAVEGADOR === "1" && process.platform === "win32") exec(`start "" ${url}`);
});

servidor.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${config.puerto} está ocupado. ¿Ya tienes dev-prep abierto en otra ventana?`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

// Al cerrar con Ctrl + C, apaga Vitest ordenadamente.
process.on("SIGINT", async () => {
  servidor.close();
  await corredor.cerrar().catch(() => {});
  process.exit(0);
});
