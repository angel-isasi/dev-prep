// Utilidades compartidas por los generadores de ítems: azar determinista, comparación
// de opciones y limpieza de código (quitar comentarios sin romper strings ni regex).

/** Hash FNV-1a de 32 bits: el mismo texto da siempre el mismo número. */
export function hash(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Generador pseudoaleatorio (mulberry32) a partir de una semilla de texto. */
export function azar(semilla) {
  let a = hash(semilla);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Copia barajada de una lista, siempre igual para la misma semilla. */
export function barajar(lista, semilla) {
  const r = azar(semilla);
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Forma de comparar opciones: sin espacios, sin mayúsculas y con un solo tipo de comilla. */
export const normalizar = (texto) => String(texto).replace(/\s+/g, "").replaceAll("'", '"').toLowerCase();

/** true si dos opciones de la lista son iguales al normalizarlas. */
export function hayRepetidas(opciones) {
  return new Set(opciones.map(normalizar)).size !== opciones.length;
}

/**
 * Arma `{ opciones, correcta }` con la correcta en una posición determinista.
 * Devuelve null si las opciones se repiten.
 */
export function mezclarOpciones(correcta, distractores, semilla) {
  const opciones = barajar([correcta, ...distractores], semilla);
  if (hayRepetidas(opciones)) return null;
  return { opciones, correcta: opciones.indexOf(correcta) };
}

/** Texto como código en línea de markdown (usa doble acento grave si el texto ya tiene uno). */
export const enCodigo = (texto) => (texto.includes("`") ? `\`\` ${texto} \`\`` : `\`${texto}\``);

/** "Map, Set y otros" -> "map-set-y-otros". */
export const slug = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Quita la raya larga de un texto generado (regla de estilo: se usa coma o dos puntos). */
export const sinRaya = (texto) => texto.replaceAll(" — ", ": ").replaceAll("—", ", ");

const ANTES_DE_REGEX = new Set(["", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "~", "^"]);

/**
 * Separa el código de sus comentarios respetando strings, template literals y regex.
 * Devuelve una lista de líneas `{ codigo, comentario }`: `codigo` sin comentarios (con
 * espacios finales recortados) y `comentario` el texto del comentario `//` de esa línea
 * (o null). Los comentarios de bloque se quitan; JSX `{/* ... *\/}` se quita entero.
 */
export function analizarLineas(fuente) {
  const texto = fuente.replace(/\r/g, "");
  const lineas = [{ codigo: "", comentario: null }];
  const actual = () => lineas[lineas.length - 1];
  const emitir = (c) => {
    if (c === "\n") lineas.push({ codigo: "", comentario: null });
    else actual().codigo += c;
  };
  const ultimoSignificativo = () => {
    for (let k = lineas.length - 1; k >= 0; k--) {
      const t = lineas[k].codigo.trimEnd();
      if (t) return t;
    }
    return "";
  };

  let modo = "codigo"; // codigo | ' | " | ` | regex | clase (dentro de [] de una regex)
  let llaves = 0;
  const plantillas = []; // profundidad de llaves al entrar a cada ${ } de un template literal

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    const s = texto[i + 1];
    if (modo === "codigo") {
      if (c === "/" && s === "/") {
        let fin = texto.indexOf("\n", i);
        if (fin === -1) fin = texto.length;
        actual().comentario = texto.slice(i + 2, fin).trim();
        i = fin - 1;
        continue;
      }
      if (c === "/" && s === "*") {
        let fin = texto.indexOf("*/", i + 2);
        if (fin === -1) fin = texto.length;
        const dentro = texto.slice(i, fin + 2);
        // {/* comentario JSX */}: quita también las llaves que lo envuelven
        const previo = actual().codigo;
        const resto = texto.slice(fin + 2);
        if (/\{\s*$/.test(previo) && /^\s*\}/.test(resto)) {
          actual().codigo = previo.replace(/\{\s*$/, "");
          const cierre = resto.indexOf("}");
          for (const ch of dentro) if (ch === "\n") emitir("\n");
          i = fin + 2 + cierre;
          llaves--;
          continue;
        }
        for (const ch of dentro) if (ch === "\n") emitir("\n");
        i = fin + 1;
        continue;
      }
      if (c === "'" || c === '"' || c === "`") {
        modo = c;
        emitir(c);
        continue;
      }
      if (c === "/") {
        const previo = ultimoSignificativo();
        const ultimo = previo.slice(-1);
        if (ANTES_DE_REGEX.has(ultimo) || /\b(return|typeof|case)$/.test(previo)) {
          modo = "regex";
          emitir(c);
          continue;
        }
      }
      if (c === "{") llaves++;
      if (c === "}") {
        llaves--;
        if (plantillas.length && llaves === plantillas[plantillas.length - 1]) {
          plantillas.pop();
          modo = "`";
        }
      }
      emitir(c);
      continue;
    }
    if (modo === "'" || modo === '"') {
      emitir(c);
      if (c === "\\" && s !== undefined && s !== "\n") {
        emitir(s);
        i++;
      } else if (c === modo || c === "\n") modo = "codigo";
      continue;
    }
    if (modo === "`") {
      emitir(c);
      if (c === "\\" && s !== undefined) {
        emitir(s);
        i++;
      } else if (c === "`") modo = "codigo";
      else if (c === "$" && s === "{") {
        emitir(s);
        i++;
        plantillas.push(llaves);
        llaves++;
        modo = "codigo";
      }
      continue;
    }
    if (modo === "regex" || modo === "clase") {
      emitir(c);
      if (c === "\\" && s !== undefined && s !== "\n") {
        emitir(s);
        i++;
      } else if (c === "\n") modo = "codigo";
      else if (modo === "regex" && c === "[") modo = "clase";
      else if (modo === "clase" && c === "]") modo = "regex";
      else if (modo === "regex" && c === "/") modo = "codigo";
    }
  }
  return lineas.map((l) => ({ codigo: l.codigo.trimEnd(), comentario: l.comentario }));
}

/** Código sin comentarios, línea por línea. `vacias`: qué hacer con las líneas que quedan vacías. */
export function codigoSinComentarios(fuente) {
  const originales = fuente.replace(/\r/g, "").split("\n");
  return analizarLineas(fuente).map((l, i) => ({
    texto: l.codigo,
    // una línea que tenía algo y quedó vacía era solo comentario
    eraComentario: l.codigo.trim() === "" && (originales[i] ?? "").trim() !== "",
  }));
}

/** Quita strings, template literals y regex de una línea de código (deja comillas vacías). */
export function sinStrings(codigo) {
  return codigo
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, "``");
}

/** Balance de paréntesis, corchetes y llaves de un trozo de código (sin strings). */
export function balance(codigo) {
  let n = 0;
  for (const c of sinStrings(codigo)) {
    if ("([{".includes(c)) n++;
    else if (")]}".includes(c)) n--;
  }
  return n;
}

/** Sangría (espacios o tabs iniciales) de una línea. */
export const sangria = (linea) => linea.match(/^\s*/)[0];

/** Primera oración de un texto (hasta el primer punto seguido de espacio o fin). */
export function primeraOracion(texto) {
  const limpio = texto.trim();
  // un punto dentro de código en línea (`a.b`) no corta la oración
  let enCodigoEnLinea = false;
  for (let i = 0; i < limpio.length; i++) {
    const c = limpio[i];
    if (c === "`") enCodigoEnLinea = !enCodigoEnLinea;
    if (!enCodigoEnLinea && c === "." && (i === limpio.length - 1 || /\s/.test(limpio[i + 1]))) {
      return limpio.slice(0, i + 1);
    }
  }
  return limpio;
}
