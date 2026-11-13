// Punto de entrada: npm start
import { config } from "./config.js";
import { crearIndice } from "./contenido.js";
import { crearWorkspace } from "./workspace.js";
import { crearEventos } from "./eventos.js";
import { crearCorredor } from "./corredor.js";
import { crearProgreso } from "./progreso.js";
import { abrirEnVSCode } from "./vscode.js";
import { crearApp } from "./app.js";

const indice = await crearIndice(config.contenidoDir);
for (const error of indice.errores) console.warn(`[contenido] ${error}`);

const workspace = crearWorkspace({ workspaceDir: config.workspaceDir });
const eventos = crearEventos();
const progreso = await crearProgreso({ datosDir: config.datosDir });

const corredor = await crearCorredor({
  workspace,
  alEmpezar: (ids) => eventos.emitir("corriendo", { ids }),
  alResultado: async (id, resultado, info) => {
    if (!indice.porId.has(id)) return; // carpeta ajena en workspace/
    const { registro, resueltoAhora } = await progreso.registrarResultado(id, resultado, info);
    eventos.emitir("resultado", { id, resultado, progreso: registro, resueltoAhora });
  },
});

const vscode = config.abrirVSCode ? abrirEnVSCode : async () => {};
const app = crearApp({ indice, workspace, corredor, eventos, progreso, vscode, clienteDir: config.clienteDir });

app.listen(config.puerto, config.host, () => {
  console.log(`dev-prep listo en http://localhost:${config.puerto} (${indice.ejercicios.length} ejercicios)`);
});
