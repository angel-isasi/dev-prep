// Separa la teoría de un tema (Markdown) en sus partes para mostrarlas organizadas:
// la frase, los conceptos de "Lo esencial", los errores típicos, la chuleta y las preguntas de entrevista.
// Todos los temas usan las mismas secciones "## ", pero los errores y las preguntas vienen en dos formatos
// (lista numerada o párrafos en negrita); aquí se leen los dos. Si un tema no encaja, devuelve null
// y la pantalla muestra el texto de siempre.

/** Corta un texto en bloques que empiezan con `^marca` (sin mirar dentro de los bloques de código). */
function cortar(texto, esInicio) {
  const partes = [];
  let actual = null;
  let enCodigo = false;
  for (const linea of texto.split("\n")) {
    if (/^\s*```/.test(linea)) enCodigo = !enCodigo;
    if (!enCodigo && esInicio(linea)) {
      actual = [linea];
      partes.push(actual);
    } else if (actual) actual.push(linea);
    else (partes.antes ??= []).push(linea);
  }
  return { antes: (partes.antes ?? []).join("\n").trim(), partes: partes.map((p) => p.join("\n")) };
}

/** Quita la sangría común (los ítems de lista numerada traen 3 espacios delante). */
function sinSangria(texto) {
  const lineas = texto.split("\n");
  const sangria = Math.min(...lineas.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return Number.isFinite(sangria) && sangria > 0 ? lineas.map((l) => l.slice(sangria)).join("\n") : texto;
}

/** Primera línea "1. **Título** resto" o "**1. Título**": devuelve el título y lo que sigue. */
function separarTitulo(bloque) {
  const [primera, ...resto] = bloque.split("\n");
  const m = primera.match(/^(?:-\s+|\d+\.\s+)?\*\*(?:\d+\.\s*)?(.+?)\*\*\s*(.*)$/);
  if (!m) return null;
  const cuerpo = [m[2], sinSangria(resto.join("\n"))].filter((t) => t.trim()).join("\n");
  return { titulo: m[1].trim().replace(/[.:]$/, ""), cuerpo: cuerpo.trim() };
}

function items(texto, esInicio) {
  const { partes } = cortar(texto, esInicio);
  const lista = partes.map(separarTitulo);
  return lista.length && lista.every(Boolean) ? lista : null;
}

export function partesTeoria(markdown) {
  const texto = (markdown ?? "").replace(/\r/g, "");
  const secciones = {};
  for (const bloque of cortar(texto, (l) => l.startsWith("## ")).partes) {
    const [cabecera, ...resto] = bloque.split("\n");
    secciones[cabecera.slice(3).trim()] = resto.join("\n").trim();
  }
  const esencial = secciones["Lo esencial"];
  if (!secciones["En una frase"] || !esencial) return null;

  const { antes: introduccion, partes } = cortar(esencial, (l) => l.startsWith("### "));
  if (partes.length < 2) return null;
  const conceptos = partes.map((p) => {
    const [cabecera, ...resto] = p.split("\n");
    return { titulo: cabecera.slice(4).trim(), cuerpo: resto.join("\n").trim() };
  });

  const errores = secciones["Errores típicos"]
    ? items(secciones["Errores típicos"], (l) => /^(\d+\.\s+\*\*|\*\*\d+\.)/.test(l))
    : [];
  const entrevista = secciones["En la entrevista"]
    ? items(secciones["En la entrevista"], (l) => /^(-\s+)?\*\*/.test(l))
    : [];

  return {
    frase: secciones["En una frase"],
    introduccion,
    conceptos,
    // Si algún bloque no se pudo leer como tarjetas, se muestra entero como texto
    errores: errores ?? [],
    erroresTexto: errores ? "" : secciones["Errores típicos"],
    chuleta: secciones["Chuleta"] ?? "",
    entrevista: entrevista ?? [],
    entrevistaTexto: entrevista ? "" : secciones["En la entrevista"],
  };
}

/**
 * Corta cualquier Markdown en su texto inicial y sus secciones "## ".
 * Cada sección sabe si trae código ancho (líneas largas): esas van a todo el ancho.
 */
export function seccionesDe(markdown) {
  const texto = (markdown ?? "").replace(/\r/g, "");
  const { antes, partes } = cortar(texto, (l) => l.startsWith("## "));
  const secciones = partes.map((p) => {
    const [cabecera, ...resto] = p.split("\n");
    const cuerpo = resto.join("\n").trim();
    const lineasCodigo = [];
    let enCodigo = false;
    for (const l of cuerpo.split("\n")) {
      if (/^\s*```/.test(l)) enCodigo = !enCodigo;
      else if (enCodigo) lineasCodigo.push(l);
    }
    const ancho = Math.max(0, ...lineasCodigo.map((l) => l.length)) > 52 || /^\|/m.test(cuerpo);
    return { titulo: cabecera.slice(3).trim(), cuerpo, ancho };
  });
  return { antes, secciones };
}

/** Las preguntas de "En la entrevista" sueltas (lista o párrafos en negrita); null si no se pueden separar. */
export function preguntasDe(markdown) {
  return items((markdown ?? "").replace(/\r/g, "").trim(), (l) => /^(-\s+)?\*\*/.test(l));
}

/** Las subsecciones "### " de una sección (texto antes y cada una con su título y cuerpo). */
export function subseccionesDe(cuerpo) {
  const { antes, partes } = cortar(cuerpo ?? "", (l) => l.startsWith("### "));
  return {
    antes,
    partes: partes.map((p) => {
      const [cabecera, ...resto] = p.split("\n");
      return { titulo: cabecera.slice(4).trim(), cuerpo: resto.join("\n").trim() };
    }),
  };
}
