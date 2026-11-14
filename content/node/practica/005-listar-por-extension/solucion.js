import { readdir } from "node:fs/promises";
import path from "node:path";

/** Nombres de los ARCHIVOS (no carpetas) que hay directamente en `carpeta`. */
async function nombresDeArchivos(carpeta) {
  const entradas = await readdir(carpeta, { withFileTypes: true });
  return entradas.filter((e) => e.isFile()).map((e) => e.name);
}

export async function listarPorExtension(carpeta, extension) {
  const nombres = await nombresDeArchivos(carpeta);
  return nombres.filter((nombre) => path.extname(nombre).toLowerCase() === extension).sort();
}

export async function contarPorExtension(carpeta) {
  const nombres = await nombresDeArchivos(carpeta);
  const conteo = {};
  for (const nombre of nombres) {
    const clave = path.extname(nombre).toLowerCase() || "(sin extensión)";
    conteo[clave] = (conteo[clave] ?? 0) + 1;
  }
  return conteo;
}
