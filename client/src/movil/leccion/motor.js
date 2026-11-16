// Motor de las lecciones estilo Duolingo, como funciones puras (sin React ni almacenamiento),
// para poder probarlo con tests. La pantalla (LeccionMovil.jsx) solo lo usa.
//
// Una lección: primero lo que te toca repasar hoy, luego algunos ítems nuevos de tu unidad
// actual, ordenados de reconocer a producir. Lo que fallas vuelve al final de la misma lección.
// La nota de cada ítem alimenta el repaso espaciado (cajas de Leitner, server/progreso-reglas.js).

export const TAMANO = { normal: 10, rapida: 5, errores: 10, quiz: 5, escuchar: 10, nivel: 40, predice: 10, debiles: 10, examen: 20 };
export const MAX_NUEVOS = 4;
export const MAX_ENTREVISTA = 2;
export const XP = { primera: 10, reintento: 5, leccion: 20 };

// De reconocer a producir: emparejar y opción múltiple primero, tarjetas al final.
const ORDEN_TIPO = { emparejar: 0, opcion: 1, hueco: 2, armar: 3, ordenar: 3, tarjeta: 4, entrevista: 5 };

/** Ítems que solo se pueden hacer escuchando (se omiten si el dispositivo no tiene voz en inglés). */
const DE_ESCUCHAR = new Set(["escuchar", "dictado"]);

const vencido = (r, hoy) => !!r && !!r.proximo && r.proximo <= hoy;

