// "Cuánto avancé", reto de la semana y plan de la semana, como funciones puras.
// Las usa la versión web (client/src/lib/api-movil.js) y se prueban en avance.test.js.
import { sumarDias } from "./progreso-reglas.js";
import { diasEntre } from "./metricas.js";

const fechaDe = (iso) => (iso ? String(iso).slice(0, 10) : null);
const promedio = (lista) => (lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null);
const redondear = (n, d = 1) => (n == null ? null : Math.round(n * 10 ** d) / 10 ** d);

/** Las ventanas que se comparan: los últimos 30 días, hace un mes y hace tres meses. */
export const VENTANAS = [
  { id: "ahora", titulo: "Últimos 30 días", desdeHace: 29, hastaHace: 0 },
  { id: "mes", titulo: "Hace 1 mes", desdeHace: 59, hastaHace: 30 },
  { id: "trimestre", titulo: "Hace 3 meses", desdeHace: 119, hastaHace: 90 },
];

/**
 * Cifras de los ejercicios que resolviste en una ventana de días.
 * @param {object[]} ejercicios  índice (id, nivel)
 * @param {object} registros  progreso de cada ejercicio (resueltoEn, segundosActivos, intentos, pistasVistas)
 */
function cifrasVentana(ejercicios, registros, desde, hasta) {
  const nivel = new Map(ejercicios.map((e) => [e.id, e.nivel ?? 1]));
  const resueltos = Object.entries(registros).filter(([id, r]) => {
    const f = fechaDe(r?.resueltoEn);
    return nivel.has(id) && r?.estado !== "pendiente" && f && f >= desde && f <= hasta;
  });
  const conTiempo = resueltos.filter(([, r]) => (r.segundosActivos ?? 0) > 0);
  return {
    desde,
    hasta,
    resueltos: resueltos.length,
    minutosPorEjercicio: redondear(promedio(conTiempo.map(([, r]) => r.segundosActivos / 60))),
    intentosPorEjercicio: redondear(promedio(resueltos.map(([, r]) => r.intentos ?? 0))),
    pistasPorEjercicio: redondear(promedio(resueltos.map(([, r]) => r.pistasVistas ?? 0))),
    sinPistas: resueltos.length
      ? Math.round((resueltos.filter(([, r]) => !r.pistasVistas && !r.vioSolucion).length / resueltos.length) * 100)
      : null,
    nivelPromedio: redondear(promedio(resueltos.map(([id]) => nivel.get(id)))),
  };
}

/** Cambio en porcentaje de b respecto de a (null si no se puede comparar). */
const cambio = (a, b) => (a == null || b == null || a === 0 ? null : Math.round(((b - a) / a) * 100));

/**
 * Compara cómo resuelves ahora contra hace 1 y 3 meses: velocidad, intentos, pistas y nivel.
 * @param {{ ejercicios: object[], registros: object, hoy: string, primerDia?: string|null }} datos
 * @returns {{ ventanas: object[], frases: string[], suficiente: boolean }}
 */
