// Sincronización de la laptop con la nube (AWS Lambda + DynamoDB, ver aws/sincronizar.yaml).
// Lee la URL y el token de data/sync.json (los crea "npm run aws:crear").
//
// Cuándo sincroniza: al arrancar, cada 5 minutos y unos segundos después de cada cambio.
// Cómo: baja los documentos de los otros dispositivos, los mezcla con el tuyo (server/combinar.js)
// y sube el tuyo. Si no hay internet o AWS no responde, no pasa nada: la laptop sigue igual
// y lo intenta de nuevo más tarde.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ahoraIso } from "./fechas.js";
import { fechaDe } from "./combinar.js";

const LIMITE_MS = 10_000;
const CADA_MS = 5 * 60 * 1000;
const ESPERA_CAMBIO_MS = 8_000;

/**
 * @param {{ datosDir: string, progreso: object, misRespuestas: object, fetch?: typeof fetch }} deps
 */
export async function crearSync({ datosDir, progreso, misRespuestas, fetch: pedir = fetch }) {
  const configuracion = JSON.parse(await readFile(path.join(datosDir, "sync.json"), "utf8").catch(() => "{}"));
  const activa = !!(configuracion.url && configuracion.token);
  const dispositivo = configuracion.dispositivo ?? "laptop";
  const estado = { activa, ultima: null, error: null, dispositivos: [] };
  let enCurso = null;
  let espera = null;

  const conLimite = (url, opciones = {}) => pedir(url, { ...opciones, signal: AbortSignal.timeout(LIMITE_MS) });
  const cabeceras = { authorization: `Bearer ${configuracion.token}`, "content-type": "application/json" };

  /** Lo que sube la laptop: su progreso más sus textos personales (pitch y STAR). */
  const miDocumento = () => ({ ...progreso.documento(), misRespuestas: misRespuestas.leer() });

  /** Mezcla lo que llega de otro dispositivo, incluidos el pitch y las historias STAR si son más nuevos. */
  async function recibir(otros) {
    if (otros.length) await progreso.fusionar(otros);
    for (const { doc } of otros) {
      const suyas = doc?.misRespuestas;
      if (suyas && (fechaDe(suyas) ?? 0) > (fechaDe(misRespuestas.leer()) ?? 0)) await misRespuestas.guardar(suyas);
    }
  }

  async function bajarYMezclar() {
    const r = await conLimite(configuracion.url, { headers: cabeceras });
    if (!r.ok) throw new Error(`AWS respondió ${r.status}`);
    const { documentos = [] } = await r.json();
    estado.dispositivos = documentos.map((d) => ({ dispositivo: d.dispositivo, actualizado: d.actualizado }));
    const otros = documentos.filter((d) => d.dispositivo !== dispositivo);
    await recibir(otros);
  }

  async function subir() {
    const r = await conLimite(configuracion.url, { method: "PUT", headers: cabeceras, body: JSON.stringify({ dispositivo, doc: miDocumento() }) });
    if (!r.ok) throw new Error(`AWS respondió ${r.status}`);
  }

  /** Una sincronización completa (si ya hay una en curso, espera esa). */
  function sincronizar() {
    if (!activa) return Promise.resolve(estado);
    enCurso ??= (async () => {
      try {
        await bajarYMezclar();
        await subir();
        estado.ultima = ahoraIso();
        estado.error = null;
      } catch (error) {
        estado.error = error.name === "TimeoutError" ? "Sin conexión (no respondió a tiempo)" : error.message;
      } finally {
        enCurso = null;
      }
      return estado;
    })();
    return enCurso;
  }

  if (activa) {
    // Después de cada cambio, sube (con una pequeña espera para juntar varios cambios).
    progreso.alCambiar(() => {
      clearTimeout(espera);
      espera = setTimeout(() => sincronizar(), ESPERA_CAMBIO_MS);
    });
    setTimeout(() => sincronizar(), 2_000);
    setInterval(() => sincronizar(), CADA_MS).unref?.();
  }

  return {
    estado: () => ({ ...estado, dispositivo }),
    sincronizar,
    /**
     * Intercambio directo con la versión web abierta en esta misma laptop (sin AWS ni internet):
     * mezcla su documento y le devuelve el de la laptop para que ella mezcle también.
     */
    async intercambioLocal(otroDispositivo, doc) {
      if (!/^[a-z0-9-]{3,40}$/.test(otroDispositivo ?? "") || otroDispositivo === dispositivo) throw new Error("Dispositivo inválido");
      await recibir([{ dispositivo: otroDispositivo, doc }]);
      return { dispositivo, doc: miDocumento() };
    },
    /** Datos para vincular el celular (van en el QR). */
    vinculo: () => (activa ? { url: configuracion.url, token: configuracion.token } : null),
  };
}
