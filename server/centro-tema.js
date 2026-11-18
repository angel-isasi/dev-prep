// "El tema como centro": qué material de otras secciones pertenece a un tema de Aprender.
// Los ejercicios, los términos del glosario y los métodos de la Referencia ya traen su unidad;
// las preguntas de entrevista solo traen su categoría (JavaScript, React...), así que aquí se
// eligen las que hablan de este tema por sus palabras clave. Función pura.

/** Categoría de Entrevistas de cada área de Aprender. */
export const CATEGORIA_DE_AREA = { javascript: "JavaScript", react: "React", typescript: "TypeScript", node: "Node.js y SQL" };

// Palabras del título que no distinguen un tema de otro
const VACIAS = new Set(["para", "como", "entre", "desde", "sobre", "tipos", "datos", "basicos", "avanzados", "react", "node", "typescript", "javascript", "propios", "patrones"]);

const normalizar = (texto) =>
  String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Palabras clave de un tema: las de su título y sus términos del glosario (en español y en inglés). */
export function palabrasClave({ titulo, terminos = [] }) {
  const delTitulo = normalizar(titulo)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 4 && !VACIAS.has(p));
  const deTerminos = terminos.flatMap((t) => [normalizar(t.termino), normalizar(t.en)]).filter((p) => p.length >= 4);
  // Sin la "s" final, para que "closures" encuentre "closure" y "promesas", "promesa"
  return [...new Set([...delTitulo, ...deTerminos].map((p) => (p.endsWith("s") && p.length > 4 ? p.slice(0, -1) : p)))];
}

/**
 * Preguntas de entrevista que tocan este tema: de la categoría de su área y que mencionan alguna
 * palabra clave en la pregunta. Primero las que más palabras mencionan.
 * @param {{ id: string, pregunta: string, categoria: string }[]} preguntas
 * @param {{ area: string, titulo: string, terminos?: object[] }} tema
 */
export function preguntasDelTema(preguntas, tema, { limite = 8 } = {}) {
  const categoria = CATEGORIA_DE_AREA[tema.area];
  const claves = palabrasClave(tema);
  if (!categoria || !claves.length) return [];
  return preguntas
    .filter((p) => p.categoria === categoria)
    .map((p) => ({ p, texto: normalizar(p.pregunta) }))
    .map(({ p, texto }) => ({ p, coincidencias: claves.filter((c) => texto.includes(c)).length }))
    .filter((x) => x.coincidencias > 0)
    .sort((a, b) => b.coincidencias - a.coincidencias)
    .slice(0, limite)
    .map((x) => x.p);
}
