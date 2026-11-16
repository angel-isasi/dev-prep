// Ítems "hueco": un método conocido que aparece UNA sola vez en la solución se cambia por ____
// y hay que elegirlo entre 4. Los distractores salen de una tabla de "no equivalentes": ninguno
// deja el código funcionando igual (por eso no hay pares como map/forEach o slice/substring).
import { codigoSinComentarios, enCodigo, mezclarOpciones } from "./util.js";

export const HUECO = "____";
const MAX_LINEAS = 25;
const VENTANA = 8;
const MAX_POR_EJERCICIO = 2;

// path.join(), db.find(), etc. no son los métodos de arreglos o strings que preguntamos
const RECEPTORES_AJENOS = /\b(path|db|app|router|res|req|fs|url|process)$/;
const metodo = (nombre, distractores, descripcion) => ({
  id: nombre,
  evitar: (codigo, indice) => RECEPTORES_AJENOS.test(codigo.slice(Math.max(0, indice - 12), indice)),
  busca: new RegExp(`\\.${nombre}\\(`, "g"),
  respuesta: nombre,
  reemplazar: (texto) => texto.replace(`.${nombre}(`, `.${HUECO}(`),
  distractores,
  descripcion,
});
const estatico = (objeto, nombre, distractores, descripcion, opciones = {}) => ({
  id: `${objeto.toLowerCase()}-${nombre.toLowerCase()}`,
  busca: new RegExp(`\\b${objeto}\\.${nombre}\\(`, "g"),
  respuesta: nombre,
  reemplazar: (texto) => texto.replace(`${objeto}.${nombre}(`, `${objeto}.${HUECO}(`),
  distractores,
  descripcion,
  ...opciones,
});
const completo = (nombre, distractores, descripcion, busca) => ({
  id: nombre.replace(".", "-").toLowerCase(),
  busca,
  respuesta: nombre,
  reemplazar: (texto) => texto.replace(new RegExp(busca.source), HUECO),
  distractores,
  descripcion,
});

/** `Object.keys(x).length` vale lo mismo con values o entries: ahí no sirve como hueco. */
const seguidoDeLength = (codigo, indice) => {
  let nivel = 0;
  for (let i = codigo.indexOf("(", indice); i < codigo.length; i++) {
    if (codigo[i] === "(") nivel++;
    else if (codigo[i] === ")" && --nivel === 0) return /^\s*\.length\b/.test(codigo.slice(i + 1));
  }
  return false;
};

