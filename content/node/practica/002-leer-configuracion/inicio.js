// Leer la configuración
//
// Lee un archivo JSON con readFile (de "node:fs/promises") y combínalo con
// CONFIG_POR_DEFECTO. Si el archivo no existe (error.code === "ENOENT"),
// devuelve los valores por defecto. Si el JSON está roto, lanza "JSON inválido".
//
//   // config.json: { "puerto": 8080 }
//   await leerConfiguracion("config.json")
//     ->  { puerto: 8080, idioma: "es", modoOscuro: false }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { readFile } from "node:fs/promises";

export const CONFIG_POR_DEFECTO = { puerto: 3000, idioma: "es", modoOscuro: false };

export async function leerConfiguracion(ruta) {
  // Tu código aquí
}
