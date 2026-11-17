// Misiones diarias de inglés, liga contra ti mismo y frases de los cofres. Funciones puras
// (se prueban en misiones.test.js); los números salen de los contadores del día (dias[fecha]).
import { sumarDias } from "../../../../server/progreso-reglas.js";

/** Todas las misiones posibles. `campo` es el contador del día; `meta`, cuánto pide. */
export const MISIONES = [
  { id: "xp", texto: "Gana 60 XP de inglés", campo: "inglesXp", meta: 60 },
  { id: "perfecta", texto: "Haz una lección perfecta", campo: "inglesPerfectas", meta: 1 },
  { id: "nuevos", texto: "Aprende 10 palabras o frases nuevas", campo: "inglesNuevos", meta: 10 },
  { id: "combo", texto: "Logra un combo de 8", campo: "inglesCombo8", meta: 1 },
  { id: "aciertos", texto: "Acierta 25 preguntas", campo: "inglesAciertos", meta: 25 },
  { id: "oido", texto: "Responde 10 ejercicios de escuchar", campo: "inglesOido", meta: 10 },
  { id: "historia", texto: "Completa una historia o un roleplay", campo: "inglesHistorias", meta: 1 },
  { id: "hablar", texto: "Di 5 frases en voz alta", campo: "inglesHablar", meta: 5 },
  { id: "lecciones", texto: "Completa 2 lecciones", campo: "ingles", meta: 2 },
];

export const XP_COFRE_DIARIO = 30;
export const XP_COFRE_UNIDAD = 40;

/** Número estable a partir de un texto (misma fecha, mismas misiones). */
function hash(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Las 3 misiones de hoy, siempre las mismas para la misma fecha. Sin micrófono no sale "hablar".
 * @returns {{ id, texto, meta, valor, hecha }[]}
 */
export function misionesDelDia(fecha, dia = {}, { conMicro = false } = {}) {
  const posibles = MISIONES.filter((m) => conMicro || m.id !== "hablar");
  const ordenadas = [...posibles].sort((a, b) => hash(fecha + a.id) - hash(fecha + b.id));
  return ordenadas.slice(0, 3).map((m) => {
    const valor = Math.min(m.meta, dia?.[m.campo] ?? 0);
    return { id: m.id, texto: m.texto, meta: m.meta, valor, hecha: valor >= m.meta };
  });
}

/** Liga contra ti mismo: XP de inglés de esta semana (lunes a hoy) contra la semana pasada completa. */
export function ligaSemanal(dias, hoy) {
  const [a, m, d] = hoy.split("-").map(Number);
  const desdeLunes = (new Date(Date.UTC(a, m - 1, d)).getUTCDay() + 6) % 7;
  const lunes = sumarDias(hoy, -desdeLunes);
  const sumar = (desde, n) => Array.from({ length: n }, (_, i) => dias[sumarDias(desde, i)]?.inglesXp ?? 0).reduce((x, y) => x + y, 0);
  const estaSemana = sumar(lunes, desdeLunes + 1);
  const pasada = sumar(sumarDias(lunes, -7), 7);
  // A la misma altura de la semana pasada, para comparar justo
  const pasadaHastaHoy = sumar(sumarDias(lunes, -7), desdeLunes + 1);
  const diferencia = pasadaHastaHoy ? Math.round(((estaSemana - pasadaHastaHoy) / pasadaHastaHoy) * 100) : null;
  return { estaSemana, pasada, pasadaHastaHoy, diferencia, ganando: estaSemana > pasadaHastaHoy, porDia: Array.from({ length: 7 }, (_, i) => ({ fecha: sumarDias(lunes, i), xp: dias[sumarDias(lunes, i)]?.inglesXp ?? 0, pasada: dias[sumarDias(lunes, i - 7)]?.inglesXp ?? 0 })) };
}

/** Lo que trae el cofre de una unidad: una frase de trabajo de esa unidad (o cualquiera) y XP. */
export function premioDeCofre(items, unidad) {
  const frases = items.filter((it) => it.unidad === unidad && it.concepto === "frase");
  const deTrabajo = frases.filter((f) => f.trabajo);
  const lista = deTrabajo.length ? deTrabajo : frases;
  const frase = lista.length ? lista[hash(unidad) % lista.length] : null;
  return { xp: XP_COFRE_UNIDAD, frase: frase ? { en: frase.en, es: frase.es } : null };
}

/** Contadores del día que deja una lección de inglés terminada. */
export function contadoresDeLeccion(sesion, final) {
  const pasos = sesion.pasos.filter((p) => !p.item?.extra);
  const formaDe = (p) => p.item?.forma ?? p.item?.subtipo;
  const acertado = (p) => sesion.notas[p.clave] === "sabia" || sesion.notas[p.clave] === "dude";
  return {
    inglesXp: final.xp,
    inglesAciertos: pasos.filter(acertado).length,
    inglesPerfectas: final.perfecta ? 1 : 0,
    inglesCombo8: (sesion.comboMax ?? 0) >= 8 ? 1 : 0,
    inglesNuevos: pasos.filter((p) => p.nuevo && acertado(p)).length,
    inglesOido: pasos.filter((p) => p.item?.soloAudio && sesion.notas[p.clave]).length,
    inglesHablar: pasos.filter((p) => formaDe(p) === "hablar" && acertado(p)).length,
  };
}
