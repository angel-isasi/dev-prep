// Versión web en tu laptop: si dev-prep está abierto en esta misma laptop, la web habla con él y
// tiene todo lo de la app local (VS Code, tests en vivo, marcar resuelto, simulacro con código).
//
// Solo lo intenta en un navegador que marcaste como "tu laptop" (botón de Ajustes o el enlace
// "Vincular la versión web" de la app local). Así, en otra computadora o en el celular, Chrome
// nunca pide permiso para buscar dispositivos de la red.
import { ES_VISITA } from "./visita.js";

export const BASE_LOCAL = "http://127.0.0.1:4321";
const CLAVE = "devprep-laptop";
const LIMITE_MS = 1500;

let activa = false;
const oyentes = new Set();

const avisar = (valor) => {
  if (valor === activa) return;
  activa = valor;
  for (const oyente of oyentes) oyente(activa);
};

/** ¿La web está usando ahora el dev-prep de esta laptop? */
export const conectada = () => activa;

/** ¿Este navegador está marcado como tu laptop? */
export const esMiLaptop = () => !ES_VISITA && localStorage.getItem(CLAVE) === "1";

export function marcarMiLaptop(si) {
  if (si) localStorage.setItem(CLAVE, "1");
  else {
    localStorage.removeItem(CLAVE);
    avisar(false);
  }
}

/** Pregunta si dev-prep está abierto en esta laptop. Devuelve true o false. */
export async function probar() {
  if (!esMiLaptop()) return (avisar(false), false);
  try {
    const r = await fetch(`${BASE_LOCAL}/api/hola`, { signal: AbortSignal.timeout(LIMITE_MS) });
    avisar((await r.json())?.app === "dev-prep");
  } catch {
    avisar(false);
  }
  return activa;
}

/** @param {(activa: boolean) => void} oyente @returns {() => void} */
export function alCambiar(oyente) {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}
