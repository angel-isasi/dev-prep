// Ítems "opcion/ts": ¿TypeScript lo acepta? ("Compila" o "Da error").
//   Da error: la línea que sigue a cada `// @ts-expect-error <explicación>` de los tests.
//   Compila:  asignaciones tipadas (`const x: T = ...`) y llamadas válidas (`expect(f(...))`) de los mismos tests.
// El código lleva el contexto mínimo para entender la línea: los `type`/`interface` y las
// firmas de funciones y clases de solucion.ts, y las declaraciones de los tests que usa.
import { analizarLineas, balance, barajar, enCodigo, sinStrings } from "./util.js";

export const OPCIONES_TS = ["Compila", "Da error"];
const MAX_CONTEXTO = 25;
const MAX_LINEAS_OBJETIVO = 6;

/** Identificadores que usa un trozo de código (sin propiedades `a.b` ni claves `{ b: 1 }`). */
export function referencias(texto) {
  const limpio = sinStrings(texto);
  const nombres = new Set();
  for (const m of limpio.matchAll(/(?<![\w$.])[A-Za-z_$][\w$]*/g)) {
    const despues = limpio.slice(m.index + m[0].length);
    if (/^\??:/.test(despues)) continue; // clave de objeto, propiedad de un tipo o parámetro tipado
    nombres.add(m[0]);
  }
  return nombres;
}

/** Nombres que declara un `const`/`let` (también con desestructuración). */
function nombresDeclarados(primera) {
  const m = primera.match(/^(?:export\s+)?(?:const|let|var)\s+(.+?)\s*(?::[^=]+)?=/);
  if (!m) return [];
  const patron = m[1];
  if (/^[\w$]+$/.test(patron)) return [patron];
  return [...patron.matchAll(/[A-Za-z_$][\w$]*/g)].map((x) => x[0]);
}

/**
 * Parte líneas de código (ya sin comentarios) en sentencias completas.
 * Devuelve `{ inicio, fin, lineas }` (fin inclusivo).
 */
