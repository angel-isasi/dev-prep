import { readFile } from "node:fs/promises";

export async function resumirLog(ruta) {
  const texto = await readFile(ruta, "utf8");

  // /\r?\n/ corta tanto en "\n" (Linux/Mac) como en "\r\n" (Windows).
  const lineas = texto.split(/\r?\n/).filter((linea) => linea.trim() !== "");

  const resumen = {
    total: lineas.length,
    porNivel: { INFO: 0, WARN: 0, ERROR: 0 }, // las tres claves desde el inicio
    errores: [],
  };

  for (const linea of lineas) {
    // Las tres primeras partes son fecha, hora y nivel; el resto es el mensaje.
    const [, , nivel, ...palabras] = linea.trim().split(" ");
    if (!(nivel in resumen.porNivel)) continue; // DEBUG u otro: solo cuenta en total
    resumen.porNivel[nivel]++;
    if (nivel === "ERROR") resumen.errores.push(palabras.join(" "));
  }

  return resumen;
}
