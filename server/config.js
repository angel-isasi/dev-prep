// Rutas y ajustes de la app en un solo lugar.
// Todas se pueden cambiar con variables de entorno: así Electron (más adelante)
// podrá guardar los datos en otra carpeta sin tocar el resto del código.
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  raiz: RAIZ,
  contenidoDir: process.env.DEVPREP_CONTENIDO ?? path.join(RAIZ, "content"),
  workspaceDir: process.env.DEVPREP_WORKSPACE ?? path.join(RAIZ, "workspace"),
  datosDir: process.env.DEVPREP_DATOS ?? path.join(RAIZ, "data"),
  clienteDir: path.join(RAIZ, "client", "dist"),
  host: "127.0.0.1", // solo tu PC puede conectarse, nunca la red
  puerto: Number(process.env.DEVPREP_PUERTO ?? 4321),
  abrirVSCode: process.env.DEVPREP_VSCODE !== "0", // 0 = no abrir (para pruebas automáticas)
};
