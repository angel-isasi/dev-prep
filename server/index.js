// Punto de entrada: npm start
import { config } from "./config.js";
import { crearIndice } from "./contenido.js";
import { crearWorkspace } from "./workspace.js";
import { abrirEnVSCode } from "./vscode.js";
import { crearApp } from "./app.js";

const indice = await crearIndice(config.contenidoDir);
for (const error of indice.errores) console.warn(`[contenido] ${error}`);

const workspace = crearWorkspace({ workspaceDir: config.workspaceDir });

const app = crearApp({ indice, workspace, vscode: abrirEnVSCode, clienteDir: config.clienteDir });

app.listen(config.puerto, config.host, () => {
  console.log(`dev-prep listo en http://localhost:${config.puerto} (${indice.ejercicios.length} ejercicios)`);
});
