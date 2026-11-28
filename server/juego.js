// Tiempo libre ganado (Dota 2 u otro juego), como funciones puras.
//
// Cada punto de estudio (server/puntos.js) es un minuto de tiempo libre. Los minutos se
// desbloquean al cumplir la meta del día y no se acumulan de un día a otro. Lo que juegas de más
// (o sin haber cumplido) pasa a deuda y se descuenta mañana. El tiempo jugado lo mide el motor
// de la laptop (server/juego-vigilante.js) en dias[fecha].juego (segundos).
import { sumarDias } from "./progreso-reglas.js";
import { diaSemana, hechoDe, lunesDe, metaDelDia } from "./metricas.js";
import { PUNTOS, puntosDe } from "./puntos.js";
import { retoDeLaSemana } from "./avance.js";

/** La misma tabla de puntos, vista como minutos de tiempo libre (1 punto = 1 minuto). */
export const GANANCIA = PUNTOS.map((p) => ({ ...p, minutos: p.puntos }));

export const TOPE_DIA = 120;
export const TOPE_FIN_DE_SEMANA = 180; // si cumpliste de lunes a viernes
export const TOPE_DEUDA = 120;
const DIAS_HISTORIA = 60;

/** Minutos brutos ganados en un día (antes de topes y de la regla de la racha): sus puntos. */
export const minutosBrutos = (dia) => puntosDe(dia);

/**
 * Estado del tiempo libre de hoy.
 * @param {object} dias  días de todos los dispositivos sumados
 * @param {{ metaDiaria: number }} config
 * @param {string} hoy
 * @param {{ horario?: object, pausas?: object[], tope?: number }} [opciones]
 */
export function estadoJuego(dias, { metaDiaria }, hoy, { horario = null, tope = TOPE_DIA } = {}) {
  const meta = (f) => metaDelDia(f, metaDiaria, horario);
  const cumplio = (f) => meta(f) > 0 ? hechoDe(dias[f]) >= meta(f) : hechoDe(dias[f]) > 0;
  const jugado = (f) => Math.round((dias[f]?.juego ?? 0) / 60);
  // Tu primer día con algo hecho: antes de eso no hay "ayer no cumpliste"
  const primerDia = Object.keys(dias).filter((f) => hechoDe(dias[f]) > 0).sort()[0] ?? hoy;

  /** Tope de un día: más alto sábado y domingo si cumpliste de lunes a viernes. */
  function topeDe(f) {
    if (diaSemana(f) < 5) return tope;
    const lunes = lunesDe(f);
    const semanaPerfecta = [0, 1, 2, 3, 4].every((i) => cumplio(sumarDias(lunes, i)));
    return semanaPerfecta ? Math.max(tope, TOPE_FIN_DE_SEMANA) : tope;
  }

  function calcularDia(f, deuda) {
    const ayerCumplio = f <= primerDia || cumplio(sumarDias(f, -1));
    const bruto = minutosBrutos(dias[f]);
    const topeDia = topeDe(f);
    const ganado = Math.min(topeDia, ayerCumplio ? bruto : Math.floor(bruto / 2));
    const desbloqueado = cumplio(f);
    const pagado = desbloqueado ? Math.min(ganado, deuda) : 0;
    const disponible = desbloqueado ? ganado - pagado : 0;
    const exceso = Math.max(0, jugado(f) - disponible);
    return { bruto, ganado, tope: topeDia, mitad: !ayerCumplio, desbloqueado, pagado, disponible, jugado: jugado(f), exceso, deudaInicial: deuda, deudaFinal: Math.min(TOPE_DEUDA, deuda - pagado + exceso) };
  }

  // La deuda viene arrastrada de los días anteriores
  let deuda = 0;
  for (let f = sumarDias(hoy, -DIAS_HISTORIA); f < hoy; f = sumarDias(f, 1)) deuda = calcularDia(f, deuda).deudaFinal;

  const d = calcularDia(hoy, deuda);
  return {
    ganado: d.ganado,
    tope: d.tope,
    mitad: d.mitad,
    bloqueado: !d.desbloqueado,
    faltaParaDesbloquear: Math.max(0, meta(hoy) - hechoDe(dias[hoy])),
    deuda: d.deudaInicial,
    pagado: d.pagado,
    disponible: d.disponible,
    jugado: d.jugado,
    restante: Math.max(0, d.disponible - d.jugado),
    exceso: d.exceso,
    deudaManana: d.deudaFinal,
    finDeSemanaLargo: d.tope > tope,
  };
}

/** Estudio contra juego de los últimos 7 días (minutos). */
export function estudioContraJuego(dias, hoy) {
  return Array.from({ length: 7 }, (_, i) => sumarDias(hoy, i - 6)).map((fecha) => {
    const d = dias[fecha] ?? {};
    const estudio = Math.round(((d.segundos ?? 0) + (d.lecturasSegundos ?? 0) + (d.leccionesSegundos ?? 0) + (d.inglesSegundos ?? 0)) / 60) + (d.inmersion ?? 0);
    return { fecha, estudio, juego: Math.round((d.juego ?? 0) / 60) };
  });
}

/**
 * Jefe de la semana: el mismo ejercicio que el Reto de la semana de Practicar (así no hay dos retos
 * distintos), mientras no esté resuelto.
 * @param {{ id: string, coleccion: string, nivel: number }[]} ejercicios
 * @param {object} registros
 */
export function jefeDeLaSemana(ejercicios, registros, hoy) {
  const reto = retoDeLaSemana(ejercicios, registros, lunesDe(hoy));
  return reto && registros[reto.id]?.estado !== "resuelto" ? reto : null;
}
