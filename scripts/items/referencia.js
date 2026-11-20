// Ítems que salen de la Referencia offline:
//   opcion/metodo    "¿Qué usarías para esto?" a partir de la descripción de la entrada
//   emparejar        4 entradas de una categoría: nombre <-> qué hace
//   opcion/devuelve  "¿Qué devuelve la línea resaltada?" de las líneas `expr; // resultado` del ejemplo
import { analizarLineas, balance, barajar, enCodigo, mezclarOpciones, normalizar, primeraOracion, slug } from "./util.js";
import { CATEGORIA_A_UNIDAD, unidadDeEntrada } from "./unidades.js";

/**
 * Entradas que se parecen tanto que no pueden ser opciones de la misma pregunta
 * (ni ir en el mismo grupo de emparejar): con la descripción de una, la otra también
 * parecería correcta.
 */
export const CONFUNDIBLES = [
  ["array-from", "array-of", "array-fill"],
  ["array-find", "array-findlast", "array-findindex", "array-indexof"],
  ["array-includes", "array-indexof", "array-some"],
  ["array-sort", "array-tosorted", "array-reverse"],
  ["array-splice", "array-tosorted", "array-slice"],
  ["array-map", "array-flatmap", "array-foreach"],
  ["array-flat", "array-flatmap"],
  ["array-concat", "array-spread"],
  ["array-keys-entries", "array-spread"],
  ["string-slice", "string-substring", "string-at"],
  ["string-includes", "string-indexof", "string-match-test", "string-startswith"],
  ["string-replace", "string-replaceall", "string-normalize"],
  ["string-conversion", "string-template-literals", "string-coercion"],
  ["string-localecompare", "string-comparar"],
  ["string-iterar", "string-split"],
  ["obj-keys", "obj-values", "obj-entries", "obj-fromentries"],
  ["obj-assign", "obj-spread", "obj-structuredclone"],
  ["obj-in", "obj-hasown", "obj-optional-chaining"],
  ["obj-optional-chaining", "obj-nullish"],
  ["obj-json-stringify", "obj-structuredclone"],
  ["num-number", "num-parseint", "num-parsefloat"],
  ["num-isinteger", "num-isnan"],
  ["num-tofixed", "num-redondeo", "num-precision"],
  ["num-max-safe-integer", "num-precision"],
  ["num-typeof", "num-isnan"],
  ["async-new-promise", "async-promise-resolve-reject"],
  ["async-async", "async-await", "async-try-catch-await"],
  ["async-then", "async-catch", "async-finally"],
  ["async-fetch", "async-abortcontroller"],
  ["async-settimeout", "async-setinterval", "async-queuemicrotask"],
  ["dom-queryselector", "dom-queryselectorall", "dom-getelementbyid"],
  ["dom-textcontent", "dom-innerhtml"],
  ["dom-createelement", "dom-append"],
  ["dom-addeventlistener", "dom-removeeventlistener", "dom-delegacion", "dom-eventos-formulario"],
  ["dom-preventdefault", "dom-stoppropagation"],
  ["dom-target-currenttarget", "dom-delegacion"],
  ["dom-classlist", "dom-setattribute-dataset"],
  ["otros-map", "otros-map-iterar", "otros-weakmap", "otros-set"],
  ["otros-class", "otros-class-extends"],
  ["otros-symbol-iterator", "otros-generadores"],
  ["otros-date", "otros-intl-numberformat"],
  ["react-usestate", "react-usereducer", "react-input-controlado"],
  ["react-usememo", "react-usecallback"],
  ["react-useeffect", "react-fetch-useeffect"],
  ["react-eventos", "react-input-controlado"],
  ["react-componente-funcion", "react-props-children", "react-custom-hook"],
];

const confundibles = (a, b) => a === b || CONFUNDIBLES.some((g) => g.includes(a) && g.includes(b));

/** Nombre corto para mostrar: sin `Array.prototype.` ni aclaraciones entre paréntesis. */
export function nombreCorto(nombre) {
  return nombre
    .replace(/\b(Array|String|Number)\.prototype\./g, "")
    .replace(/\s+\([^()]*\)$/, "")
    .trim();
}

