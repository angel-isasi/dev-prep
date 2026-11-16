// Sincronización del celular con la nube (AWS Lambda + DynamoDB).
// Local primero: el celular guarda todo en sí mismo y funciona sin internet. Cuando hay
// conexión, baja lo de la laptop, lo mezcla con lo suyo (server/combinar.js) y sube lo suyo.
//
// Se vincula una sola vez escaneando el QR de Ajustes de la laptop (pantalla /vincular).
// La URL y el token quedan solo en este celular: nunca van en el código publicado.
//
// En la laptop, con dev-prep abierto, además intercambia el progreso directo con ese dev-prep
// (sin internet ni AWS), así Inicio cuenta al instante las lecciones hechas en la web.
import { ahoraIso } from "../../../server/fechas.js";
import { limpiarCache, progreso } from "./api-movil.js";
import { alCambiar as alCambiarConexion, BASE_LOCAL, conectada } from "./conexion-local.js";

const CLAVE = "devprep-sync";
const CLAVE_DISPOSITIVO = "devprep-dispositivo";
const LIMITE_MS = 10_000;
const CADA_MS = 5 * 60 * 1000;
const ESPERA_CAMBIO_MS = 8_000; // sube a la nube 8 s después del último cambio
const ESPERA_LOCAL_MS = 1_500; // con la laptop, casi al instante

export function leerVinculo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? null;
  } catch {
    return null;
  }
}

/** Id de este dispositivo: se crea una vez y no cambia (aunque te desvincules y vuelvas a vincular). */
export function miDispositivo() {
  let id = leerVinculo()?.dispositivo ?? localStorage.getItem(CLAVE_DISPOSITIVO);
  if (!id) id = `celular-${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(CLAVE_DISPOSITIVO, id);
  return id;
}

/** Guarda la URL y el token del QR. */
export function vincular(url, token) {
  const dispositivo = miDispositivo();
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

let localEnCurso = null;

/** Intercambio directo con el dev-prep abierto en esta laptop (sin internet). */
export function intercambiarLocal() {
  if (!conectada()) return Promise.resolve(false);
  localEnCurso ??= (async () => {
    try {
      const r = await fetch(`${BASE_LOCAL}/api/sync/local`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dispositivo: miDispositivo(), doc: progreso.documento() }),
        signal: AbortSignal.timeout(LIMITE_MS),
      });
      if (!r.ok) return false;
      const { dispositivo, doc } = await r.json();
      progreso.fusionar([{ dispositivo, doc }]);
      limpiarCache();
      return true;
    } catch {
      return false;
    } finally {
      localEnCurso = null;
    }
  })();
  return localEnCurso;
}

/**
 * Sincroniza al abrir la app, al volver a ella, al recuperar internet, cada 5 minutos y poco
 * después de cada cambio (así un aviso nunca dice "no estudiaste" si sí estudiaste). Al ocultar
 * la app sube lo pendiente. Con la laptop conectada, intercambia también directo con ella.
 */
export function iniciarSincronizacion() {
  let esperaNube = null;
  let esperaLocal = null;
  const enLaNube = () => leerVinculo() && sincronizar();

  const quitarCambio = progreso.alCambiar(() => {
    clearTimeout(esperaLocal);
    esperaLocal = setTimeout(intercambiarLocal, ESPERA_LOCAL_MS);
    clearTimeout(esperaNube);
    esperaNube = setTimeout(enLaNube, ESPERA_CAMBIO_MS);
  });
  const quitarConexion = alCambiarConexion((activa) => activa && intercambiarLocal());
  const alVisibilidad = () => {
    clearTimeout(esperaNube);
    enLaNube(); // visible: trae lo nuevo; oculta: sube lo pendiente antes de que el sistema la pause
  };

  enLaNube();
  intercambiarLocal();
  window.addEventListener("online", enLaNube);
  document.addEventListener("visibilitychange", alVisibilidad);
  const intervalo = setInterval(() => document.visibilityState === "visible" && enLaNube(), CADA_MS);
  return () => {
    quitarCambio();
    quitarConexion();
    clearTimeout(esperaNube);
    clearTimeout(esperaLocal);
    window.removeEventListener("online", enLaNube);
    document.removeEventListener("visibilitychange", alVisibilidad);
    clearInterval(intervalo);
  };
}
