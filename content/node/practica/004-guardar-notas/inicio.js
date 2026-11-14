// Guardar y leer notas
//
// Cada nota es un archivo <carpeta>/<titulo>.txt. Usa mkdir (con recursive),
// writeFile, readFile y appendFile de "node:fs/promises", y path.join.
//
//   await guardarNota("notas", "compras", "pan\n")  ->  ruta del archivo
//   await agregarLinea("notas", "compras", "leche")
//   await leerNota("notas", "compras")              ->  "pan\nleche\n"
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

export async function guardarNota(carpeta, titulo, texto) {
  // Tu código aquí
}

export async function leerNota(carpeta, titulo) {
  // Tu código aquí
}

export async function agregarLinea(carpeta, titulo, linea) {
  // Tu código aquí
}