// Palabras de código que, si están en el nombre, delatan la respuesta al aparecer en la descripción.
const PALABRAS_DE_CODIGO = new Set([
  "in", "delete", "typeof", "instanceof", "await", "async", "extends", "super", "class", "key", "props",
  "children", "Map", "Set", "WeakMap", "Date", "Symbol", "BigInt", "fetch", "AbortController", "Spread",
  "Destructuring", "Template", "literals", "Optional", "chaining", "Nullish", "coalescing", "hooks", "regex",
  "yield",
]);
// Prefijos de un nombre con punto que no delatan nada por sí solos ("Array" en "Array.isArray").
const PREFIJOS = new Set(["Array", "String", "Number", "Object", "Math", "JSON", "Promise", "console", "document",
  "event", "promesa", "elemento", "regex", "str", "Intl", "window"]);

/** Palabras del nombre de una entrada que no deben aparecer en su pregunta. */
export function palabrasDelNombre(nombre) {
  const corto = nombreCorto(nombre);
  const palabras = new Set();
  for (const m of corto.matchAll(/[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*/g)) {
    const token = m[0];
    const partes = token.split(".");
    const siguiente = corto.slice(m.index + token.length);
    const esLlamada = /^\s*\(/.test(siguiente);
    const esCamel = /^[a-z]+[A-Z]/.test(token) || /^[A-Z][a-z]+[A-Z]/.test(token);
    if (partes.length > 1) {
      palabras.add(token);
      for (const p of partes.slice(1)) palabras.add(p);
      if (!PREFIJOS.has(partes[0])) palabras.add(partes[0]);
    } else if (esLlamada || esCamel || PALABRAS_DE_CODIGO.has(token) || /^use[A-Z]/.test(token)) {
      palabras.add(token);
    }
  }
  return [...palabras].filter((p) => p.length >= 2);
}

const regexPalabra = (p) =>
  new RegExp(`(?<![\\w$])${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w$])`, p.length >= 4 ? "gi" : "g");

/** Reemplaza el nombre de la entrada en un texto por `___`. Devuelve { texto, cambios }. */
export function enmascarar(texto, palabras) {
  let cambios = 0;
  // primero las más largas: "Array.isArray" antes que "isArray"
  for (const p of [...palabras].sort((a, b) => b.length - a.length)) {
    texto = texto.replace(regexPalabra(p), (_, posicion, completo) => {
      cambios++;
      // dentro de código en línea (`...`) va tal cual; fuera, como código en línea
      const dentroDeCodigo = (completo.slice(0, posicion).match(/`/g) ?? []).length % 2 === 1;
      return dentroDeCodigo ? "___" : "`___`";
    });
  }
  return { texto, cambios };
}

const fuenteDe = (e) => ({ tipo: "referencia", id: e.id, titulo: e.nombre });
const explicacionDe = (e) => `**${e.nombre}**: ${e.descripcion}\n\n${enCodigo(e.firma)}`;

/** ¿Qué usarías para esto? Una por entrada, con 3 opciones de la misma categoría. */
export function generarMetodo(entradas) {
  const items = [];
  for (const e of entradas) {
    const unidad = unidadDeEntrada(e);
    if (!unidad) continue;
    const { texto, cambios } = enmascarar(e.descripcion, palabrasDelNombre(e.nombre));
    if (cambios > 3) continue;
    const clave = `metodo:${e.id}`;
    const candidatas = entradas.filter((o) => o.categoria === e.categoria && !confundibles(o.id, e.id));
    const correcta = nombreCorto(e.nombre);
    const distractores = [];
    for (const o of barajar(candidatas, clave)) {
      const n = nombreCorto(o.nombre);
      if ([correcta, ...distractores].some((d) => normalizar(d) === normalizar(n))) continue;
      distractores.push(n);
      if (distractores.length === 3) break;
    }
    if (distractores.length < 3) continue;
    const mezcla = mezclarOpciones(correcta, distractores, clave);
    if (!mezcla) continue;
    items.push({
      clave,
      tipo: "opcion",
      subtipo: "metodo",
      unidad,
      fuente: fuenteDe(e),
      pregunta: `¿Qué usarías para esto?\n\n> ${texto}`,
      ...mezcla,
      explicacion: explicacionDe(e),
    });
  }
  return items;
}

/** Descripción corta para emparejar, o null si es muy larga o nombra la respuesta. */
export function descripcionCorta(entrada) {
  const corta = primeraOracion(entrada.descripcion);
  if (corta.length > 90) return null;
  if (enmascarar(corta, palabrasDelNombre(entrada.nombre)).cambios > 0) return null;
  return corta;
}

/** Grupos fijos de 4 entradas por categoría (sin dos confundibles en el mismo grupo). */
export function generarEmparejar(entradas) {
  const items = [];
  const categorias = [...new Set(entradas.map((e) => e.categoria))];
  for (const categoria of categorias) {
    const unidadCategoria = CATEGORIA_A_UNIDAD[categoria];
    if (!unidadCategoria) continue;
    // juntamos primero las de la misma unidad, para que cada grupo sea de un solo tema
    const candidatas = entradas.filter((e) => e.categoria === categoria && descripcionCorta(e));
    const unidades = [...new Set(candidatas.map(unidadDeEntrada))];
    candidatas.sort((a, b) => unidades.indexOf(unidadDeEntrada(a)) - unidades.indexOf(unidadDeEntrada(b)));
    const grupos = [];
    for (const e of candidatas) {
      const der = descripcionCorta(e);
      let grupo = grupos.find(
        (g) =>
          g.length < 4 &&
          g.every((o) => !confundibles(o.id, e.id) && normalizar(descripcionCorta(o)) !== normalizar(der)),
      );
      if (!grupo) grupos.push((grupo = []));
      grupo.push(e);
    }
    grupos
      .filter((g) => g.length === 4)
      .forEach((g, n) => {
        const conteo = {};
        for (const e of g) conteo[unidadDeEntrada(e)] = (conteo[unidadDeEntrada(e)] ?? 0) + 1;
        const unidad = Object.keys(conteo).sort((a, b) => conteo[b] - conteo[a])[0];
        items.push({
          clave: `par:${slug(categoria)}:${n}`,
          tipo: "emparejar",
          unidad,
          fuente: { tipo: "referencia", id: g[0].id, titulo: categoria },
          pares: g.map((e) => ({ izq: nombreCorto(e.nombre), der: descripcionCorta(e) })),
          explicacion: g.map((e) => `- **${nombreCorto(e.nombre)}**: ${e.descripcion}`).join("\n"),
        });
      });
  }
  return items;
}

// --- ¿Qué devuelve? ---

/** Tipo de un valor escrito en un comentario de resultado. */
export function tipoValor(v) {
  if (/^-?(\d[\d_]*(\.\d+)?(e[+-]?\d+)?|\.\d+|NaN|Infinity)$/.test(v)) return "numero";
  if (/^-?\d+n$/.test(v)) return "bigint";
  if (v === "true" || v === "false") return "booleano";
  if (v === "undefined" || v === "null") return "nulo";
  if (/^"[^"]*"$/.test(v) || /^'[^']*'$/.test(v)) return "string";
  if (/^\[.*\]$/.test(v)) return "arreglo";
  if (/^\{.*\}$/.test(v)) return "objeto";
  if (/^[A-Z]\w*Error$/.test(v)) return "error";
  if (/^Promise \{.*\}$/.test(v)) return "promesa";
  return "texto";
}

/** Separa "7 (7 huecos vacíos)" en { respuesta: "7", aclaracion: "7 huecos vacíos" }. */
export function separarAclaracion(comentario) {
  const m = comentario.match(/^(.+?)\s+\(([^()]+)\)$/);
  if (m && tipoValor(m[1].trim()) !== "texto") return { respuesta: m[1].trim(), aclaracion: m[2].trim() };
  return { respuesta: comentario.trim(), aclaracion: null };
}

const NO_EXPRESION = /^(const|let|var|function|class|for|if|else|while|do|import|export|return|await|try|catch|finally|switch|async|throw)\b/;

/** Parte los argumentos de una llamada en el nivel superior: "a, f(b, c)" -> 2. */
function cantidadArgumentos(texto) {
  let nivel = 0;
  let n = texto.trim() ? 1 : 0;
  for (const c of texto) {
    if ("([{".includes(c)) nivel++;
    else if (")]}".includes(c)) nivel--;
    else if (c === "," && nivel === 0) n++;
  }
  return n;
}

/** Líneas `expr; // resultado` de un ejemplo que sirven para preguntar. */
export function lineasConResultado(ejemplo) {
  const lineas = analizarLineas(ejemplo);
  const resultado = [];
  let nivel = 0;
  let anterior = ""; // última línea con código
  lineas.forEach((l, idx) => {
    const nivelAntes = nivel;
    nivel += balance(l.codigo);
    const codigo = l.codigo.trim();
    const continua = anterior && !/[;}]$/.test(anterior);
    if (codigo) anterior = codigo;
    if (!l.comentario || !codigo || nivelAntes !== 0 || continua) return;
    if (!codigo.endsWith(";") || balance(codigo) !== 0) return;
    const expr = codigo.slice(0, -1).trim();
    if (expr.includes(";") || NO_EXPRESION.test(expr)) return;
    let esLog = false;
    const log = sinStringsLigero(expr).match(/^console\.log\((.*)\)$/);
    if (log) {
      const argumento = expr.slice("console.log(".length, -1);
      if (cantidadArgumentos(sinStringsLigero(argumento)) !== 1) return;
      if (/^(["'`]).*\1$/.test(argumento.trim())) return; // imprime un texto fijo: trivial
      esLog = true;
    } else if (/console\.|setTimeout|setInterval|\.then\(|fetch\(/.test(expr)) return;
    const { respuesta, aclaracion } = separarAclaracion(l.comentario);
    if (respuesta.length > 40) return;
    const tipo = tipoValor(respuesta);
    if (tipo === "texto" && !esLog) return;
    resultado.push({ idx, expr, respuesta, aclaracion, tipo, esLog });
  });
  return resultado;
}

const sinStringsLigero = (t) =>
  t.replace(/"(?:[^"\\]|\\.)*"/g, '""').replace(/'(?:[^'\\]|\\.)*'/g, "''").replace(/`(?:[^`\\]|\\.)*`/g, "``");

const FAMILIA = { numero: "numero", bigint: "numero", string: "string", arreglo: "arreglo", objeto: "objeto" };

/** Números vecinos (n - 1 y n + 1) para usar de distractores. */
function vecinos(v, tipo) {
  if (tipo === "bigint") {
    const n = BigInt(v.slice(0, -1));
    return [`${n - 1n}n`, `${n + 1n}n`];
  }
  const n = Number(v);
  if (!Number.isInteger(n) || Math.abs(n) > 1e9) return [];
  return [String(n - 1), String(n + 1)];
}

const TIPOS_TYPEOF = ['"array"', '"object"', '"number"', '"string"', '"undefined"', '"boolean"', '"function"', '"null"'];

/** Valores literales que aparecen en el código mostrado (buenos distractores: "lo que había antes"). */
export function literalesDelCodigo(codigo) {
  const sinComentarios = analizarLineas(codigo).map((l) => l.codigo).join("\n");
  const valores = [];
  for (const m of sinComentarios.matchAll(/"[^"\n]*"|'[^'\n]*'/g)) {
    if (!/^.[^\p{L}\p{N}]?.$/u.test(m[0]) || m[0].length === 2) valores.push(m[0]); // no "-" ni "+" sueltos
  }
  const sinTextos = sinComentarios.replace(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g, '""');
  for (const m of sinTextos.matchAll(/(?<![\w$.])-?\d+(\.\d+)?(?![\w.])/g)) valores.push(m[0]);
  for (const m of sinComentarios.matchAll(/\[[^[\]\n]*\]/g)) valores.push(m[0]);
  for (const m of sinComentarios.matchAll(/\{[^{}\n]*\}/g)) if (/^\{\s*([\w"']+\s*:|\})/.test(m[0])) valores.push(m[0]);
  return valores.filter((v) => v.length <= 40);
}

/** Elige 3 distractores para un resultado, o null si no hay suficientes y buenos. */
export function distractoresDevuelve(caso, delEjemplo, deLaCategoria, semilla, codigo = "") {
  const comparar = (t) => (caso.esLog ? normalizar(t).replace(/["']/g, "") : normalizar(t));
  const usados = new Set([comparar(caso.respuesta)]);
  const elegidos = [];
  const tomar = (lista) => {
    for (const v of lista) {
      if (elegidos.length === 3) return;
      const k = comparar(v);
      if (usados.has(k)) continue;
      usados.add(k);
      elegidos.push(v);
    }
  };
  const valores = (lista, filtro) => lista.filter((c) => filtro(c)).map((c) => c.respuesta);
  const r = (lista, extra) => barajar(lista, semilla + extra);

  if (caso.tipo === "booleano") {
    tomar([caso.respuesta === "true" ? "false" : "true", "undefined", "null"]);
  } else if (/^typeof\b/.test(caso.expr) && caso.tipo === "string") {
    tomar(r(TIPOS_TYPEOF, ":typeof"));
  } else if (caso.tipo === "nulo" || caso.tipo === "error") {
    tomar(r(valores(delEjemplo, () => true), ":ej"));
    tomar(caso.tipo === "nulo" ? [caso.respuesta === "null" ? "undefined" : "null"] : ["undefined"]);
    tomar(r(valores(deLaCategoria, (c) => c.tipo === caso.tipo), ":cat"));
  } else if (FAMILIA[caso.tipo]) {
    const mismaFamilia = (c) => FAMILIA[c.tipo] === FAMILIA[caso.tipo];
    tomar(r(valores(delEjemplo, mismaFamilia), ":ej").slice(0, 2));
    const literales = literalesDelCodigo(codigo).filter((v) => FAMILIA[tipoValor(v)] === FAMILIA[caso.tipo]);
    tomar(r(literales, ":lit").slice(0, 2));
    if (FAMILIA[caso.tipo] === "numero") tomar(r(vecinos(caso.respuesta, caso.tipo), ":vec"));
    tomar(r(valores(delEjemplo, mismaFamilia), ":ej"));
    tomar(r(valores(deLaCategoria, mismaFamilia), ":cat"));
    // vacíos del mismo tipo: un error típico es creer que el resultado queda vacío
    const vacio = { arreglo: "[]", objeto: "{}", string: '""' }[caso.tipo];
    if (vacio) tomar([vacio]);
    if (elegidos.length < 3) tomar(["undefined"]);
  } else if (caso.tipo === "promesa") {
    tomar(r(valores(delEjemplo, () => true), ":ej"));
    tomar(["undefined"]);
  } else {
    // texto impreso: solo otros textos del mismo ejemplo
    tomar(r(valores(delEjemplo, (c) => c.tipo === "texto"), ":ej"));
  }
  return elegidos.length === 3 ? elegidos : null;
}

/** Líneas revisadas a mano que no se pueden responder solo con el código que se muestra. */
export const DEVUELVE_DESCARTADOS = new Set([
  "ref:dom-queryselectorall:1", // cuántos .item hay depende del HTML de la página, que no se ve
]);

const comoOpcion = (v) => (tipoValor(v) === "error" ? `Lanza ${enCodigo(v)}` : enCodigo(v));

/** ¿Qué devuelve la línea resaltada? */
export function generarDevuelve(entradas) {
  const items = [];
  const casosPorEntrada = new Map(entradas.map((e) => [e.id, lineasConResultado(e.ejemplo)]));
  for (const e of entradas) {
    const unidad = unidadDeEntrada(e);
    if (!unidad) continue;
    const delEjemplo = casosPorEntrada.get(e.id);
    const deLaCategoria = entradas
      .filter((o) => o.categoria === e.categoria && o.id !== e.id)
      .flatMap((o) => casosPorEntrada.get(o.id));
    const lineas = e.ejemplo.replace(/\r/g, "").split("\n");
    const lineasLimpias = analizarLineas(e.ejemplo);
    for (const caso of delEjemplo) {
      const clave = `ref:${e.id}:${caso.idx}`;
      if (DEVUELVE_DESCARTADOS.has(clave)) continue;
      const otros = delEjemplo.filter((c) => c !== caso);
      const texto = [...lineas.slice(0, caso.idx), lineasLimpias[caso.idx].codigo].join("\n");
      const distractores = distractoresDevuelve(caso, otros, deLaCategoria, clave, texto);
      if (!distractores) continue;
      const correcta = comoOpcion(caso.respuesta);
      const mezcla = mezclarOpciones(correcta, distractores.map(comoOpcion), clave);
      if (!mezcla) continue;
      const resultado =
        caso.tipo === "error" ? `lanza ${enCodigo(caso.respuesta)}` : `da ${enCodigo(caso.respuesta)}`;
      items.push({
        clave,
        tipo: "opcion",
        subtipo: "devuelve",
        unidad,
        fuente: fuenteDe(e),
        pregunta: caso.esLog ? "¿Qué imprime la línea resaltada?" : "¿Qué devuelve la línea resaltada?",
        codigo: { lenguaje: e.categoria === "React" ? "jsx" : "js", texto, marcar: caso.idx },
        ...mezcla,
        explicacion:
          `${enCodigo(caso.expr)} ${resultado}${caso.aclaracion ? ` (${caso.aclaracion})` : ""}.\n\n` +
          // Si la entrada trae el porqué de ESTA línea (campo "porques", por número de línea), va ese;
          // si no, la descripción general del método
          (e.porques?.[caso.idx] ?? explicacionDe(e)),
      });
    }
  }
  return items;
}

/** Todos los ítems de Referencia. */
export function generarReferencia(entradas) {
  return [...generarMetodo(entradas), ...generarEmparejar(entradas), ...generarDevuelve(entradas)];
}
