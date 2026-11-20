// Lo propio de inglés que no son ítems: historias hechas, cofres, unidades legendarias, cofre del día,
// vidas, récord de parejas y el resultado del examen de nivel.
// Se guarda en la colección "inglesExtra" con UN registro por marca ("cofre:en-basico-03", "historia:..."):
// así al sincronizar dos dispositivos no se pisan (gana el más reciente de cada marca, no del bloque entero)
// y "Empezar de cero" lo borra junto con el resto del progreso. Funciones puras: se prueban en extra.test.js.

export const COLECCION_EXTRA = "inglesExtra";
const GRUPOS = { cofre: "cofres", legendaria: "legendarias", historia: "historias", saltada: "saltadas" };
const SUELTOS = ["cofreDiario", "vidas", "parejasRecord", "examen"];

/**
 * Arma el objeto de siempre ({ cofres, legendarias, historias, cofreDiario, vidas, parejasRecord, examen })
 * a partir de los registros de la colección.
 * @param {Record<string, { v: unknown }>} registros  registros vivos (sin borrados)
 */
export function extraDesdeRegistros(registros = {}) {
  const extra = { cofres: {}, legendarias: {}, historias: {}, saltadas: {}, cofreDiario: null, vidas: false, parejasRecord: 0, examen: null };
  for (const [id, r] of Object.entries(registros)) {
    const dos = id.indexOf(":");
    if (dos > 0 && GRUPOS[id.slice(0, dos)]) extra[GRUPOS[id.slice(0, dos)]][id.slice(dos + 1)] = r.v;
    else if (SUELTOS.includes(id)) extra[id] = r.v;
  }
  return extra;
}

/**
 * El formato viejo (un solo ajuste "inglesExtra" con todo adentro) convertido a registros sueltos.
 * @returns {[string, unknown][]} pares id -> valor para guardar
 */
export function registrosDesdeViejo(viejo = {}) {
  const pares = [];
  for (const [prefijo, grupo] of Object.entries(GRUPOS)) for (const [k, v] of Object.entries(viejo[grupo] ?? {})) pares.push([`${prefijo}:${k}`, v]);
  for (const k of SUELTOS) if (viejo[k] !== undefined && viejo[k] !== null) pares.push([k, viejo[k]]);
  return pares;
}