/** Métodos que pueden ser hueco, con sus distractores no equivalentes. */
export const METODOS = [
  metodo("map", ["filter", "find", "some"], "crea un arreglo nuevo con lo que devuelve la función para cada elemento"),
  metodo("filter", ["map", "find", "every"], "se queda solo con los elementos que cumplen la condición"),
  metodo("reduce", ["map", "filter", "some"], "recorre el arreglo acumulando un solo resultado"),
  metodo("find", ["filter", "map", "every"], "devuelve el primer elemento que cumple la condición (o `undefined`)"),
  metodo("some", ["every", "filter", "map"], "devuelve `true` si al menos un elemento cumple la condición"),
  metodo("every", ["some", "filter", "map"], "devuelve `true` solo si todos los elementos cumplen la condición"),
  metodo("includes", ["indexOf", "slice", "concat"], "indica con `true` o `false` si el valor está"),
  // sin splice: `splice(0, n)` o `splice(i)` devuelven lo mismo que `slice` si el original ya no se usa
  metodo("slice", ["split", "concat", "pop"], "copia una parte sin modificar el original"),
  metodo("splice", ["slice", "split", "concat"], "quita o inserta elementos y modifica el arreglo original"),
  metodo("push", ["pop", "shift", "concat"], "agrega al final y modifica el arreglo"),
  metodo("join", ["split", "concat", "slice"], "une los elementos de un arreglo en un solo string"),
  metodo("split", ["join", "slice", "concat"], "corta un string y devuelve un arreglo con los trozos"),
  metodo("trim", ["toUpperCase", "toLowerCase", "split"], "quita los espacios de ambos lados del texto"),
  metodo("toUpperCase", ["toLowerCase", "trim", "split"], "devuelve el texto en mayúsculas"),
  metodo("toLowerCase", ["toUpperCase", "trim", "split"], "devuelve el texto en minúsculas"),
  metodo("sort", ["map", "filter", "find"], "ordena el arreglo (y lo modifica)"),
  estatico("Object", "keys", ["values", "entries", "freeze"], "da un arreglo con los nombres de las propiedades", { evitar: seguidoDeLength }),
  estatico("Object", "values", ["keys", "entries", "freeze"], "da un arreglo con los valores de las propiedades", { evitar: seguidoDeLength }),
  estatico("Object", "entries", ["keys", "values", "freeze"], "da un arreglo de pares `[clave, valor]`", { evitar: seguidoDeLength }),
  estatico("Math", "max", ["min", "abs", "round"], "devuelve el mayor de los números"),
  estatico("Math", "min", ["max", "abs", "round"], "devuelve el menor de los números"),
  // Math.floor y Math.round no van: al probar, ceil/round/floor/abs daban el mismo resultado
  // en los tests (índices enteros, montos sin tercer decimal) o colgaban el ejercicio.
  estatico("Promise", "all", ["race", "any", "resolve"], "espera a que todas las promesas se cumplan y da sus resultados en orden"),
  completo("JSON.parse", ["JSON.stringify", "String", "Object.keys"], "convierte un texto JSON en un valor de JavaScript", /\bJSON\.parse(?=\()/g),
  completo("JSON.stringify", ["JSON.parse", "String", "Object.entries"], "convierte un valor en texto JSON", /\bJSON\.stringify(?=\()/g),
  completo("useState", ["useRef", "useMemo", "useEffect"], "guarda un dato que, al cambiar, vuelve a renderizar el componente", /\buseState(?=\s*[(<])/g),
  completo("useEffect", ["useRef", "useCallback", "useContext"], "corre código después de renderizar (y lo limpia)", /\buseEffect(?=\s*\()/g),
  completo("useRef", ["useState", "useMemo", "useCallback"], "guarda un valor en `.current` sin volver a renderizar", /\buseRef(?=\s*[(<])/g),
  completo("useMemo", ["useEffect", "useRef", "useCallback"], "memoriza el resultado de un cálculo hasta que cambien sus dependencias", /\buseMemo(?=\s*[(<])/g),
];

/**
 * Huecos descartados tras verificarlos: se corrieron los tests del ejercicio con cada distractor
 * en lugar de la respuesta, y alguno también los pasaba (o los tests no distinguen la diferencia).
 * Si agregas contenido, conviene repetir esa prueba con los huecos nuevos.
 */
export const HUECOS_DESCARTADOS = new Set([
  "hueco:js-ej-035:math-min", // Math.abs(limite) también funciona: sobran trabajadores, pero el resultado es igual
  "hueco:alg-reto-058:map", // filter da el mismo resultado con esos datos
  "hueco:mix-005:trim", // los tests no traen espacios: toUpperCase/toLowerCase/split pasan igual
  "hueco:react-ej-032:trim", // ídem
  "hueco:react-ej-024:useref", // useState(null) también deja pasar el test del foco
  "hueco:ts-pr-010:json-stringify", // dentro de un mensaje de error, String() da un texto igual de válido
]);

const DESCRIPCION = new Map(METODOS.map((m) => [m.respuesta, m.descripcion]));
// Descripciones de los distractores que no son métodos de la tabla
const OTRAS = {
  indexOf: "devuelve la posición (o `-1`), no un booleano",
  concat: "une y devuelve uno nuevo, sin modificar el original",
  pop: "quita el último elemento",
  shift: "quita el primer elemento",
  freeze: "congela el objeto y lo devuelve tal cual",
  ceil: "redondea hacia arriba",
  floor: "redondea hacia abajo",
  round: "redondea un solo número al entero más cercano",
  abs: "quita el signo",
  race: "se queda con la primera promesa que termine",
  any: "se queda con la primera promesa que se cumpla",
  resolve: "envuelve el valor en una promesa ya cumplida",
  String: "convierte a texto sin formato JSON",
  "Object.keys": "da los nombres de las propiedades",
  "Object.entries": "da los pares `[clave, valor]`",
  useCallback: "memoriza una función, no la ejecuta",
  useContext: "lee un contexto, no ejecuta nada",
};
const describir = (nombre) => DESCRIPCION.get(nombre) ?? OTRAS[nombre] ?? "";

/** Código de la solución listo para mostrar: sin comentarios, sin imports y sin líneas vacías repetidas. */
export function codigoParaMostrar(fuente) {
  const lineas = [];
  let enImport = false;
  for (const { texto, eraComentario } of codigoSinComentarios(fuente)) {
    if (eraComentario) continue;
    if (enImport || /^\s*import\s/.test(texto)) {
      enImport = !/;\s*$|from\s+["'][^"']+["']\s*;?\s*$/.test(texto) && !/^\s*import\s+["']/.test(texto);
      continue;
    }
    if (!texto.trim() && (!lineas.length || !lineas[lineas.length - 1].trim())) continue;
    lineas.push(texto);
  }
  while (lineas.length && !lineas[lineas.length - 1].trim()) lineas.pop();
  return lineas;
}

const escapar = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @param {object} p
 * @param {{ id: string, titulo: string }} p.ej
 * @param {string} p.unidad
 * @param {string} p.solucion     código de la solución
 * @param {string} p.lenguaje     "js", "jsx", "ts" o "tsx"
 * @param {string|null} p.ideaClave  sección "Idea clave" de explicacion.md
 */
export function generarHuecos({ ej, unidad, solucion, lenguaje, ideaClave }) {
  const lineas = codigoParaMostrar(solucion);
  const codigo = lineas.join("\n");
  const encontrados = [];
  for (const m of METODOS) {
    const apariciones = [...codigo.matchAll(m.busca)];
    if (apariciones.length !== 1) continue;
    if (m.evitar?.(codigo, apariciones[0].index)) continue;
    encontrados.push({ m, indice: apariciones[0].index });
  }
  encontrados.sort((a, b) => a.indice - b.indice);

  const items = [];
  for (const { m, indice } of encontrados) {
    if (items.length >= MAX_POR_EJERCICIO) break;
    const numLinea = codigo.slice(0, indice).split("\n").length - 1;
    const conHueco = [...lineas];
    conHueco[numLinea] = m.reemplazar(conHueco[numLinea]);
    if (!conHueco[numLinea].includes(HUECO)) continue;
    let visibles = conHueco;
    if (conHueco.length > MAX_LINEAS) {
      visibles = conHueco.slice(Math.max(0, numLinea - VENTANA), numLinea + VENTANA + 1);
      while (!visibles[0].trim()) visibles = visibles.slice(1);
      while (!visibles[visibles.length - 1].trim()) visibles = visibles.slice(0, -1);
    }
    const texto = visibles.join("\n");
    // la respuesta no puede quedar a la vista en otra parte del código
    if (new RegExp(`(?<![\\w$])${escapar(m.respuesta)}(?![\\w$])`).test(texto)) continue;
    const clave = `hueco:${ej.id}:${m.id}`;
    if (HUECOS_DESCARTADOS.has(clave)) continue;
    const mezcla = mezclarOpciones(enCodigo(m.respuesta), m.distractores.map(enCodigo), clave);
    if (!mezcla) continue;
    const otras = m.distractores.map((d) => `${enCodigo(d)} ${describir(d)}`).join("; ");
    items.push({
      clave,
      tipo: "hueco",
      unidad,
      fuente: { tipo: "ejercicio", id: ej.id, titulo: ej.titulo },
      pregunta: `Completa la solución de **${ej.titulo}**: ¿qué va en ${enCodigo(HUECO)}?`,
      codigo: { lenguaje, texto },
      ...mezcla,
      explicacion:
        `${enCodigo(m.respuesta)} ${m.descripcion}. Las otras no sirven aquí: ${otras}.` +
        (ideaClave ? `\n\n**Idea clave:** ${ideaClave}` : ""),
    });
  }
  return items;
}
