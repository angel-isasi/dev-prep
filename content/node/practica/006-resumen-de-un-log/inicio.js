// Resumen de un archivo de log
//
// Lee el archivo, sepáralo en líneas (/\r?\n/), ignora las vacías y cuenta
// por nivel. Cada línea es: "<fecha> <hora> <NIVEL> <mensaje con espacios>".
//
//   await resumirLog("app.log")
//     ->  { total: 3, porNivel: { INFO: 1, WARN: 0, ERROR: 1 }, errores: ["Sin conexión"] }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { readFile } from "node:fs/promises";

export async function resumirLog(ruta) {
  // Tu código aquí
}
