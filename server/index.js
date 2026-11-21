// Punto de entrada: npm start
import { config } from "./config.js";
import { crearIndice } from "./contenido.js";
import { crearWorkspace } from "./workspace.js";
import { crearEventos } from "./eventos.js";
import { crearCorredor } from "./corredor.js";
import { crearProgreso } from "./progreso.js";
import { cargarEntrevistas } from "./entrevistas.js";
import { crearMisRespuestas } from "./mis-respuestas.js";
import { crearSync } from "./sync.js";
import { cargarReferencia, cargarTemas } from "./aprender.js";
import { exec } from "node:child_process";
import { abrirEnVSCode } from "./vscode.js";
import { crearApp } from "./app.js";
import { crearVigilante, PROCESOS_POR_DEFECTO } from "./juego-vigilante.js";
import { crearUsoLaptop } from "./uso-laptop.js";
import { crearVoz } from "./voz.js";
import { estadoGeneral } from "./vistas-progreso.js";
import { fechaLocal } from "./fechas.js";
import { vivos } from "./combinar.js";

const indice = await crearIndice(config.contenidoDir);
for (const error of indice.errores) console.warn(`[contenido] ${error}`);

const workspace = crearWorkspace({ workspaceDir: config.workspaceDir });
const eventos = crearEventos();
const progreso = await crearProgreso({ datosDir: config.datosDir });
const entrevistas = await cargarEntrevistas(config.contenidoDir);
const misRespuestas = await crearMisRespuestas({ datosDir: config.datosDir });
// Sincronización con el celular por AWS (solo si existe data/sync.json; si no, no hace nada).
const sync = await crearSync({ datosDir: config.datosDir, progreso, misRespuestas });
const aprender = await cargarTemas(config.contenidoDir);
const referencia = await cargarReferencia(config.contenidoDir);
for (const error of [...aprender.errores, ...referencia.errores]) console.warn(`[contenido] ${error}`);

/** Inicio y Progreso comparten esto (también lo usa el vigilante del juego). */
const estado = () => estadoGeneral({ ejercicios: indice.ejercicios, datos: progreso.datos(), dias: progreso.dias(), hoy: fechaLocal() });

const corredor = await crearCorredor({
  workspace,
  alEmpezar: (ids) => eventos.emitir("corriendo", { ids }),
  alResultado: async (id, resultado, info) => {
    if (!indice.porId.has(id)) return; // carpeta ajena en workspace/
    // ¿Era el jefe de la semana? (se calcula antes de registrar, cuando todavía no estaba resuelto)
    const jefe = estado().jefe;
    const { registro, resueltoAhora, repasoCompletado } = await progreso.registrarResultado(id, resultado, info);
    if (resueltoAhora && jefe?.id === id) await progreso.sumarDia("jefes");
    eventos.emitir("resultado", { id, resultado, progreso: registro, resueltoAhora, repasoCompletado });
  },
});

const vscode = config.abrirVSCode ? abrirEnVSCode : async () => {};
const usoLaptop = crearUsoLaptop({ datosDir: config.datosDir });
const app = crearApp({
  indice,
  workspace,
  corredor,
  eventos,
  progreso,
  entrevistas,
  misRespuestas,
  sync,
  aprender,
  referencia,
  vscode,
  config,
  clienteDir: config.clienteDir,
  usoLaptop,
  voz: crearVoz({ datosDir: config.datosDir }),
  alApagar: () => apagar(),
});

const url = `http://localhost:${config.puerto}`;
const servidor = app.listen(config.puerto, config.host, () => {
  console.log(`dev-prep listo en ${url} (${indice.ejercicios.length} ejercicios)`);
  console.log("Deja esta ventana abierta mientras practicas. Para cerrar la app: Ctrl + C.");
  // iniciar.bat pide abrir el navegador; con npm start no se abre solo.
  if (process.env.DEVPREP_ABRIR_NAVEGADOR === "1" && process.platform === "win32") exec(`start "" ${url}`);
  // Tiempo libre: mira cada minuto si el juego está abierto (solo cuando el servidor ya arrancó bien)
  if (process.env.DEVPREP_VIGILANTE !== "0") {
    usoLaptop.iniciar().catch(() => {});
    crearVigilante({
      progreso,
      estado: () => estado().juego,
      procesos: () => vivos(progreso.datos().ajustes).juego?.procesos ?? PROCESOS_POR_DEFECTO,
      emitir: eventos.emitir,
      // También al celular (Windows silencia las notificaciones al jugar a pantalla completa)
      avisar: (texto) => sync.avisar({ titulo: "Tiempo de juego", cuerpo: texto, url: "/" }),
    });
  }
});

servidor.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${config.puerto} está ocupado. ¿Ya tienes dev-prep abierto en otra ventana?`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

// Apaga Vitest y el servidor ordenadamente (Ctrl + C o botón "Cerrar dev-prep").
async function apagar() {
  servidor.close();
  await corredor.cerrar().catch(() => {});
  process.exit(0);
}
process.on("SIGINT", apagar);
