// Tus textos personales (pitch, historias STAR, respuestas propias) en
// data/mis-respuestas.json, separados de las estadísticas.
import { readFile, rename, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const VACIO = { pitch: "", historias: [], respuestas: {} };
const MAX_TEXTO = 5000;

const texto = (v) => (typeof v === "string" ? v.slice(0, MAX_TEXTO) : "");

/** Deja solo campos conocidos y textos de largo razonable. */
function sanear(datos) {
  return {
    pitch: texto(datos?.pitch),
    historias: (Array.isArray(datos?.historias) ? datos.historias : []).slice(0, 30).map((h, i) => ({
      id: typeof h?.id === "string" ? h.id.slice(0, 40) : `h${i}`,
      titulo: texto(h?.titulo).slice(0, 120),
      situacion: texto(h?.situacion),
      tarea: texto(h?.tarea),
      accion: texto(h?.accion),
      resultado: texto(h?.resultado),
    })),
    respuestas: Object.fromEntries(
      Object.entries(datos?.respuestas ?? {})
        .filter(([id]) => /^ent-\d{3}$/.test(id))
        .map(([id, v]) => [id, texto(v)]),
    ),
  };
}

export async function crearMisRespuestas({ datosDir }) {
  const archivo = path.join(datosDir, "mis-respuestas.json");
  await mkdir(datosDir, { recursive: true });
  let datos;
  try {
    datos = sanear(JSON.parse(await readFile(archivo, "utf8")));
  } catch {
    datos = structuredClone(VACIO);
  }
  return {
    leer: () => datos,
    async guardar(nuevos) {
      datos = sanear({ ...datos, ...nuevos });
      const tmp = `${archivo}.tmp`;
      await writeFile(tmp, JSON.stringify(datos, null, 2));
      await rename(tmp, archivo);
      return datos;
    },
  };
}
