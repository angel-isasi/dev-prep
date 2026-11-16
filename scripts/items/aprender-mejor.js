// Ítems de "Aprender mejor" para las lecciones: Lee y predice, glosario y "¿en qué línea está el error?".

const normal = (t) => String(t ?? "").trim().toLowerCase().replace(/\s+/g, " ");

function azarDe(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  };
}

function barajar(lista, azar) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Lee y predice -> opcion/predice. Solo las preguntas cuya unidad existe.
 * @param {object[]} preguntas  de content/predice
 * @param {Set<string>} unidades ids válidos
 */
export function generarPredice(preguntas, unidades) {
  return preguntas
    .filter((p) => unidades.has(p.unidad))
    .map((p) => ({
      clave: `pred:${p.id}`,
      tipo: "opcion",
      subtipo: "predice",
      unidad: p.unidad,
      fuente: { tipo: "tema", id: p.unidad, titulo: "Lee y predice" },
      pregunta: p.pregunta ?? "¿Qué imprime este código?",
      codigo: { lenguaje: p.lenguaje ?? "js", texto: p.codigo },
      opciones: p.opciones,
      correcta: p.correcta,
      explicacion: p.explicacion,
    }));
}

/**
 * Glosario -> opcion/termino ("¿Qué es un closure?" con 4 definiciones de la misma categoría).
 * Los términos sin unidad no generan ítem (igual se ven en la pantalla Glosario).
 */
export function generarGlosario(categorias, unidades) {
  const items = [];
  for (const cat of categorias) {
    const azar = azarDe(cat.categoria);
    for (const t of cat.terminos) {
      if (!t.unidad || !unidades.has(t.unidad)) continue;
      const otras = barajar(cat.terminos.filter((o) => o !== t && normal(o.definicion) !== normal(t.definicion)), azar).slice(0, 3);
      if (otras.length < 2) continue;
      const opciones = barajar([t.definicion, ...otras.map((o) => o.definicion)], azar);
      items.push({
        clave: `glo:${t.id}`,
        tipo: "opcion",
        subtipo: "termino",
        unidad: t.unidad,
        fuente: { tipo: "glosario", id: t.id, titulo: t.termino },
        pregunta: `¿Qué es **${t.termino}**?`,
        opciones,
        correcta: opciones.indexOf(t.definicion),
        explicacion: `**${t.termino}**${t.en && normal(t.en) !== normal(t.termino) ? ` (en inglés *${t.en}*` : " (se pronuncia"}${t.pron ? ` *${t.pron}*` : ""}): ${t.definicion}${t.entrevista ? `\n\n**En la entrevista:** ${t.entrevista}` : ""}`.replace(" (se pronuncia):", ":").replace(/\(en inglés \*([^*]+)\* \*([^*]+)\*\)/, "(en inglés *$1*, se pronuncia *$2*)").replace(/\(en inglés \*([^*]+)\*:/, "(en inglés *$1*):"),
      });
    }
  }
  return items;
}

/** Líneas que solo abren o cierran bloques: no sirven de distractor. */
const trivial = (l) => !l.trim() || /^[\s{}()[\];,]*$/.test(l) || /^\s*(import|export \{|\/\/)/.test(l);

/**
 * Ejercicio de depurar -> opcion/bug ("¿En qué línea está el error?").
 * @param {{ ej: object, unidad: string, inicio: string, solucion: string, ideaClave: string }} p
 */
export function generarBug({ ej, unidad, inicio, solucion, ideaClave }) {
  const a = inicio.replace(/\r/g, "").trimEnd().split("\n");
  const b = solucion.replace(/\r/g, "").trimEnd().split("\n");
  const malas = a.map((l, i) => (l !== b[i] ? i : -1)).filter((i) => i >= 0);
  if (malas.length === 0 || malas.length > 2) return null;
  const mala = malas[0];
  const azar = azarDe(ej.id);
  const otras = barajar(a.map((_, i) => i).filter((i) => !malas.includes(i) && !trivial(a[i])), azar).slice(0, 3);
  if (otras.length < 2) return null;
  const lineas = barajar([mala, ...otras], azar).sort((x, y) => x - y);
  const texto = (i) => `Línea ${i + 1}: \`${a[i].trim()}\``;
  const opciones = lineas.map(texto);
  return {
    clave: `bug:${ej.id}`,
    tipo: "opcion",
    subtipo: "bug",
    unidad,
    fuente: { tipo: "ejercicio", id: ej.id, titulo: ej.titulo },
    pregunta: `**${ej.titulo}**: este código tiene un error. ¿En qué línea está?`,
    codigo: { lenguaje: ej.ext, texto: a.map((l, i) => `${String(i + 1).padStart(2, " ")}  ${l}`).join("\n") },
    opciones,
    correcta: opciones.indexOf(texto(mala)),
    explicacion: `Así queda arreglada:\n\n\`\`\`${ej.ext}\n${malas.map((i) => b[i]).join("\n")}\n\`\`\`${ideaClave ? `\n\n${ideaClave}` : ""}`,
  };
}
