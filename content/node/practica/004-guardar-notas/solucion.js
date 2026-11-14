import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import path from "node:path";

// Un solo lugar decide cómo se llama el archivo de una nota.
const rutaDeNota = (carpeta, titulo) => path.join(carpeta, `${titulo}.txt`);

export async function guardarNota(carpeta, titulo, texto) {
  // recursive: crea los niveles que falten y no falla si la carpeta ya existe.
  await mkdir(carpeta, { recursive: true });
  const ruta = rutaDeNota(carpeta, titulo);
  await writeFile(ruta, texto, "utf8"); // crea o reemplaza
  return ruta;
}

export async function leerNota(carpeta, titulo) {
  try {
    return await readFile(rutaDeNota(carpeta, titulo), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") return null; // no existe: no es un error para la app
    throw error;
  }
}

export async function agregarLinea(carpeta, titulo, linea) {
  await mkdir(carpeta, { recursive: true });
  // appendFile agrega al final y crea el archivo si todavía no existe.
  await appendFile(rutaDeNota(carpeta, titulo), linea + "\n", "utf8");
}