export function compararAvance({ ejercicios, registros = {}, hoy, primerDia = null }) {
  const ventanas = VENTANAS.map((v) => ({
    ...v,
    ...cifrasVentana(ejercicios, registros, sumarDias(hoy, -v.desdeHace), sumarDias(hoy, -v.hastaHace)),
    // Una ventana anterior a tu primer día no tiene sentido mostrarla
    antesDeEmpezar: primerDia != null && sumarDias(hoy, -v.hastaHace) < primerDia,
  }));
  const [ahora, ...antes] = ventanas;
  const frases = [];
  const base = antes.find((v) => !v.antesDeEmpezar && v.resueltos >= 3);
  if (ahora.resueltos >= 3 && base) {
    const tiempo = cambio(base.minutosPorEjercicio, ahora.minutosPorEjercicio);
    if (tiempo != null && tiempo <= -10) frases.push(`Resuelves un ${-tiempo} % más rápido que ${base.titulo.toLowerCase()}.`);
    if (tiempo != null && tiempo >= 15)
      frases.push(
        `Tardas un ${tiempo} % más que ${base.titulo.toLowerCase()}${ahora.nivelPromedio > base.nivelPromedio ? ", pero con ejercicios más difíciles" : ""}.`,
      );
    const pistas = cambio(base.pistasPorEjercicio, ahora.pistasPorEjercicio);
    if (pistas != null && pistas <= -20) frases.push(`Usas un ${-pistas} % menos pistas por ejercicio.`);
    if (ahora.sinPistas != null && base.sinPistas != null && ahora.sinPistas - base.sinPistas >= 10)
      frases.push(`Ahora resuelves sin pistas el ${ahora.sinPistas} % de los ejercicios (antes, el ${base.sinPistas} %).`);
    if (ahora.nivelPromedio != null && base.nivelPromedio != null && ahora.nivelPromedio - base.nivelPromedio >= 0.3)
      frases.push(`Estás resolviendo ejercicios más difíciles: nivel ${ahora.nivelPromedio} contra ${base.nivelPromedio}.`);
    if (ahora.resueltos > base.resueltos)
      frases.push(`Resolviste ${ahora.resueltos} ejercicios en 30 días; ${base.titulo.toLowerCase()} fueron ${base.resueltos}.`);
  }
  return { ventanas, frases, suficiente: !!(ahora.resueltos >= 3 && base) };
}

// ---------------------------------------------------------------------------
// Reto de la semana
// ---------------------------------------------------------------------------

/** Puntos base por nivel: un reto difícil vale más. */
export const PUNTOS_NIVEL = { 1: 200, 2: 300, 3: 500 };

/** Número estable a partir de un texto (para elegir el mismo reto toda la semana). */
function hash(texto) {
  let h = 2166136261;
  for (const c of texto) h = Math.imul(h ^ c.codePointAt(0), 16777619);
  return h >>> 0;
}

/**
 * El reto de la semana: un ejercicio de las colecciones de retos, nivel 2 o 3, que no resolviste.
 * Es el mismo toda la semana (sale del lunes), en la laptop y en el celular.
 * @param {object[]} ejercicios  índice
 * @param {object} registros  progreso de cada ejercicio
 * @param {string} lunes  "AAAA-MM-DD"
 */
export function retoDeLaSemana(ejercicios, registros, lunes) {
  const candidatos = ejercicios.filter((e) => /\/retos$/.test(e.coleccion) && (e.nivel ?? 1) >= 2);
  const sinResolver = candidatos.filter((e) => registros[e.id]?.estado !== "resuelto");
  const lista = (sinResolver.length ? sinResolver : candidatos).toSorted((a, b) => a.id.localeCompare(b.id));
  return lista.length ? lista[hash(lunes) % lista.length] : null;
}

/**
 * Resultado de tu reto: si no empezaste, si está en curso o cuánto te tomó y cuántos puntos hizo.
 * Los puntos bajan con el tiempo y las pistas; ver la solución lo deja en 0.
 * @param {{ inicio: string, pistasAlEmpezar?: number } | null} reto  lo que guardaste al empezar
 * @param {object} registro  progreso del ejercicio
 * @param {number} nivel
 */
export function resultadoReto(reto, registro, nivel = 2) {
  if (!reto?.inicio) return { estado: "sin-empezar", segundos: 0, pistas: 0, puntos: 0 };
  const pistas = Math.max(0, (registro?.pistasVistas ?? 0) - (reto.pistasAlEmpezar ?? 0));
  const resuelto = registro?.estado === "resuelto" && registro?.resueltoEn && registro.resueltoEn >= reto.inicio;
  if (registro?.vioSolucion && !resuelto) return { estado: "solucion", segundos: 0, pistas, puntos: 0 };
  if (!resuelto) return { estado: "en-curso", segundos: 0, pistas, puntos: 0 };
  const segundos = Math.max(0, Math.round((Date.parse(registro.resueltoEn) - Date.parse(reto.inicio)) / 1000));
  const minutos = segundos / 60;
  const puntos = Math.max(10, Math.round((PUNTOS_NIVEL[nivel] ?? 300) - Math.min(minutos, 90) * 3 - pistas * 40));
  return { estado: "resuelto", segundos, pistas, puntos };
}

