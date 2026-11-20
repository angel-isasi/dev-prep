// Reglas del mapache: cuánta hambre tiene, cómo se siente, dónde vive y qué te robó.
// Todo sale de tu progreso de inglés (contadores del día y repasos); nada de esto se guarda,
// se calcula cada vez. Funciones puras: se prueban en reglas.test.js.
import { sumarDias } from "../../../../server/progreso-reglas.js";

/** Comida que necesita al día para estar lleno. */
export const META_COMIDA = 30;

export const NIVELES = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Lo que se pone solo al subir de nivel. */
export const REGALOS_NIVEL = { B1: "mochila", B2: "lentes", C1: "corbata", C2: "birrete" };

/**
 * Comida de un día: sale de lo que hiciste en inglés. Abrir la app no alimenta: aprender, sí.
 * @param {Record<string, number>} dia  contadores del día (dias[fecha])
 */
export function comidaDelDia(dia = {}) {
  const n = (c) => Number(dia?.[c]) || 0;
  const puntos =
    n("inglesNuevos") * 2 +
    n("inglesAciertos") * 0.5 +
    n("ingles") * 4 +
    n("inglesHistorias") * 5 +
    Math.floor(n("inglesSegundos") / 60) * 0.5 +
    n("inmersion") * 0.5 +
    n("mapache");
  return Math.round(puntos * 10) / 10;
}

/** ¿Hizo algo de inglés ese día? (lo mismo que cuenta para la racha de inglés) */
export const practico = (dia = {}) => (dia?.ingles ?? 0) + (dia?.inmersion ?? 0) + (dia?.inglesHistorias ?? 0) + (dia?.inglesSegundos ?? 0) + (dia?.mapache ?? 0) > 0;

/** Racha de inglés (días seguidos con práctica, contando hoy si ya practicaste). */
export function rachaIngles(dias, hoy) {
  let f = practico(dias[hoy]) ? hoy : sumarDias(hoy, -1);
  let racha = 0;
  while (practico(dias[f])) {
    racha++;
    f = sumarDias(f, -1);
  }
  return racha;
}

/**
 * Cómo está el mapache hoy.
 * Solo depende de tu práctica: los repasos pendientes no lo ponen triste (pedido de Angel, 2026-11-19).
 * @param {{ dias: Record<string, object>, hoy: string, hora?: number }} datos
 * @returns {{ estado: "nuevo"|"escapado"|"dormido"|"triste"|"hambriento"|"feliz"|"normal", hambre: number, comidaHoy: number, meta: number, racha: number, rachaRota: boolean }}
 */
export function estadoMapache({ dias = {}, hoy, hora = 12 }) {
  const dia = (k) => dias[sumarDias(hoy, -k)] ?? {};
  const comidaHoy = comidaDelDia(dia(0));
  const saciedad = comidaHoy + comidaDelDia(dia(1)) * 0.5 + comidaDelDia(dia(2)) * 0.25;
  const hambre = Math.max(0, Math.min(100, Math.round(100 - (saciedad / META_COMIDA) * 100)));
  const racha = rachaIngles(dias, hoy);
  const algunaVez = Object.values(dias).some(practico);
  const rachaRota = !practico(dia(0)) && !practico(dia(1)) && practico(dia(2));
  const base = { hambre, comidaHoy, meta: META_COMIDA, racha, rachaRota };

  if (!algunaVez) return { ...base, estado: "nuevo" };
  // Tres días sin inglés: se fue a buscar comida. Vuelve apenas practiques hoy.
  if (![0, 1, 2].some((k) => practico(dia(k)))) return { ...base, estado: "escapado" };
  if (hora >= 23 || hora < 6) return { ...base, estado: "dormido" };
  if (comidaHoy >= META_COMIDA) return { ...base, estado: "feliz" };
  if (rachaRota) return { ...base, estado: "triste" };
  if (hambre >= 60) return { ...base, estado: "hambriento" };
  return { ...base, estado: "normal" };
}

/** Nivel más alto entre el examen y las unidades que completaste (en orden). */
export function nivelIngles({ examen, unidades = [], completa = () => false }) {
  let nivel = NIVELES.includes(examen?.nivel) ? examen.nivel : "A1";
  for (const u of unidades) if (completa(u.id) && NIVELES.indexOf(u.nivel) > NIVELES.indexOf(nivel)) nivel = u.nivel;
  return nivel;
}

