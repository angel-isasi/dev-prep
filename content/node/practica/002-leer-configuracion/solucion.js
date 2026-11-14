import { readFile } from "node:fs/promises";

export const CONFIG_POR_DEFECTO = { puerto: 3000, idioma: "es", modoOscuro: false };

export async function leerConfiguracion(ruta) {
  let texto;
  try {
    // "utf8" hace que readFile devuelva un string y no un Buffer (bytes).
    texto = await readFile(ruta, "utf8");
  } catch (error) {
    // Solo el "no existe" es normal: la primera vez la app aún no tiene config.
    if (error.code === "ENOENT") return { ...CONFIG_POR_DEFECTO };
    throw error; // permisos, ruta que es carpeta, etc.: que se entere quien llamó
  }

  let datos;
  try {
    datos = JSON.parse(texto);
  } catch {
    throw new Error(`JSON inválido en ${ruta}`);
  }

  // Lo que viene después en el spread gana: el archivo pisa a los valores por defecto.
  return { ...CONFIG_POR_DEFECTO, ...datos };
}