/**
 * Tu historial de retos semanales con la marca personal (más puntos).
 * @param {Record<string, { id: string, puntos?: number, segundos?: number }>} historial  por lunes
 */
export function marcaPersonal(historial) {
  const hechos = Object.entries(historial)
    .filter(([, r]) => (r?.puntos ?? 0) > 0)
    .map(([semana, r]) => ({ semana, ...r }));
  const mejor = hechos.reduce((m, r) => (!m || r.puntos > m.puntos ? r : m), null);
  return { mejor, hechos: hechos.length };
}

// ---------------------------------------------------------------------------
// Plan de la semana
// ---------------------------------------------------------------------------

/**
 * Plan de la semana: pocos objetivos concretos, armados con tus puntos débiles.
 * @param {{
 *   debiles: { id: string, titulo: string, area: string, estado: string }[],
 *   errores: { categoria: string, nombre: string, veces: number }[],
 *   ofertas: { tecnologias: { nombre: string, estado: string }[] }[],
 *   reto: object | null,
 *   tarjetasPendientes: number,
 *   meta: number,
 * }} datos
 * @returns {{ id: string, texto: string, detalle: string, a: string }[]}
 */
export function planDeLaSemana({ debiles = [], errores = [], ofertas = [], reto = null, tarjetasPendientes = 0, meta = 2 }) {
  const plan = [];
  plan.push({
    id: "meta",
    texto: `Cumple tu meta 5 de 7 días`,
    detalle: `${meta} por día: la constancia pesa más que un día largo`,
    a: "/practicar",
  });
  for (const u of debiles.slice(0, 2)) {
    plan.push({
      id: `unidad-${u.id}`,
      texto: `Refuerza ${u.titulo}`,
      detalle: `Está en ${u.estado === "rojo" ? "rojo" : "amarillo"} en tu mapa: 2 ejercicios y su lección`,
      a: u.area === "algoritmos" ? "/practicar/lista?coleccion=algoritmos%2Fretos" : `/aprender/${u.id}`,
    });
  }
  if (errores[0])
    plan.push({
      id: `error-${errores[0].categoria}`,
      texto: `Ataca tu error más común: ${errores[0].nombre}`,
      detalle: `Te pasó ${errores[0].veces} veces. Lee su explicación en "Tus errores"`,
      a: "/progreso",
    });
  // Lo que más piden las ofertas que analizaste y todavía no dominas
  const pedidas = new Map();
  for (const o of ofertas)
    for (const t of o.tecnologias ?? []) if (t.estado !== "dominas") pedidas.set(t.nombre, (pedidas.get(t.nombre) ?? 0) + 1);
  const [masPedida] = [...pedidas].sort((a, b) => b[1] - a[1]);
  if (masPedida)
    plan.push({
      id: `oferta-${masPedida[0]}`,
      texto: `Estudia ${masPedida[0]}`,
      detalle: `Lo pidieron ${masPedida[1]} ${masPedida[1] === 1 ? "oferta" : "ofertas"} que analizaste y todavía no lo dominas`,
      a: "/aprender",
    });
  if (reto)
    plan.push({
      id: "reto",
      texto: `Reto de la semana: ${reto.titulo}`,
      detalle: "Con tiempo: intenta batir tu marca",
      a: `/practicar/${reto.id}`,
    });
  if (tarjetasPendientes > 0)
    plan.push({
      id: "tarjetas",
      texto: `Pon al día tus ${tarjetasPendientes} tarjetas de entrevista`,
      detalle: "Unos minutos al día bastan",
      a: "/entrevistas",
    });
  plan.push({
    id: "simulacro",
    texto: "Haz una etapa del simulacro de entrevista",
    detalle: "Aunque sea solo recursos humanos, en voz alta",
    a: "/entrevistas",
  });
  return plan;
}

/** Días entre hoy y el próximo domingo (0 si hoy es domingo), para "quedan N días". */
export const diasHastaDomingo = (hoy, lunes) => Math.max(0, diasEntre(hoy, sumarDias(lunes, 6)));
