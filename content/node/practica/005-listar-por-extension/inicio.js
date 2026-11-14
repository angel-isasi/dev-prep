// Listar archivos por extensión
//
// Usa readdir(carpeta, { withFileTypes: true }) para saber qué es archivo y
// qué es carpeta, y path.extname para la extensión. Ignora las carpetas.
//
//   // blog/: hola.md, LEEME.MD, foto.png, borradores.md/ (carpeta)
//   await listarPorExtension("blog", ".md")  ->  ["LEEME.MD", "hola.md"]
//   await contarPorExtension("blog")         ->  { ".md": 2, ".png": 1 }
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { readdir } from "node:fs/promises";
import path from "node:path";

export async function listarPorExtension(carpeta, extension) {
  // Tu código aquí
}

export async function contarPorExtension(carpeta) {
  // Tu código aquí
}