export function sentencias(lineas, desde = 0, hasta = lineas.length) {
  const resultado = [];
  let i = desde;
  while (i < hasta) {
    if (!lineas[i].trim()) {
      i++;
      continue;
    }
    const inicio = i;
    let nivel = 0;
    for (;;) {
      nivel += balance(lineas[i]);
      i++;
      const ultima = lineas[i - 1].trim();
      let siguiente = i;
      while (siguiente < hasta && !lineas[siguiente].trim()) siguiente++;
      const sigue = siguiente < hasta && /^[|&.?:]/.test(lineas[siguiente].trim());
      const abierta = /([=,(|&?:]|=>)$/.test(ultima);
      if (i >= hasta || (nivel <= 0 && !abierta && !sigue)) break;
    }
    resultado.push({ inicio, fin: i - 1, lineas: lineas.slice(inicio, i) });
  }
  return resultado;
}

/** Firma de una función o método: las líneas hasta la llave que abre el cuerpo, con `{ /* ... *\/ }`. */
function firma(lineas) {
  let parentesis = 0;
  for (let k = 0; k < lineas.length; k++) {
    for (const c of sinStrings(lineas[k])) {
      if (c === "(") parentesis++;
      else if (c === ")") parentesis--;
    }
    const t = lineas[k].trimEnd();
    if (parentesis === 0 && t.endsWith("{")) {
      return [...lineas.slice(0, k), `${t.slice(0, -1).trimEnd()} { /* ... */ }`];
    }
  }
  return null;
}

/** Esqueleto de una clase: propiedades completas y firmas de los métodos. */
function esqueletoClase(lineas) {
  const cabecera = lineas[0].trimEnd();
  if (!cabecera.endsWith("{")) return null;
  const cuerpo = lineas.slice(1, -1);
  const salida = [cabecera];
  for (const s of sentencias(cuerpo)) {
    const primera = s.lineas[0].trim();
    if (s.lineas.length === 1 && primera.endsWith(";")) {
      salida.push(s.lineas[0]);
      continue;
    }
    const f = firma(s.lineas);
    if (!f) return null;
    salida.push(...f);
  }
  salida.push(lineas[lineas.length - 1]);
  return salida;
}

/**
 * Declaraciones de nivel superior de un archivo TypeScript.
 * @param {string[]} lineas  código sin comentarios
 * @param {"solucion"|"test"} origen  en la solución, de funciones y clases solo va la firma
 */
export function declaraciones(lineas, origen) {
  const lista = [];
  for (const s of sentencias(lineas)) {
    const primera = s.lineas[0].trim();
    let m;
    if ((m = primera.match(/^(?:export\s+)?(?:declare\s+)?(?:type|interface)\s+([\w$]+)/))) {
      lista.push({ nombres: [m[1]], lineas: s.lineas, inicio: s.inicio });
    } else if ((m = primera.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\*?\s+([\w$]+)/))) {
      const texto = origen === "solucion" || s.lineas.length > 5 ? firma(s.lineas) : s.lineas;
      if (texto) lista.push({ nombres: [m[1]], lineas: texto, inicio: s.inicio, esFuncion: true });
    } else if ((m = primera.match(/^(?:export\s+)?(?:abstract\s+)?class\s+([\w$]+)/))) {
      const texto = esqueletoClase(s.lineas);
      if (texto) lista.push({ nombres: [m[1]], lineas: texto, inicio: s.inicio });
    } else if (/^(?:export\s+)?(?:const|let)\s/.test(primera)) {
      const nombres = nombresDeclarados(primera);
      let texto = s.lineas;
      if (s.lineas.length > 1 && /=>\s*\{$/.test(s.lineas[0].trim())) texto = firma(s.lineas);
      else if (s.lineas.length > 8) texto = null;
      const esFuncion = /=\s*(async\s*)?(\([^)]*\)|[\w$]+)\s*(:\s*[^=]+)?=>/.test(primera);
      if (texto && nombres.length) lista.push({ nombres, lineas: texto, inicio: s.inicio, esFuncion });
    }
  }
  return lista;
}

/** Bloques `test(...)` / `it(...)` de un archivo de tests: { inicio, fin }. */
function bloquesDeTest(lineas) {
  return sentencias(lineas)
    .filter((s) => /^(test|it)(\.\w+)?\(/.test(s.lineas[0].trim()))
    .map((s) => ({ inicio: s.inicio, fin: s.fin }));
}

/** Declaraciones locales (`const`/`let`) dentro de un test, antes de la línea `hasta`. */
function localesAntes(lineas, bloque, hasta, objetivos) {
  const locales = [];
  let i = bloque.inicio + 1;
  while (i < hasta) {
    const t = lineas[i].trim();
    if (!/^(const|let)\s/.test(t) || /^const\s+probar\s*=/.test(t)) {
      i++;
      continue;
    }
    const s = sentencias(lineas, i, hasta)[0];
    if (!s || s.fin >= hasta || !/;$/.test(s.lineas[s.lineas.length - 1].trim())) {
      i++;
      continue;
    }
    const tocaObjetivo = objetivos.some((o) => o >= s.inicio && o <= s.fin);
    if (!tocaObjetivo) locales.push({ nombres: nombresDeclarados(t), lineas: s.lineas, inicio: s.inicio });
    i = s.fin + 1;
  }
  return locales;
}

/** Nombres que el archivo de tests importa de "./solucion". */
function importadosDeSolucion(fuente) {
  const nombres = new Set();
  for (const m of fuente.matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']\.\/solucion["']/g)) {
    for (const parte of m[1].split(",")) {
      const nombre = parte.replace(/\btype\b/, "").split(/\s+as\s+/).pop().trim();
      if (nombre) nombres.add(nombre);
    }
  }
  return nombres;
}

/**
 * Contexto mínimo para una línea: las declaraciones que usa (y las que usan esas).
 * Devuelve las líneas del contexto o null si falta algo o es muy largo.
 */
