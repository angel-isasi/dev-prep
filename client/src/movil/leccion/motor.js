// Motor de las lecciones estilo Duolingo, como funciones puras (sin React ni almacenamiento),
// para poder probarlo con tests. La pantalla (LeccionMovil.jsx) solo lo usa.
//
// Una lección: primero lo que te toca repasar hoy, luego algunos ítems nuevos de tu unidad
// actual, ordenados de reconocer a producir. Lo que fallas vuelve al final de la misma lección.
// La nota de cada ítem alimenta el repaso espaciado (cajas de Leitner, server/progreso-reglas.js).

export const TAMANO = { normal: 10, rapida: 5, errores: 10, quiz: 5, escuchar: 10, nivel: 40, predice: 10, debiles: 10, examen: 20, mezcla: 12, legendario: 15, oido: 12, parte: 12, prueba: 12 };
export const MAX_NUEVOS = 4;
export const MAX_ENTREVISTA = 2;
/** En inglés cada concepto es una palabra o frase entera: lecciones de 12 con hasta 6 nuevos. */
export const INGLES = { tamano: 12, nuevos: 6, reservaNuevos: 5 };
export const XP = { primera: 10, reintento: 5, leccion: 20, perfecta: 10, combo: 2 };
/** Vidas (opcional, en inglés): cada error resta una; sin vidas, la lección termina. */
export const VIDAS = 5;
/** Combos que se celebran dentro de la lección. */
export const HITOS_COMBO = [5, 10, 15, 20];

// De reconocer a producir: emparejar y opción múltiple primero, tarjetas al final.
const ORDEN_TIPO = { emparejar: 0, opcion: 1, hueco: 2, armar: 3, ordenar: 3, escribir: 4, hablar: 4, tarjeta: 4, entrevista: 5 };

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
 * @param {(item: object, opciones?: object) => object|null} [p.variante]  en inglés: elige cómo se pregunta cada concepto
 * @returns {{ clave: string, tipo: string, item?: object, pregunta?: object }[]}
 */
