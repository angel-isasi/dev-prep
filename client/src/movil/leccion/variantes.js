// Inglés: cada concepto (palabra, frase...) se pregunta de una forma distinta según cuánto lo dominas.
// Caja 0 (nuevo): reconocerlo. Caja 1: producirlo con ayuda. Caja 2: sin ayuda. Caja 3 o más: cualquier
// forma de nivel 1 en adelante, al azar, para que el repaso no sea siempre igual.
// Funciones puras: se prueban en variantes.test.js.

/**
 * @param {object} item     ítem de items-ingles (con `variantes`) o ítem normal (se devuelve tal cual)
 * @param {object} [registro]  progreso del concepto ({ caja })
 * @param {{ conVoz?: boolean, conMicro?: boolean, azar?: () => number, nivelMinimo?: number, evitar?: string }} [opciones]
 *   nivelMinimo: para el repaso legendario (siempre lo más difícil que haya)
 *   evitar: forma usada la última vez (si hay otra posible, no se repite)
 *   soloVoz: solo formas de escuchar (modo "Solo escuchar")
 * @returns {object} el ítem listo para mostrar: los datos del concepto + los de la variante
 */
export function elegirVariante(item, registro, { conVoz = true, conMicro = false, azar = Math.random, nivelMinimo = 0, evitar, soloVoz = false } = {}) {
  if (!item.variantes) return item;
  const posibles = item.variantes.filter((v) => (conVoz || !v.voz) && (conMicro || !v.micro) && (!soloVoz || v.voz));
  if (!posibles.length) return null;
  // si lo fallaste la última vez, vuelve a la forma más fácil
  const caja = registro?.ultima === "no" ? 0 : (registro?.caja ?? 0);
  const maximo = Math.max(...posibles.map((v) => v.nivel));
  let candidatas;
  if (nivelMinimo > 0) {
    const tope = Math.min(nivelMinimo, maximo);
    candidatas = posibles.filter((v) => v.nivel >= tope);
  } else if (caja >= 3) {
    candidatas = posibles.filter((v) => v.nivel >= 1);
  } else {
    // la de su nivel; si no hay, la más alta por debajo
    const objetivo = Math.max(...posibles.filter((v) => v.nivel <= caja).map((v) => v.nivel), Math.min(...posibles.map((v) => v.nivel)));
    candidatas = posibles.filter((v) => v.nivel === objetivo);
  }
  if (!candidatas.length) candidatas = posibles;
  if (evitar && candidatas.length > 1) candidatas = candidatas.filter((v) => v.forma !== evitar);
  const variante = candidatas[Math.floor(azar() * candidatas.length)];
  const { variantes: _v, tipo: _t, ...concepto } = item;
  return { ...concepto, ...variante };
}

/** Un ejercicio de emparejar armado al vuelo con palabras de la lección (no cuenta para el repaso). */
export function emparejarDe(items, azar = Math.random) {
  const palabras = items.filter((it) => it.concepto === "palabra" && it.es.length <= 40);
  const vistas = new Set();
  const elegidas = [];
  for (const p of [...palabras].sort(() => azar() - 0.5)) {
    const k = p.es.toLowerCase();
    if (vistas.has(k)) continue;
    vistas.add(k);
    elegidas.push(p);
    if (elegidas.length === 4) break;
  }
  if (elegidas.length < 4) return null;
  return {
    clave: `par:${elegidas.map((p) => p.clave).join("+")}`,
    tipo: "emparejar",
    extra: true, // no se califica: es un ejercicio de repaso rápido
    pares: elegidas.map((p) => ({ izq: p.en, der: p.es })),
    explicacion: elegidas.map((p) => `- **${p.en}**: ${p.es}`).join("\n"),
    fuente: elegidas[0].fuente,
  };
}

/**
 * Avance de una unidad de inglés por conceptos:
 * - aprendidos: los acertaste al menos una vez (caja 2 o más, o caja 1 sin haberlo fallado la última vez)
 * - fijados: los recordaste días después (caja 3 o más)
 * - nivel: de 0 a 5, cada nivel es un 20% de aprendidos (como las coronas de un nodo)
 * - leccionesFaltan: cuántas lecciones de unos 6 nuevos faltan para verlos todos
 */
export function avanceConceptos(items, registros, unidad) {
  const deUnidad = items.filter((it) => it.unidad === unidad);
  const total = deUnidad.length;
  const caja = (it) => registros[it.clave]?.caja ?? 0;
  const vistos = deUnidad.filter((it) => registros[it.clave]).length;
  // fallar deja la caja en 1 ("no"), así que caja 1 solo cuenta si la última nota no fue un fallo
  const aprendido = (it) => caja(it) >= 2 || (caja(it) === 1 && registros[it.clave]?.ultima !== "no");
  const aprendidos = deUnidad.filter(aprendido).length;
  const fijados = deUnidad.filter((it) => caja(it) >= 3).length;
  const nivel = total ? Math.floor((aprendidos / total) * 5 + 1e-9) : 0;
  return {
    total,
    vistos,
    aprendidos,
    fijados,
    dominados: fijados,
    nivel,
    porcentaje: total ? aprendidos / total : 0,
    porcentajeFijados: total ? fijados / total : 0,
    completa: total > 0 && aprendidos === total,
    dominada: total > 0 && fijados / total >= 0.8,
    leccionesFaltan: Math.ceil((total - vistos) / 6),
  };
}

/**
 * Que una lección de inglés no sea solo de opción múltiple (pasa al empezar, cuando todo es nuevo):
 * si no hay ningún "armar", una frase pasa a "traducir armando"; y si hay voz y nada se escucha, otra pasa a "escuchar".
 * @param {object[]} pasos      pasos ya armados ({ clave, tipo, item })
 * @param {Map<string, object>} conceptos  clave -> ítem original con sus `variantes`
 */
export function variarPasos(pasos, conceptos, { conVoz = true } = {}) {
  const resultado = [...pasos];
  const cambiar = (forma, yaHay) => {
    if (resultado.some((p) => yaHay(p.item ?? {}))) return;
    const i = resultado.findIndex((p) => {
      const original = conceptos.get(p.clave);
      return original?.concepto === "frase" && p.item?.forma !== forma && !p.convertido && original.variantes?.some((v) => v.forma === forma);
    });
    if (i < 0) return;
    const original = conceptos.get(resultado[i].clave);
    const v = original.variantes.find((x) => x.forma === forma);
    const { variantes: _v, tipo: _t, ...concepto } = original;
    resultado[i] = { ...resultado[i], tipo: v.tipo, item: { ...concepto, ...v }, convertido: true };
  };
  cambiar("traducir", (it) => it.tipo === "armar");
  if (conVoz) cambiar("escuchar", (it) => it.voz || it.subtipo === "escuchar" || it.subtipo === "dictado");
  return resultado;
}
