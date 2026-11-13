// Guarda tu progreso en data/progreso.json y un historial en data/eventos.jsonl.
// Las reglas (qué cuenta como intento, cuándo está resuelto) viven en progreso-reglas.js.
import { appendFile, copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ahoraIso, fechaLocal } from "./fechas.js";
import {
  aplicarResultado,
  marcarAbierto,
  progresoVacio,
  registroVacio,
  sumarAlDia,
  sumarTiempo,
  verPista,
  verSolucion,
} from "./progreso-reglas.js";

const RESPALDOS_DIARIOS = 7;

/** @param {{ datosDir: string }} opciones */
export async function crearProgreso({ datosDir }) {
  const archivo = path.join(datosDir, "progreso.json");
  const historial = path.join(datosDir, "eventos.jsonl");
  const respaldosDir = path.join(datosDir, "respaldos");
  await mkdir(datosDir, { recursive: true });

  let datos;
  try {
    datos = { ...progresoVacio(), ...JSON.parse(await readFile(archivo, "utf8")) };
  } catch (error) {
    if (error.code !== "ENOENT") {
      // Archivo dañado: lo apartamos en vez de borrarlo, y empezamos de cero.
      const apartado = `${archivo}.danado-${Date.now()}`;
      await rename(archivo, apartado);
      console.error(`[progreso] progreso.json no se pudo leer; se guardó como ${path.basename(apartado)}`);
    }
    datos = progresoVacio();
  }
  await respaldoDiario();

  // Las escrituras van en fila: nunca dos a la vez sobre el mismo archivo.
  let cola = Promise.resolve();

  /** Escritura atómica: primero a un .tmp y luego renombrar (si se corta la luz, no queda a medias). */
  function guardar() {
    cola = cola
      .then(async () => {
        const tmp = `${archivo}.tmp`;
        await writeFile(tmp, JSON.stringify(datos, null, 2));
        await rename(tmp, archivo);
      })
      .catch((error) => console.error("[progreso] no se pudo guardar:", error.message));
    return cola;
  }

  /** Una copia por día en data/respaldos/ (se guardan las últimas 7). */
  async function respaldoDiario() {
    try {
      await mkdir(respaldosDir, { recursive: true });
      const destino = path.join(respaldosDir, `progreso-${fechaLocal()}.json`);
      await copyFile(archivo, destino).catch((e) => (e.code === "ENOENT" ? null : Promise.reject(e)));
      const viejos = (await readdir(respaldosDir)).filter((f) => f.startsWith("progreso-")).sort().slice(0, -RESPALDOS_DIARIOS);
      await Promise.all(viejos.map((f) => rm(path.join(respaldosDir, f))));
    } catch (error) {
      console.error("[progreso] no se pudo crear el respaldo diario:", error.message);
    }
  }

  async function registrarEvento(tipo, id, extra = {}) {
    const linea = JSON.stringify({ en: ahoraIso(), tipo, id, ...extra });
    await appendFile(historial, linea + "\n").catch((e) => console.error("[progreso]", e.message));
  }

  // Completa con valores por defecto los registros guardados con versiones anteriores.
  const deEjercicio = (id) => ({ ...registroVacio(), ...datos.ejercicios[id] });

  /** Suma tiempo activo al ejercicio y al día. */
  function conTiempo(registro, ahora) {
    const { registro: nuevo, segundos } = sumarTiempo(registro, ahora);
    if (segundos) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "segundos", segundos);
    return nuevo;
  }

  return {
    deEjercicio,
    datos: () => datos,

    /** @returns {Promise<object|null>} el registro nuevo, o null si se salta una pista */
    async verPista(id, n) {
      const ahora = ahoraIso();
      const registro = verPista(deEjercicio(id), n, ahora);
      if (!registro) return null;
      datos.ejercicios[id] = conTiempo(registro, ahora);
      await registrarEvento("pista", id, { n });
      await guardar();
      return datos.ejercicios[id];
    },

    async verSolucion(id) {
      const antes = deEjercicio(id);
      datos.ejercicios[id] = verSolucion(antes, ahoraIso());
      await registrarEvento("solucion", id, { penalidad: antes.estado !== "resuelto" });
      await guardar();
      return datos.ejercicios[id];
    },

    async guardarExplicacion(id, texto) {
      datos.ejercicios[id] = { ...deEjercicio(id), explicacion: texto };
      await registrarEvento("explicacion", id);
      await guardar();
      return datos.ejercicios[id];
    },
    registrarEvento,

    async marcarAbierto(id) {
      const ahora = ahoraIso();
      // Al abrir no se suma tiempo: solo se marca el inicio de esta sesión de trabajo.
      datos.ejercicios[id] = { ...marcarAbierto(deEjercicio(id), ahora), ultimaActividad: ahora };
      await registrarEvento("abrir", id);
      await guardar();
    },

    /**
     * @param {string} id
     * @param {{ pasan: number, total: number, error: string|null }} resultado
     * @param {{ esIntento: boolean }} info
     */
    async registrarResultado(id, resultado, { esIntento }) {
      const ahora = ahoraIso();
      const aplicado = aplicarResultado(deEjercicio(id), resultado, { esIntento, ahora });
      const { resueltoAhora } = aplicado;
      const registro = esIntento ? conTiempo(aplicado.registro, ahora) : aplicado.registro;
      datos.ejercicios[id] = registro;
      if (resueltoAhora) datos.dias = sumarAlDia(datos.dias, fechaLocal(), "resueltos");
      await registrarEvento("corrida", id, { pasan: resultado.pasan, total: resultado.total, intento: esIntento });
      if (resueltoAhora) await registrarEvento("resuelto", id);
      await guardar();
      return { registro, resueltoAhora };
    },
  };
}