export function armarLeccion({ items, registros, reportados = {}, preguntas = [], registrosPreguntas = {}, hoy, unidad, modo = "normal", unidades = [], conVoz = true, azar = Math.random, variante }) {
  const ingles = !!variante;
  const tamano = ingles && modo === "normal" ? INGLES.tamano : (TAMANO[modo] ?? TAMANO.normal);
  const disponibles = items.filter((it) => !reportados[it.clave] && (conVoz || !DE_ESCUCHAR.has(it.subtipo)));
  const opcionesVariante = modo === "legendario" ? { nivelMinimo: 2 } : modo === "escuchar" ? { soloVoz: true } : {};
  const paso = (it) => {
    const mostrado = variante && it.variantes ? variante(it, opcionesVariante) : it;
    return mostrado ? { clave: it.clave, tipo: mostrado.tipo, item: mostrado, ...(ingles && !registros[it.clave] ? { nuevo: true } : {}) } : null;
  };
  const elegidos = [];
  const ya = new Set();
  const tomar = (lista, max) => {
    for (const it of lista) {
      if (elegidos.length >= tamano || max <= 0) break;
      if (ya.has(it.clave)) continue;
      const p = paso(it);
      if (!p) continue;
      ya.add(it.clave);
      elegidos.push(p);
      max--;
    }
  };
  const esDeOir = (it) => DE_ESCUCHAR.has(it.subtipo) || (it.variantes ?? []).some((v) => v.voz);
  const posUnidad = new Map(unidades.map((u, i) => [u.id, i]));
  const hastaActual = (it) => (posUnidad.get(it.unidad) ?? 0) <= (posUnidad.get(unidad) ?? Infinity);

  if (modo === "errores") {
    // Lo que fallaste la última vez, empezando por lo más antiguo. Acertar a la primera también deja la
    // caja en 1, así que cuenta la última nota (los registros viejos sin nota: caja 1).
    const fallados = disponibles
      .filter((it) => registros[it.clave]?.ultima === "no" || (registros[it.clave]?.caja === 1 && !registros[it.clave]?.ultima))
      .sort((a, b) => (registros[a.clave].proximo ?? "").localeCompare(registros[b.clave].proximo ?? ""));
    tomar(fallados, tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "nivel") {
    // Prueba de nivel, en orden de unidades y sin repetir lo fallado. Si caben, 2 preguntas por unidad
    // (gramática y vocabulario); si no, 1 por unidad alternando, para que ninguna unidad quede sin probar.
    const dos = unidades.length * 2 <= tamano;
    const tope = Math.max(tamano, unidades.length);
    unidades.forEach((u, i) => {
      const deU = disponibles.filter((it) => it.unidad === u.id);
      const gramatica = deU.find((it) => it.subtipo === "gramatica") ?? deU.find((it) => it.subtipo === "inversa");
      const palabra = deU.find((it) => (it.subtipo === "palabra" || it.concepto === "palabra") && it !== gramatica);
      const orden = dos ? [gramatica, palabra] : i % 2 ? [palabra ?? gramatica] : [gramatica ?? palabra];
      for (const it of orden) {
        const p = it && elegidos.length < tope ? paso(it) : null;
        if (p) elegidos.push(p);
      }
    });
    return elegidos;
  }

  const deUnidad = disponibles.filter((it) => it.unidad === unidad);

  if (modo === "escuchar") {
    // Solo escuchar y dictado: lo que toca repasar, luego lo nuevo de tu unidad, luego lo de antes.
    const oir = disponibles.filter(esDeOir);
    tomar(oir.filter((it) => vencido(registros[it.clave], hoy)), tamano);
    tomar(barajar(oir.filter((it) => it.unidad === unidad && !registros[it.clave]), azar), tamano);
    tomar(barajar(oir.filter(hastaActual), azar), tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "mezcla") {
    // Repaso que mezcla unidades: lo que ya viste de tu unidad y las anteriores, lo menos fijado primero.
    const vistos = disponibles.filter((it) => registros[it.clave] && hastaActual(it));
    const porUnidad = intercalarPorUnidad(barajar(vistos, azar).sort((a, b) => (registros[a.clave].caja ?? 0) - (registros[b.clave].caja ?? 0)));
    tomar(porUnidad, tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "legendario") {
    // Nivel legendario: lo más difícil de cada concepto de la unidad, sin segunda oportunidad.
    tomar(intercalarPorTipo(barajar(deUnidadDe(disponibles, unidad), azar)), tamano);
    return elegidos;
  }

  if (modo === "oido") {
    // Oído fino: pares mínimos (ship o sheep), lo que toca repasar y luego lo nuevo.
    const pares = disponibles.filter((it) => it.concepto === "par");
    tomar(pares.filter((it) => vencido(registros[it.clave], hoy)), tamano);
    tomar(barajar(pares.filter((it) => !registros[it.clave]), azar), tamano);
    tomar(barajar(pares, azar), tamano);
    return elegidos;
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

  if (modo === "parte") {
    // Una lección fija de una unidad (plan.js): todas sus preguntas, de reconocer a producir
    tomar(intercalarPorTipo(disponibles), tamano);
    return ordenar(elegidos, azar);
  }

  if (modo === "prueba") {
    // Prueba de la unidad: preguntas al azar de toda la unidad, sin tarjetas de autoevaluación ni segunda oportunidad
    tomar(intercalarPorTipo(barajar(deUnidad.filter((it) => it.tipo !== "tarjeta"), azar)), tamano);
    return barajar(elegidos, azar);
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
  const reserva = ingles && modo === "normal" ? INGLES.reservaNuevos : 2;
  const lugarNuevos = Math.min(reserva, deUnidad.filter((it) => !registros[it.clave]).length);
  tomar(repasos, espacio - lugarNuevos);

  // 3. Nuevos de la unidad actual (variados: barajados), hasta MAX_NUEVOS (en inglés, 6)
  const nuevos = intercalarPorTipo(barajar(deUnidad.filter((it) => !registros[it.clave]), azar));
  tomar(nuevos, Math.min(ingles ? INGLES.nuevos : MAX_NUEVOS, espacio - elegidos.length));

  // 4. Si sobra lugar: lo menos dominado de la unidad, luego más nuevos
  const menosDominados = deUnidad
    .filter((it) => registros[it.clave] && !ya.has(it.clave))
    .sort((a, b) => (registros[a.clave].caja ?? 0) - (registros[b.clave].caja ?? 0));
  tomar(menosDominados, espacio - elegidos.length);
  tomar(nuevos, espacio - elegidos.length);

  return ordenar([...elegidos, ...entrevista], azar);
}

const deUnidadDe = (lista, unidad) => lista.filter((it) => it.unidad === unidad);

/** Reparte turnándose entre unidades (para que la mezcla no sea toda de una sola). */
function intercalarPorUnidad(lista) {
  const grupos = new Map();
  for (const it of lista) {
    if (!grupos.has(it.unidad)) grupos.set(it.unidad, []);
    grupos.get(it.unidad).push(it);
  }
  const colas = [...grupos.values()];
  const resultado = [];
  while (colas.some((c) => c.length)) for (const c of colas) if (c.length) resultado.push(c.shift());
  return resultado;
}

/** De reconocer a producir; dentro del mismo tipo, mezclado. */
function ordenar(pasos, azar) {
  return barajar(pasos, azar).sort((a, b) => (ORDEN_TIPO[a.tipo] ?? 9) - (ORDEN_TIPO[b.tipo] ?? 9));
}

// --- Sesión: avanza paso a paso y reprograma lo fallado ---

/** Estado inicial de una lección. Se puede guardar como JSON para retomarla. */
export function crearSesion(pasos, { unidad, modo = "normal", hoy, ambito = "programacion", inicio = Date.now(), vidas = null, parte = null } = {}) {
  return {
    parte, // id de la lección fija de la unidad ("esencial-1"), si es una
    ambito,
    inicio, // para medir cuánto duró (minutos de inglés)
    unaVez: modo === "nivel" || modo === "examen" || modo === "legendario" || modo === "prueba", // aquí lo fallado no vuelve
    vidas: modo === "legendario" ? 3 : vidas, // null: sin vidas
    combo: 0, // aciertos a la primera seguidos
    comboMax: 0,
    saltados: [], // claves que saltaste (por ejemplo, "ahora no puedo hablar")
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
export const terminada = (s) => s.posicion >= s.cola.length || s.vidas === 0;
/** ¿Terminó porque se acabaron las vidas? */
export const sinVidas = (s) => s.vidas === 0 && s.posicion < s.cola.length;
export const avance = (s) => (s.cola.length ? s.posicion / s.cola.length : 1);

/**
 * Registra la respuesta al paso actual y avanza.
 * - Ítems con respuesta correcta o incorrecta: `correcto` (boolean).
 * - Tarjetas (autoevaluación): `nota` ("no" | "dude" | "sabia").
 * @returns {{ sesion: object, nota: string|null }} nota final del ítem si quedó decidida (si no, null: vuelve al final)
 */
export function responder(sesion, { correcto, nota: notaTarjeta, saltar = false }) {
  const indice = sesion.cola[sesion.posicion];
  const paso = sesion.pasos[indice];
  const yaFallado = sesion.fallados.includes(indice);
  let nota = null;
  let xp = 0;
  let cola = sesion.cola;
  let fallados = sesion.fallados;
  let combo = sesion.combo ?? 0;
  let vidas = sesion.vidas ?? null;

  if (saltar) {
    // No cuenta ni a favor ni en contra, y no vuelve.
    return { sesion: { ...sesion, saltados: [...(sesion.saltados ?? []), paso.clave], posicion: sesion.posicion + 1 }, nota: null };
  }
  if (paso.item?.extra) {
    // Ejercicio extra (emparejar al vuelo): da XP y combo, pero no se califica ni vuelve.
    combo = correcto ? combo + 1 : 0;
    if (!correcto && vidas !== null) vidas = Math.max(0, vidas - 1);
    const extras = { ...(sesion.extras ?? {}), [paso.clave]: !!correcto };
    return {
      sesion: { ...sesion, combo, comboMax: Math.max(sesion.comboMax ?? 0, combo), vidas, extras, xp: sesion.xp + (correcto ? XP.primera : 0), posicion: sesion.posicion + 1 },
      nota: null,
    };
  }

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

  if (!notaTarjeta) {
    if (correcto && !yaFallado) {
      combo += 1;
      if (combo >= 5) xp += XP.combo; // bono por racha dentro de la lección
    } else if (!correcto) combo = 0;
    if (!correcto && vidas !== null) vidas = Math.max(0, vidas - 1);
  }
  const notas = nota ? { ...sesion.notas, [paso.clave]: nota } : sesion.notas;
  return { sesion: { ...sesion, cola, fallados, notas, combo, comboMax: Math.max(sesion.comboMax ?? 0, combo), vidas, xp: sesion.xp + xp, posicion: sesion.posicion + 1 }, nota };
}

/** Resumen al terminar: aciertos a la primera, XP total (con el bono) y lo que fallaste. */
export function resumen(sesion) {
  const calificables = sesion.pasos.filter((p) => !p.item?.extra && !(sesion.saltados ?? []).includes(p.clave));
  const unicos = calificables.length;
  const sabia = calificables.filter((p) => sesion.notas[p.clave] === "sabia").length;
  const fallados = calificables.filter((p) => sesion.notas[p.clave] && sesion.notas[p.clave] !== "sabia");
  const extrasMal = Object.values(sesion.extras ?? {}).some((ok) => !ok);
  const cortada = sesion.vidas === 0 && sesion.posicion < sesion.cola.length;
  // Perfecta: todo a la primera, sin cortar por vidas (al menos 5 preguntas)
  const perfecta = !cortada && unicos >= 5 && sabia === unicos && !extrasMal;
  const bono = cortada ? 0 : XP.leccion + (perfecta ? XP.perfecta : 0);
  return { total: unicos, aciertos: sabia, xp: sesion.xp + bono, fallados, perfecta, sinVidas: cortada, comboMax: sesion.comboMax ?? 0 };
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