function contexto(objetivo, { locales, delTest, deSolucion, importados }) {
  const buscar = (nombre) =>
    [...locales].reverse().find((d) => d.nombres.includes(nombre)) ??
    delTest.find((d) => d.nombres.includes(nombre)) ??
    deSolucion.find((d) => d.nombres.includes(nombre));
  const usadas = new Set();
  const pendientes = [...referencias(objetivo.join("\n"))];
  const vistos = new Set();
  while (pendientes.length) {
    const nombre = pendientes.pop();
    if (vistos.has(nombre)) continue;
    vistos.add(nombre);
    const d = buscar(nombre);
    if (!d) {
      if (importados.has(nombre)) return null; // viene de la solución pero no la encontramos
      continue;
    }
    if (usadas.has(d)) continue;
    usadas.add(d);
    for (const r of referencias(d.lineas.join("\n"))) if (!d.nombres.includes(r)) pendientes.push(r);
  }
  const orden = (lista) => lista.filter((d) => usadas.has(d)).sort((a, b) => a.inicio - b.inicio);
  const grupos = [orden(deSolucion), orden(delTest), orden(locales)].filter((g) => g.length);
  const lineas = [];
  for (const g of grupos) {
    if (lineas.length) lineas.push("");
    for (const d of g) lineas.push(...d.lineas.map(quitarSangriaComun(d.lineas)));
  }
  return lineas.length > MAX_CONTEXTO ? null : lineas;
}

/** Quita la sangría que comparten todas las líneas de un bloque. */
function quitarSangriaComun(lineas) {
  const sangrias = lineas.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length);
  const comun = Math.min(...sangrias);
  return (l) => l.slice(Math.min(comun, l.match(/^\s*/)[0].length));
}

/** Sentencia completa que empieza en la línea `i` (máximo unas pocas líneas). */
function sentenciaDesde(lineas, i) {
  const s = sentencias(lineas, i, Math.min(lineas.length, i + MAX_LINEAS_OBJETIVO + 1))[0];
  if (!s || s.inicio !== i || s.lineas.length > MAX_LINEAS_OBJETIVO) return null;
  if (balance(s.lineas.join("\n")) !== 0) return null;
  return s;
}

/** Nombres que no hace falta declarar: globales de JavaScript, tipos y palabras de TypeScript. */
const GLOBALES = new Set(
  (
    "console JSON Math Number String Boolean Array Object Promise Date Error TypeError Map Set Symbol BigInt RegExp " +
    "undefined null true false NaN Infinity setTimeout clearTimeout setInterval clearInterval document window " +
    "Record Partial Pick Omit Readonly Required ReturnType Parameters Extract Exclude NonNullable Awaited " +
    "string number boolean unknown any never void object keyof typeof new as const let var return if else " +
    "function extends in of readonly type interface this class async await satisfies is instanceof"
  ).split(" "),
);

/** Parámetros de las funciones flecha de un trozo: `(p) => ...`, `(a, b) => ...`, `x => ...`. */
function parametrosDeFlechas(texto) {
  const nombres = new Set();
  const limpio = sinStrings(texto);
  for (const m of limpio.matchAll(/\(([^()]*)\)\s*(?::[^=]*)?=>/g)) {
    for (const p of m[1].split(",")) {
      const nombre = p.trim().match(/^\.{0,3}([A-Za-z_$][\w$]*)/);
      if (nombre) nombres.add(nombre[1]);
    }
  }
  for (const m of limpio.matchAll(/([A-Za-z_$][\w$]*)\s*=>/g)) nombres.add(m[1]);
  return nombres;
}