/** Regalos que ya tiene por su nivel. */
export function regalosDeNivel(nivel) {
  const i = NIVELES.indexOf(nivel);
  return Object.entries(REGALOS_NIVEL)
    .filter(([n]) => NIVELES.indexOf(n) <= i)
    .map(([, id]) => id);
}

/**
 * Tus repasos pendientes: los repasos de inglés que ya vencieron (palabras y frases), los más atrasados primero.
 * @param {Record<string, { proximo?: string }>} registros  datos.items
 */
export function clavesRobadas(registros = {}, hoy) {
  return Object.entries(registros)
    .filter(([clave, r]) => /^(en|fr):/.test(clave) && r?.proximo && r.proximo <= hoy)
    .sort((a, b) => (a[1].proximo < b[1].proximo ? -1 : a[1].proximo > b[1].proximo ? 1 : 0))
    .map(([clave]) => clave);
}

/** Número estable a partir de un texto (mismo día, misma frase). */
export function hash(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

export const elegir = (lista, semilla) => (lista.length ? lista[hash(String(semilla)) % lista.length] : null);

/** Palabras que sabe el corrector de respuestas libres (para ver si escribiste en inglés). */
const COMUNES =
  "a an the i you he she it we they me him her us them my your his its our their this that these those is am are was were be been being have has had do does did will would can could should may might must not no yes and or but so because if when then than to of in on at for with from by about as into like up out over after before just very really also too more most some any all every each much many lot lots what who where why how which there here hi hello ok okay thanks thank please sorry well good great bad big small new old today yesterday tomorrow day week time people thing things work job study learn like love want need think know make go get see say tell use try help feel".split(
    " ",
  );

/**
 * Revisa una respuesta libre a la pregunta del día: no hay una sola respuesta correcta, así que se mira
 * que sea inglés, que tenga el largo de tu nivel y qué palabras de tus unidades usaste.
 * @param {string} texto
 * @param {{ minimo: number, vocabulario: Set<string>, tuyas: Set<string> }} opciones
 */
export function revisarRespuesta(texto, { minimo = 3, vocabulario = new Set(), tuyas = new Set() } = {}) {
  const palabras = String(texto ?? "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .match(/[a-z']+/g) ?? [];
  const conocidas = palabras.filter((p) => COMUNES.includes(p) || vocabulario.has(p) || vocabulario.has(p.replace(/(s|es|ed|ing|'s|n't)$/, "")));
  const ingles = palabras.length ? conocidas.length / palabras.length : 0;
  const usadas = [...new Set(palabras.filter((p) => tuyas.has(p)))];
  const ok = palabras.length >= minimo && ingles >= 0.6;
  return { ok, palabras: palabras.length, minimo, ingles: Math.round(ingles * 100), usadas, corto: palabras.length < minimo, noIngles: palabras.length >= minimo && ingles < 0.6 };
}

/** Una ronda: una palabra y dos tachos. Mezcla "verbo o sustantivo" y "presente o pasado". */
export function rondaNueva(palabras, azar = Math.random) {
  const verbosConPasado = palabras.filter((w) => w.tipo === "verbo" && w.pasado && !w.en.includes(" "));
  const tipos = palabras.filter((w) => (w.tipo === "verbo" || w.tipo === "sustantivo") && !w.en.includes(" "));
  if (verbosConPasado.length >= 3 && azar() < 0.45) {
    const w = verbosConPasado[Math.floor(azar() * verbosConPasado.length)];
    const pasado = w.pasado.split("/")[0].trim();
    if (pasado.toLowerCase() !== w.en.toLowerCase()) {
      const enPasado = azar() < 0.5;
      return { texto: enPasado ? pasado : w.en, es: w.es, tachos: ["present", "past"], correcto: enPasado ? 1 : 0 };
    }
  }
  const w = tipos[Math.floor(azar() * tipos.length)];
  if (!w) return null;
  return { texto: w.en, es: w.es, tachos: ["verb", "noun"], correcto: w.tipo === "verbo" ? 0 : 1 };
}
