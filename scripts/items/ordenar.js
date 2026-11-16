// Ítems "ordenar": las líneas de una solución corta (4 a 12 líneas de código) desordenadas.
// Se descarta toda solución donde dos líneas se puedan intercambiar sin cambiar lo que hace
// el código (dos `const` independientes, dos props de JSX, dos claves de un objeto, dos métodos
// de una clase...): el ejercicio tendría más de una respuesta correcta.
import { codigoSinComentarios, sangria } from "./util.js";
import { referencias, sentencias } from "./typescript.js";

export const MIN_LINEAS = 4;
export const MAX_LINEAS = 12;

/** Líneas de código de la solución: sin comentarios, sin imports y sin líneas vacías. */
export function lineasDeCodigo(fuente) {
  const lineas = [];
  let enImport = false;
  for (const { texto } of codigoSinComentarios(fuente)) {
    if (!texto.trim()) continue;
    if (enImport || /^\s*import\s/.test(texto)) {
      enImport = !/;\s*$|from\s+["'][^"']+["']\s*;?\s*$/.test(texto) && !/^\s*import\s+["']/.test(texto);
      continue;
    }
    lineas.push(texto);
  }
  return lineas;
}

const MUTAN = /\.(push|pop|shift|unshift|splice|sort|reverse|set|add|delete|clear|fill)\(/;
const base = (lhs) => (lhs.startsWith("this.") ? lhs.match(/^this\.[\w$#]+/)[0] : lhs.match(/^[\w$#]+/)?.[0] ?? lhs);

/** Qué lee y qué escribe una sentencia de una línea. */
export function clasificar(linea) {
  const t = linea.trim();
  if (/^(return|throw|break|continue)\b/.test(t) || /^yield\b/.test(t)) return { tipo: "fin" };
  let m;
  if ((m = t.match(/^if\s*\((.*)\)\s*(return|throw|continue|break)\b(.*)$/))) {
    return { tipo: "salida", lee: referencias(t), escribe: new Set(), cola: `${m[2]}${m[3]}`.trim() };
  }
  if ((m = t.match(/^(?:const|let|var)\s+(.+?)\s*(?::[^=]+)?=\s*(.+);$/))) {
    const nombres = /^[\w$]+$/.test(m[1]) ? [m[1]] : [...m[1].matchAll(/[A-Za-z_$][\w$]*/g)].map((x) => x[0]);
    return { tipo: "decl", lee: referencias(m[2]), escribe: new Set(nombres) };
  }
  if ((m = t.match(/^([\w$#.]+(?:\[[^\]]+\])?)\s*([+\-*/%]?=(?!=)|\+\+|--)\s*(.*);$/))) {
    const lee = referencias(m[3]);
    if (m[2] !== "=") lee.add(base(m[1]));
    for (const r of referencias(m[1].replace(/^[\w$#.]+/, ""))) lee.add(r);
    return { tipo: "asigna", lee, escribe: new Set([base(m[1])]) };
  }
  const escribe = new Set();
  const mut = t.match(new RegExp(`^([\\w$#.]+)${MUTAN.source}`));
  if (mut) escribe.add(base(mut[1]));
  return { tipo: "efecto", lee: referencias(t), escribe };
}

const cruzan = (a, b) => [...a].some((x) => b.has(x));

/** true si dos sentencias de una línea, una tras otra, se pueden intercambiar. */
export function intercambiables(a, b) {
  const x = clasificar(a);
  const y = clasificar(b);
  if (x.tipo === "fin" || y.tipo === "fin") return false;
  if (x.tipo === "efecto" && y.tipo === "efecto") return false;
  if ((x.tipo === "salida" && y.tipo === "efecto") || (x.tipo === "efecto" && y.tipo === "salida")) return false;
  // dos `if (...) return` seguidos: si sus condiciones no se pisan, da igual el orden (y no lo podemos saber)
  if (x.tipo === "salida" && y.tipo === "salida") return true;
  const asignaThis = (c) => c.tipo === "asigna" && [...c.escribe].some((e) => e.startsWith("this."));
  if ((x.tipo === "salida" && asignaThis(y)) || (y.tipo === "salida" && asignaThis(x))) return false;
  return !cruzan(x.escribe, y.lee) && !cruzan(y.escribe, x.lee) && !cruzan(x.escribe, y.escribe);
}

const ATRIBUTO_JSX = /^[A-Za-z][\w-]*(=(\{.*\}|"[^"]*"|'[^']*'))?$/;
const PROPIEDAD = /^([\w$]+|("[^"]+"|'[^']+'|\[[^\]]+\])\s*:.+|[\w$]+\s*:.+|[\w$]+\s*\([^)]*\)\s*\{.*\})\s*,?$/;
const DEFINICION = /^(export\s+)?(async\s+)?function\b|^(static\s+|async\s+|get\s+|set\s+)*#?[\w$]+\s*\([^)]*\)\s*(:\s*[^{]+)?\{$|^(const|let)\s+[\w$]+\s*=\s*(async\s*)?(\([^)]*\)|[\w$]+)\s*(:\s*[^=]+)?=>/;

// Llamadas que, una tras otra, suelen dar igual en cualquier orden: aserciones y rutas distintas
const CALLEE_LIBRE = /^(expect|(app|router)\.(get|post|put|patch|delete))\(/;

/** Revisión línea por línea: dos claves de objeto o dos props de JSX seguidas, con la misma sangría. */
function lineasHermanasIntercambiables(lineas) {
  for (let i = 0; i + 1 < lineas.length; i++) {
    if (sangria(lineas[i]) !== sangria(lineas[i + 1])) continue;
    const a = lineas[i].trim();
    const b = lineas[i + 1].trim();
    if (ATRIBUTO_JSX.test(a) && ATRIBUTO_JSX.test(b)) return true;
    const propiedad = (t) => !t.startsWith("...") && PROPIEDAD.test(t);
    if (propiedad(a) && propiedad(b) && a.endsWith(",")) return true;
    // en una cadena, filtrar y ordenar dan lo mismo en cualquier orden
    const filtra = (t) => /^\.filter\(/.test(t);
    const ordena = (t) => /^\.(sort|toSorted)\(/.test(t);
    if ((filtra(a) && ordena(b)) || (ordena(a) && filtra(b))) return true;
  }
  return false;
}

/** true si en el código hay dos líneas (o bloques) que se puedan intercambiar sin cambiar nada. */
export function hayIntercambiables(lineas) {
  if (lineasHermanasIntercambiables(lineas)) return true;
  if (lineas.some((l) => /^\s*\}\s*else\s+if\b/.test(l))) return true; // cadenas else if: el orden de ramas excluyentes da igual
  return secuenciaConIntercambiables(lineas);
}

function secuenciaConIntercambiables(lineas) {
  // `} else {`, `} catch {`: cada rama es una secuencia aparte
  const ramas = [[]];
  for (const l of lineas) {
    if (/^\s*\}\s*(else|catch|finally)\b/.test(l)) ramas.push([]);
    else ramas[ramas.length - 1].push(l);
  }
  if (ramas.length > 1) return ramas.some(secuenciaConIntercambiables);

  const lista = sentencias(lineas);
  const primera = (s) => s.lineas[0].trim();
  if (lista.filter((s) => /^(case\b|default\s*:)/.test(primera(s))).length >= 2) return true;
  // una función declarada con `function` se puede usar antes de su línea (hoisting): su lugar da igual
  const declaraFuncion = (s) => /^(async\s+)?function\b/.test(primera(s));
  if (lista.length > 1 && lista.some(declaraFuncion) && lista.some((s) => !declaraFuncion(s) && !/^(return|throw)\b/.test(primera(s)))) {
    return true;
  }
  for (let i = 0; i + 1 < lista.length; i++) {
    const a = lista[i];
    const b = lista[i + 1];
    const ta = primera(a);
    const tb = primera(b);
    if (/^else\s+if\b/.test(tb)) return true;
    const ca = ta.match(CALLEE_LIBRE);
    if (ca && tb.startsWith(ca[0])) return true;
    if (a.lineas.length === 1 && b.lineas.length === 1) {
      if (/;$/.test(ta) && /;$/.test(tb) && intercambiables(ta, tb)) return true;
    } else if (DEFINICION.test(ta) && DEFINICION.test(tb)) {
      return true; // dos funciones o métodos seguidos: da igual cuál va primero
    }
  }
  return lista.some((s) => s.lineas.length > 2 && secuenciaConIntercambiables(s.lineas.slice(1, -1)));
}

/**
 * @param {object} p
 * @param {{ id: string, titulo: string }} p.ej
 * @param {string} p.unidad
 * @param {string} p.solucion
 * @param {string} p.lenguaje
 * @param {string|null} p.ideaClave
 * @returns {object[]} cero o un ítem
 */
export function generarOrdenar({ ej, unidad, solucion, lenguaje, ideaClave }) {
  const lineas = lineasDeCodigo(solucion);
  if (lineas.length < MIN_LINEAS || lineas.length > MAX_LINEAS) return [];
  // una sola sentencia de nivel superior (si hay dos funciones, su orden da igual)
  const nivelSuperior = lineas.filter((l) => sangria(l) === "" && !/^[)\]}]/.test(l));
  if (nivelSuperior.length !== 1) return [];
  // en una clase, el orden de campos y métodos da igual
  if (lineas.some((l) => /^\s*(export\s+)?(default\s+)?class\s/.test(l))) return [];
  if (hayIntercambiables(lineas)) return [];
  // si todas las líneas fueran iguales no habría nada que ordenar
  if (new Set(lineas.map((l) => l.trim())).size < 3) return [];
  return [
    {
      clave: `ordenar:${ej.id}`,
      tipo: "ordenar",
      unidad,
      fuente: { tipo: "ejercicio", id: ej.id, titulo: ej.titulo },
      pregunta: `Ordena las líneas de la solución de **${ej.titulo}**.`,
      lenguaje,
      lineas,
      explicacion: ideaClave ? `**Idea clave:** ${ideaClave}` : "Así queda la solución, de arriba hacia abajo.",
    },
  ];
}