/** Número pseudoaleatorio estable a partir de un texto (mismo texto, mismo orden). */
export function semilla(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Variedad: reparte los ítems turnándose entre tipos (quiz, ¿qué devuelve?, emparejar, hueco...),
 * así una lección no sale con seis preguntas del mismo tipo seguidas.
 */
export function intercalarPorTipo(lista) {
  const grupos = new Map();
  for (const it of lista) {
    const tipo = it.subtipo ?? it.tipo;
    if (!grupos.has(tipo)) grupos.set(tipo, []);
    grupos.get(tipo).push(it);
  }
  const colas = [...grupos.values()];
  const resultado = [];
  while (colas.some((c) => c.length)) for (const c of colas) if (c.length) resultado.push(c.shift());
  return resultado;
}

/** Baraja una copia del arreglo con un generador dado. */
export function barajar(lista, azar = Math.random) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Arma la lista de pasos de una lección.
 * @param {object} p
 * @param {object[]} p.items          ítems de items.json
 * @param {object} p.registros        progreso por clave (datos.items)
 * @param {object} p.reportados       claves reportadas (no vuelven a salir)
 * @param {object[]} [p.preguntas]    preguntas de entrevista
 * @param {object} [p.registrosPreguntas]  progreso de entrevista (datos.preguntas)
 * @param {string} p.hoy
 * @param {string} p.unidad           unidad actual
 * @param {"normal"|"rapida"|"errores"|"quiz"|"escuchar"|"nivel"} [p.modo]
 * @param {object[]} [p.unidades]     en orden (para la prueba de nivel)
 * @param {boolean} [p.conVoz]        si es false, no salen los ítems que solo se hacen escuchando
 * @param {() => number} [p.azar]
 * @returns {{ clave: string, tipo: string, item?: object, pregunta?: object }[]}
 */
export function armarLeccion({ items, registros, reportados = {}, preguntas = [], registrosPreguntas = {}, hoy, unidad, modo = "normal", unidades = [], conVoz = true, azar = Math.random }) {
  const tamano = TAMANO[modo] ?? TAMANO.normal;
  const disponibles = items.filter((it) => !reportados[it.clave] && (conVoz || !DE_ESCUCHAR.has(it.subtipo)));
  const paso = (it) => ({ clave: it.clave, tipo: it.tipo, item: it });
  const elegidos = [];
  const ya = new Set();
  const tomar = (lista, max) => {
    for (const it of lista) {
      if (elegidos.length >= tamano || max <= 0) break;
      if (ya.has(it.clave)) continue;
      ya.add(it.clave);
      elegidos.push(paso(it));
      max--;
    }
  };

  if (modo === "errores") {
    // Lo que fallaste la última vez (caja 1), empezando por lo más antiguo.
    const fallados = disponibles
      .filter((it) => registros[it.clave]?.caja === 1)
      .sort((a, b) => (registros[a.clave].proximo ?? "").localeCompare(registros[b.clave].proximo ?? ""));
    tomar(fallados, tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "nivel") {
    // Prueba de nivel: 2 preguntas por unidad, en orden (gramática y vocabulario), sin repetir lo fallado.
    for (const u of unidades) {
      const deU = disponibles.filter((it) => it.unidad === u.id);
      const gramatica = deU.find((it) => it.subtipo === "gramatica") ?? deU.find((it) => it.subtipo === "inversa");
      const palabra = deU.find((it) => it.subtipo === "palabra" && it !== gramatica);
      for (const it of [gramatica, palabra]) if (it && elegidos.length < tamano) elegidos.push(paso(it));
    }
    return elegidos;
  }

  const deUnidad = disponibles.filter((it) => it.unidad === unidad);

  if (modo === "escuchar") {
    // Solo escuchar y dictado: lo que toca repasar, luego lo nuevo de tu unidad, luego lo de antes.
    const oir = disponibles.filter((it) => DE_ESCUCHAR.has(it.subtipo));
    tomar(oir.filter((it) => vencido(registros[it.clave], hoy)), tamano);
    tomar(barajar(oir.filter((it) => it.unidad === unidad && !registros[it.clave]), azar), tamano);
    const posUnidad = new Map(unidades.map((u, i) => [u.id, i]));
    const hasta = posUnidad.get(unidad) ?? Infinity;
    tomar(barajar(oir.filter((it) => (posUnidad.get(it.unidad) ?? 0) <= hasta), azar), tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "examen") {
    // Examen semanal: lo que practicaste desde el lunes (si es poco, los últimos 14 días), sin pistas ni repetir
    const desde = (dias) => {
      const [a, m, d] = hoy.split("-").map(Number);
      const f = new Date(Date.UTC(a, m - 1, d - dias));
      return f.toISOString().slice(0, 10);
    };
    const [a, m, d] = hoy.split("-").map(Number);
    const lunes = desde((new Date(Date.UTC(a, m - 1, d)).getUTCDay() + 6) % 7);
    const vistoDesde = (fecha) => disponibles.filter((it) => (registros[it.clave]?.en ?? "").slice(0, 10) >= fecha && it.tipo !== "tarjeta");
    const semana = vistoDesde(lunes);
    tomar(intercalarPorTipo(barajar(semana.length >= tamano ? semana : vistoDesde(desde(14)), azar)), tamano);
    return elegidos;
  }

  if (modo === "todos") {
    // Un mazo ya elegido (por ejemplo "Mis palabras"): lo que toca repasar, lo nuevo y luego el resto
    tomar(disponibles.filter((it) => vencido(registros[it.clave], hoy)), tamano);
    tomar(barajar(disponibles.filter((it) => !registros[it.clave]), azar), tamano);
    tomar(barajar(disponibles, azar), tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "predice") {
    // Lee y predice: lo que toca repasar y luego lo nuevo, de cualquier tema
    const pred = disponibles.filter((it) => it.subtipo === "predice");
    tomar(pred.filter((it) => vencido(registros[it.clave], hoy)), tamano);
    tomar(barajar(pred.filter((it) => !registros[it.clave]), azar), tamano);
    tomar(barajar(pred, azar), tamano);
    return elegidos;
  }

  if (modo === "debiles") {
    // Entrenamiento de hoy: ítems de tus unidades más flojas (las recibe en "unidades", de la más floja a la menos)
    for (const u of unidades) {
      const deU = disponibles.filter((it) => it.unidad === u.id && (registros[it.clave]?.caja ?? 0) < 3);
      tomar(intercalarPorTipo(barajar(deU, azar)), Math.ceil(tamano / Math.max(1, Math.min(unidades.length, 3))));
      if (elegidos.length >= tamano) break;
    }
    return ordenar(elegidos, azar);
  }

  if (modo === "quiz") {
    tomar(barajar(deUnidad.filter((it) => it.subtipo === "quiz"), azar), tamano);
    return ordenar(elegidos, azar);
  }

  // 1. Tarjetas de entrevista que tocan hoy (solo en la lección normal)
  const entrevista = [];
  if (modo === "normal") {
    const vencidas = preguntas.filter((p) => vencido(registrosPreguntas[p.id], hoy));
    const nuevas = preguntas.filter((p) => !registrosPreguntas[p.id] && !p.personal);
    const lista = vencidas.length ? vencidas : barajar(nuevas, azar).slice(0, 1);
    for (const p of lista.slice(0, MAX_ENTREVISTA)) entrevista.push({ clave: `entrevista:${p.id}`, tipo: "entrevista", pregunta: p });
  }
  const espacio = tamano - entrevista.length;

  // 2. Repasos vencidos de cualquier unidad, los más atrasados primero (dejando lugar para 2 nuevos)
  const repasos = disponibles
    .filter((it) => vencido(registros[it.clave], hoy))
    .sort((a, b) => registros[a.clave].proximo.localeCompare(registros[b.clave].proximo));
  const lugarNuevos = Math.min(2, deUnidad.filter((it) => !registros[it.clave]).length);
  tomar(repasos, espacio - lugarNuevos);

  // 3. Nuevos de la unidad actual (variados: barajados), hasta MAX_NUEVOS
  const nuevos = intercalarPorTipo(barajar(deUnidad.filter((it) => !registros[it.clave]), azar));
  tomar(nuevos, Math.min(MAX_NUEVOS, espacio - elegidos.length));

  // 4. Si sobra lugar: lo menos dominado de la unidad, luego más nuevos
  const menosDominados = deUnidad
    .filter((it) => registros[it.clave] && !ya.has(it.clave))
    .sort((a, b) => (registros[a.clave].caja ?? 0) - (registros[b.clave].caja ?? 0));
  tomar(menosDominados, espacio - elegidos.length);
  tomar(nuevos, espacio - elegidos.length);

  return ordenar([...elegidos, ...entrevista], azar);
}

/** De reconocer a producir; dentro del mismo tipo, mezclado. */
function ordenar(pasos, azar) {
  return barajar(pasos, azar).sort((a, b) => (ORDEN_TIPO[a.tipo] ?? 9) - (ORDEN_TIPO[b.tipo] ?? 9));
}

// --- Sesión: avanza paso a paso y reprograma lo fallado ---

/** Estado inicial de una lección. Se puede guardar como JSON para retomarla. */
export function crearSesion(pasos, { unidad, modo = "normal", hoy, ambito = "programacion", inicio = Date.now() } = {}) {
  return {
    ambito,
    inicio, // para medir cuánto duró (minutos de inglés)
    unaVez: modo === "nivel" || modo === "examen", // en la prueba de nivel y en el examen lo fallado no vuelve
    pasos,
    cola: pasos.map((_, i) => i), // índices de pasos pendientes, en orden
    posicion: 0,
    fallados: [], // índices de pasos que ya fallaste una vez
    notas: {}, // clave -> "sabia" | "dude" | "no"
    xp: 0,
    unidad,
    modo,
    hoy,
  };
}

export const pasoActual = (s) => (s.posicion < s.cola.length ? s.pasos[s.cola[s.posicion]] : null);
export const terminada = (s) => s.posicion >= s.cola.length;
export const avance = (s) => (s.cola.length ? s.posicion / s.cola.length : 1);

/**
 * Registra la respuesta al paso actual y avanza.
 * - Ítems con respuesta correcta o incorrecta: `correcto` (boolean).
 * - Tarjetas (autoevaluación): `nota` ("no" | "dude" | "sabia").
 * @returns {{ sesion: object, nota: string|null }} nota final del ítem si quedó decidida (si no, null: vuelve al final)
 */
export function responder(sesion, { correcto, nota: notaTarjeta }) {
  const indice = sesion.cola[sesion.posicion];
  const paso = sesion.pasos[indice];
  const yaFallado = sesion.fallados.includes(indice);
  let nota = null;
  let xp = 0;
  let cola = sesion.cola;
  let fallados = sesion.fallados;

  if (notaTarjeta) {
    nota = notaTarjeta;
    xp = notaTarjeta === "no" ? 0 : XP.primera;
  } else if (correcto) {
    nota = yaFallado ? "dude" : "sabia";
    xp = yaFallado ? XP.reintento : XP.primera;
  } else if (yaFallado || sesion.unaVez) {
    nota = "no";
  } else {
    // Primer error: vuelve al final de esta misma lección.
    cola = [...cola, indice];
    fallados = [...fallados, indice];
  }

  const notas = nota ? { ...sesion.notas, [paso.clave]: nota } : sesion.notas;
  return { sesion: { ...sesion, cola, fallados, notas, xp: sesion.xp + xp, posicion: sesion.posicion + 1 }, nota };
}

/** Resumen al terminar: aciertos a la primera, XP total (con el bono) y lo que fallaste. */
export function resumen(sesion) {
  const unicos = sesion.pasos.length;
  const sabia = Object.values(sesion.notas).filter((n) => n === "sabia").length;
  const fallados = sesion.pasos.filter((p) => sesion.notas[p.clave] && sesion.notas[p.clave] !== "sabia");
  return { total: unicos, aciertos: sabia, xp: sesion.xp + XP.leccion, fallados };
}

// --- Corrección de cada tipo de ítem ---

const normalizar = (texto) => String(texto).trim().replace(/\s+/g, " ");

/** ¿Las líneas que ordenaste son las correctas? (líneas iguales son intercambiables; la sangría no cuenta) */
export function ordenCorrecto(item, elegidas) {
  if (elegidas.length !== item.lineas.length) return false;
  return elegidas.every((linea, i) => normalizar(linea) === normalizar(item.lineas[i]));
}

/**
 * Resultado de la prueba de nivel: la primera unidad en la que fallaste algo es donde empiezas.
 * @returns {{ porUnidad: Record<string, { aciertos: number, total: number }>, empiezaEn: string|null }}
 */
export function resultadoNivel(sesion, unidades) {
  const porUnidad = {};
  for (const p of sesion.pasos) {
    const r = (porUnidad[p.item.unidad] ??= { aciertos: 0, total: 0 });
    r.total++;
    if (sesion.notas[p.clave] === "sabia") r.aciertos++;
  }
  const primeraFallada = unidades.find((u) => porUnidad[u.id] && porUnidad[u.id].aciertos < porUnidad[u.id].total);
  const ultima = unidades.findLast?.((u) => porUnidad[u.id]) ?? null;
  return { porUnidad, empiezaEn: primeraFallada?.id ?? ultima?.id ?? unidades[0]?.id ?? null };
}

/** Avance de una unidad: cuántos ítems tiene, cuántos viste y cuántos dominas (caja 3 o más). */
export function avanceUnidad(items, registros, unidad) {
  const deUnidad = items.filter((it) => it.unidad === unidad);
  const vistos = deUnidad.filter((it) => registros[it.clave]).length;
  const dominados = deUnidad.filter((it) => (registros[it.clave]?.caja ?? 0) >= 3).length;
  const total = deUnidad.length;
  return { total, vistos, dominados, porcentaje: total ? dominados / total : 0, dominada: total > 0 && dominados / total >= 0.8 };
}
