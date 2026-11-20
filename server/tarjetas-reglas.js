// Tarjetas de memoria (estilo Anki): cuándo vuelve cada tarjeta. Sin IA: es un cálculo exacto, gratis y
// funciona sin internet.
//
// Usa FSRS (el algoritmo de Anki moderno), con sus pesos por defecto. Cada tarjeta guarda:
// - estabilidad (s): cuántos días tarda en bajar al 90% la probabilidad de que la recuerdes.
// - dificultad (d): de 1 (fácil) a 10 (difícil).
// Al calificarla con 1 (otra vez), 2 (difícil), 3 (bien) o 4 (fácil) se recalculan las dos y la tarjeta
// vuelve cuando la probabilidad de recordarla baja al 90%.
import { sumarDias } from "./progreso-reglas.js";

/** Pesos por defecto de FSRS-4.5. */
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
/** Probabilidad de recordarla con la que vuelve la tarjeta. */
export const RETENCION = 0.9;
const MAX_DIAS = 365;

export const NOTAS = { otra: 1, dificil: 2, bien: 3, facil: 4 };
export const MAZOS = { js: "JavaScript", ingles: "Inglés", entrevistas: "Entrevistas" };
/** Topes por día para que los repasos nunca se acumulen hasta aplastarte. */
export const TOPES = { nuevas: 10, repasos: 30 };

const entre = (n, min, max) => Math.min(max, Math.max(min, n));

const diasEntre = (desde, hasta) => Math.max(0, Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / 86_400_000));

/** Probabilidad de recordarla tras `dias` con estabilidad `s`. */
export const recordar = (dias, s) => Math.pow(1 + (FACTOR * dias) / s, DECAY);

/** Días hasta que la probabilidad baja a RETENCION. */
export const intervalo = (s) => entre(Math.round((s / FACTOR) * (Math.pow(RETENCION, 1 / DECAY) - 1)), 1, MAX_DIAS);

const dificultadInicial = (g) => entre(W[4] - (g - 3) * W[5], 1, 10);

/**
 * El nuevo estado de repaso tras calificar.
 * @param {{ s?: number, d?: number, ultima?: string, repasos?: number, fallos?: number } | null} rep  estado anterior (null si es nueva)
 * @param {1|2|3|4} g  nota
 * @param {string} hoy  fecha YYYY-MM-DD
 * @returns {{ s: number, d: number, ultima: string, proxima: string, repasos: number, fallos: number, hoyOtraVez: boolean }}
 */
export function calificar(rep, g, hoy) {
  const nota = entre(Math.round(g), 1, 4);
  let s;
  let d;
  if (!rep?.s) {
    s = W[nota - 1];
    d = dificultadInicial(nota);
  } else {
    const r = recordar(diasEntre(rep.ultima ?? hoy, hoy), rep.s);
    const dPrevio = rep.d ?? 5;
    const dNueva = dPrevio - W[6] * (nota - 3);
    d = entre(W[7] * dificultadInicial(3) + (1 - W[7]) * dNueva, 1, 10);
    if (nota === 1) {
      s = W[11] * Math.pow(d, -W[12]) * (Math.pow(rep.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
      s = Math.min(s, rep.s);
    } else {
      const castigo = nota === 2 ? W[15] : 1;
      const premio = nota === 4 ? W[16] : 1;
      s = rep.s * (Math.exp(W[8]) * (11 - d) * Math.pow(rep.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * castigo * premio + 1);
    }
  }
  s = entre(s, 0.1, 36500);
  // "Otra vez" la deja para mañana y además vuelve en esta misma sesión
  const dias = nota === 1 ? 1 : intervalo(s);
  return {
    s: Math.round(s * 1000) / 1000,
    d: Math.round(d * 1000) / 1000,
    ultima: hoy,
    proxima: sumarDias(hoy, dias),
    repasos: (rep?.repasos ?? 0) + 1,
    fallos: (rep?.fallos ?? 0) + (nota === 1 ? 1 : 0),
    hoyOtraVez: nota === 1,
  };
}

/** Texto corto del intervalo que daría cada botón (para mostrarlo debajo). */
export function vistaPrevia(rep, hoy) {
  return Object.fromEntries(
    Object.entries(NOTAS).map(([nombre, g]) => {
      if (g === 1) return [nombre, "hoy otra vez"];
      const dias = diasEntre(hoy, calificar(rep, g, hoy).proxima);
      return [nombre, dias < 30 ? `${dias} d` : dias < 365 ? `${Math.round(dias / 30)} mes` : "1 año"];
    }),
  );
}

/**
 * La cola de hoy: primero los repasos vencidos (los más atrasados primero) y luego las nuevas, con topes.
 * @param {{ id: string, mazo: string, creada?: string, rep?: object }[]} tarjetas
 * @param {{ hoy: string, mazo?: string, hechasHoy?: { nuevas: number, repasos: number }, topes?: typeof TOPES }} opciones
 */
export function colaDeHoy(tarjetas, { hoy, mazo, hechasHoy = { nuevas: 0, repasos: 0 }, topes = TOPES }) {
  const delMazo = tarjetas.filter((t) => !mazo || t.mazo === mazo);
  const vencidas = delMazo
    .filter((t) => t.rep?.proxima && t.rep.proxima <= hoy)
    .sort((a, b) => a.rep.proxima.localeCompare(b.rep.proxima));
  const nuevas = delMazo.filter((t) => !t.rep).sort((a, b) => String(a.creada ?? "").localeCompare(String(b.creada ?? "")));
  const repasos = vencidas.slice(0, Math.max(0, topes.repasos - hechasHoy.repasos));
  const nuevasHoy = nuevas.slice(0, Math.max(0, topes.nuevas - hechasHoy.nuevas));
  return { cola: [...repasos, ...nuevasHoy], repasos: repasos.length, nuevas: nuevasHoy.length, esperando: vencidas.length - repasos.length + nuevas.length - nuevasHoy.length };
}

/** Minutos aproximados para una cola (unos 12 segundos por tarjeta). */
export const minutosCola = (n) => Math.max(1, Math.round((n * 12) / 60));
