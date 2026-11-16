// Sincronización del celular con la nube (AWS Lambda + DynamoDB).
// Local primero: el celular guarda todo en sí mismo y funciona sin internet. Cuando hay
// conexión, baja lo de la laptop, lo mezcla con lo suyo (server/combinar.js) y sube lo suyo.
//
// Se vincula una sola vez escaneando el QR de Ajustes de la laptop (pantalla /vincular).
// La URL y el token quedan solo en este celular: nunca van en el código publicado.
import { ahoraIso } from "../../../server/fechas.js";
import { limpiarCache, progreso } from "./api-movil.js";

const CLAVE = "devprep-sync";
const LIMITE_MS = 10_000;
const CADA_MS = 5 * 60 * 1000;

export function leerVinculo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? null;
  } catch {
    return null;
  }
}

/** Guarda la URL y el token del QR. El id del dispositivo se crea una vez y no cambia. */
export function vincular(url, token) {
  const previo = leerVinculo();
  const dispositivo = previo?.dispositivo ?? `celular-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(CLAVE, JSON.stringify({ url, token, dispositivo, ultima: null, error: null }));
}

export function desvincular() {
  localStorage.removeItem(CLAVE);
}

function anotar(cambios) {
  const v = leerVinculo();
  if (v) localStorage.setItem(CLAVE, JSON.stringify({ ...v, ...cambios }));
}

let enCurso = null;

/** Una sincronización completa. Sin vínculo o sin internet, no hace nada. */
export function sincronizar() {
  const v = leerVinculo();
  if (!v?.url || !navigator.onLine) return Promise.resolve(v);
  enCurso ??= (async () => {
    const cabeceras = { authorization: `Bearer ${v.token}`, "content-type": "application/json" };
    try {
      const r = await fetch(v.url, { headers: cabeceras, signal: AbortSignal.timeout(LIMITE_MS) });
      if (!r.ok) throw new Error(r.status === 401 ? "El vínculo ya no es válido: vuelve a escanear el QR" : `La nube respondió ${r.status}`);
      const { documentos = [] } = await r.json();
      const otros = documentos.filter((d) => d.dispositivo !== v.dispositivo);
      if (otros.length) {
        progreso.fusionar(otros);
        limpiarCache();
      }
      const s = await fetch(v.url, {
        method: "PUT",
        headers: cabeceras,
        body: JSON.stringify({ dispositivo: v.dispositivo, doc: progreso.documento() }),
        signal: AbortSignal.timeout(LIMITE_MS),
      });
      if (!s.ok) throw new Error(`La nube respondió ${s.status}`);
      anotar({ ultima: ahoraIso(), error: null, dispositivos: documentos.map((d) => d.dispositivo) });
    } catch (error) {
      anotar({ error: error.name === "TimeoutError" ? "Sin conexión" : error.message });
    } finally {
      enCurso = null;
    }
    return leerVinculo();
  })();
  return enCurso;
}

/** Sincroniza al abrir la app, al volver a ella, al recuperar internet y cada 5 minutos. */
export function iniciarSincronizacion() {
  if (!leerVinculo()) return () => {};
  sincronizar();
  const alVolver = () => document.visibilityState === "visible" && sincronizar();
  window.addEventListener("online", sincronizar);
  document.addEventListener("visibilitychange", alVolver);
  const intervalo = setInterval(() => document.visibilityState === "visible" && sincronizar(), CADA_MS);
  return () => {
    window.removeEventListener("online", sincronizar);
    document.removeEventListener("visibilitychange", alVolver);
    clearInterval(intervalo);
  };
}