/** true si entre `desde` y `hasta` solo quedan abiertos envoltorios como `const probar = () => {`. */
function soloEnEnvoltorios(lineas, desde, hasta) {
  const abiertos = [];
  for (let i = desde; i < hasta; i++) {
    const n = balance(lineas[i]);
    if (n > 0) for (let k = 0; k < n; k++) abiertos.push(lineas[i].trim());
    else for (let k = 0; k < -n; k++) abiertos.pop();
  }
  return abiertos.every((t) => /^const\s+probar\s*=\s*\(\)\s*=>\s*\{$/.test(t));
}

const capitalizar = (t) => t.charAt(0).toUpperCase() + t.slice(1);

/** "id es readonly" -> "`id` es readonly" si `id` es un nombre del código; si no, con mayúscula inicial. */
function inicioDelMotivo(motivo, objetivo) {
  const palabra = motivo.match(/^[A-Za-z_$][\w$]*/)?.[0];
  if (palabra && new RegExp(`(?<![\\w$])${palabra}(?![\\w$])`).test(sinStrings(objetivo.join("\n")))) {
    return `\`${palabra}\`${motivo.slice(palabra.length)}`;
  }
  return capitalizar(motivo);
}
const conPunto = (t) => (/[.!?]$/.test(t) ? t : `${t}.`);

/** Llamada `f(...)` completa que empieza en `desde` dentro de `texto`, o null. */
function llamadaCompleta(texto, desde) {
  let nivel = 0;
  let comilla = null;
  for (let i = desde; i < texto.length; i++) {
    const c = texto[i];
    if (comilla) {
      if (c === "\\") i++;
      else if (c === comilla) comilla = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") comilla = c;
    else if (c === "(") nivel++;
    else if (c === ")") {
      nivel--;
      if (nivel === 0) return texto.slice(desde, i + 1);
    }
  }
  return null;
}

/**
 * @param {object} p
 * @param {{ id: string, titulo: string }} p.ej
 * @param {string} p.unidad
 * @param {string} p.tests      contenido de tests.test.ts(x)
 * @param {string} p.solucion   contenido de solucion.ts(x)
 * @param {string} p.lenguaje   "ts" o "tsx"
 */
export function generarTs({ ej, unidad, tests, solucion, lenguaje = "ts" }) {
  const analizadas = analizarLineas(tests);
  const lineas = analizadas.map((l) => l.codigo);
  const deSolucion = declaraciones(
    analizarLineas(solucion).map((l) => l.codigo),
    "solucion",
  );
  const funcionesDeSolucion = new Set(deSolucion.filter((d) => d.esFuncion).flatMap((d) => d.nombres));
  const delTest = declaraciones(lineas, "test");
  const importados = importadosDeSolucion(tests);
  const bloques = bloquesDeTest(lineas);

  // Líneas marcadas con @ts-expect-error
  const errores = [];
  analizadas.forEach((l, i) => {
    const m = l.comentario?.match(/^@ts-expect-error\s*(.*)$/);
    if (!m || l.codigo.trim()) return;
    let j = i + 1;
    while (j < lineas.length && !lineas[j].trim()) j++;
    errores.push({ linea: j, motivo: m[1].trim() });
  });
  const objetivos = errores.map((e) => e.linea);

  const fuente = { tipo: "ejercicio", id: ej.id, titulo: ej.titulo };
  const armar = (linea, objetivo, esError, explicacion) => {
    const bloque = bloques.find((b) => linea > b.inicio && linea <= b.fin);
    if (!bloque) return null;
    // dentro de un if, un for o un callback los tipos cambian (narrowing): sin ese contexto la línea engaña
    if (!soloEnEnvoltorios(lineas, bloque.inicio + 1, linea)) return null;
    const locales = localesAntes(lineas, bloque, linea, objetivos);
    // todo nombre que use la línea tiene que estar declarado en el código que se muestra
    const declarados = new Set([...locales, ...delTest, ...deSolucion].flatMap((d) => d.nombres));
    const propios = parametrosDeFlechas(objetivo.join("\n"));
    for (const d of locales) for (const p of parametrosDeFlechas(d.lineas.join("\n"))) propios.add(p);
    const usados = [...referencias(objetivo.join("\n"))];
    if (usados.some((n) => !declarados.has(n) && !propios.has(n) && !GLOBALES.has(n))) return null;
    const ctx = contexto(objetivo, { locales, delTest, deSolucion, importados });
    if (!ctx) return null;
    const sangria = quitarSangriaComun(objetivo);
    // `return x.y;` suelto se lee raro: se muestra como la expresión sola (el error es el mismo)
    const cuerpo = objetivo.map(sangria).map((l, k) => (k === 0 ? l.replace(/^return\s+/, "") : l));
    const texto = ctx.length ? [...ctx, "", ...cuerpo] : cuerpo;
    return {
      clave: `ts:${ej.id}:${linea}`,
      tipo: "opcion",
      subtipo: "ts",
      unidad,
      fuente,
      pregunta: "¿TypeScript acepta la línea resaltada?",
      codigo: { lenguaje, texto: texto.join("\n"), marcar: ctx.length ? ctx.length + 1 : 0 },
      opciones: OPCIONES_TS,
      correcta: esError ? 1 : 0,
      explicacion,
    };
  };

  const items = [];
  const vistos = new Set();
  for (const e of errores) {
    if (!e.motivo) continue;
    const s = sentenciaDesde(lineas, e.linea);
    if (!s) continue;
    const clave = s.lineas.map((l) => l.trim()).join(" ");
    if (vistos.has(clave)) continue;
    const item = armar(
      e.linea,
      s.lineas,
      true,
      `**Da error.** ${conPunto(inicioDelMotivo(e.motivo, s.lineas))}\n\n` +
        "En los tests, el comentario `// @ts-expect-error` marca esta línea: el test solo pasa si TypeScript la rechaza.",
    );
    if (item) {
      vistos.add(clave);
      items.push(item);
    }
  }

  // Candidatas a "Compila"
  const asignaciones = [];
  const llamadas = [];
  lineas.forEach((codigo, i) => {
    if (objetivos.includes(i) || !bloques.some((b) => i > b.inicio && i <= b.fin)) return;
    const t = codigo.trim();
    if (/\bas\s+(any|unknown)\b|expectTypeOf|@ts-/.test(t)) return;
    let m;
    if ((m = t.match(/^(?:const|let)\s+([\w$]+)\s*:\s*([^=]+?)\s*=\s*(.+);$/)) && balance(t) === 0) {
      asignaciones.push({ linea: i, objetivo: [t], nombre: m[1], tipo: m[2] });
    } else if ((m = t.match(/^expect\(([\w$]+)\(/)) && funcionesDeSolucion.has(m[1])) {
      const llamada = llamadaCompleta(t, "expect(".length);
      if (llamada && llamada.length <= 100) llamadas.push({ linea: i, objetivo: [`${llamada};`], nombre: m[1] });
    }
  });
  const conError = new Set(errores.map((e) => (lineas[e.linea].trim().match(/^([\w$]+)\(/) ?? [])[1]).filter(Boolean));
  // tantas "Compila" como "Da error" (máximo 2), para que no se adivine por costumbre
  const cupo = items.length ? Math.min(2, items.length) : 1;
  const candidatas = [
    ...barajar(asignaciones, `${ej.id}:asig`),
    ...barajar(
      llamadas.filter((c) => conError.has(c.nombre)),
      `${ej.id}:llam`,
    ),
    ...barajar(
      llamadas.filter((c) => !conError.has(c.nombre)),
      `${ej.id}:llam2`,
    ),
  ];
  let compilan = 0;
  for (const c of candidatas) {
    if (compilan >= cupo) break;
    const clave = c.objetivo.join(" ");
    if (vistos.has(clave)) continue;
    const explicacion = c.tipo
      ? `**Compila.** El valor de la derecha encaja con el tipo ${enCodigo(c.tipo)} que se anotó en ${enCodigo(c.nombre)}.`
      : `**Compila.** Los argumentos encajan con los tipos de los parámetros de ${enCodigo(c.nombre)}, así que TypeScript acepta la llamada.`;
    const item = armar(c.linea, c.objetivo, false, explicacion);
    if (!item) continue;
    vistos.add(clave);
    items.push(item);
    compilan++;
  }
  return items.sort((a, b) => Number(a.clave.split(":").pop()) - Number(b.clave.split(":").pop()));
}
