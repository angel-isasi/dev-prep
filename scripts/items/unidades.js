// Unidades de las lecciones del celular: un tema de Aprender por unidad, más "algoritmos".
// Aquí se decide a qué unidad va cada ejercicio y cada entrada de Referencia.

/** Orden de estudio de las áreas (algoritmos va después de JavaScript). */
export const ORDEN_AREAS = ["javascript", "algoritmos", "react", "typescript", "node"];

/** Unidad extra, sin teoría: los retos de algoritmos. */
export const UNIDAD_ALGORITMOS = { id: "algoritmos", titulo: "Algoritmos", area: "algoritmos", conTeoria: false };

/** `tema` del meta.json de un ejercicio -> unidad, para los ejercicios que no están en ningún tema. */
export const TEMA_A_UNIDAD = {
  // JavaScript
  variables: "variables-y-tipos",
  strings: "variables-y-tipos",
  condicionales: "condicionales-y-bucles",
  funciones: "funciones",
  iteradores: "funciones",
  arrays: "arrays",
  objetos: "objetos",
  closures: "closures-y-scope",
  this: "this",
  clases: "this",
  asincronia: "promesas-y-async",
  dom: "dom-y-eventos",
  testing: "funciones", // "Escribe tú los tests": se prueban funciones, cuentan para esa unidad
  algoritmos: "algoritmos",
  // React
  "react-componentes": "react-jsx-y-componentes",
  "react-estado": "react-estado-y-eventos",
  "react-listas": "react-listas-y-condicionales",
  "react-formularios": "react-formularios",
  "react-efectos": "react-efectos-y-datos",
  "react-hooks": "react-hooks-avanzados",
  "react-patrones": "react-hooks-propios-y-patrones",
  // TypeScript
  "ts-basicos": "ts-tipos-basicos",
  "ts-objetos": "ts-objetos-e-interfaces",
  "ts-uniones": "ts-uniones-y-narrowing",
  "ts-funciones": "ts-funciones",
  "ts-genericos": "ts-genericos",
  "ts-utility": "ts-utility-types",
  "ts-clases": "ts-clases-y-modulos",
  "ts-react": "ts-react-con-typescript",
  // Node
  "node-modulos": "node-que-es-node",
  "node-archivos": "node-archivos",
  "node-async": "node-asincronia-y-eventos",
  "node-express": "node-http-y-express",
  "node-middlewares": "node-middlewares-y-errores",
  "sql-consultas": "node-sql-consultas",
  "sql-joins": "node-sql-joins",
  "sql-escritura": "node-sql-escritura",
};

/** Categoría de Referencia -> unidad. */
export const CATEGORIA_A_UNIDAD = {
  Arrays: "arrays",
  Strings: "variables-y-tipos",
  "Objetos y JSON": "objetos",
  "Números y Math": "variables-y-tipos",
  "Promesas y async": "promesas-y-async",
  "DOM y eventos": "dom-y-eventos",
  "Map, Set y otros": "objetos",
  React: "react-hooks-avanzados",
};

/**
 * Excepciones por entrada de Referencia, cuando su categoría es muy amplia y la entrada
 * encaja claramente en otra unidad (por ejemplo, useState va con "Estado y eventos").
 */
export const ENTRADA_A_UNIDAD = {
  "array-map": "metodos-de-array",
  "array-filter": "metodos-de-array",
  "array-reduce": "metodos-de-array",
  "array-find": "metodos-de-array",
  "array-findindex": "metodos-de-array",
  "array-findlast": "metodos-de-array",
  "array-some": "metodos-de-array",
  "array-every": "metodos-de-array",
  "array-foreach": "metodos-de-array",
  "array-flatmap": "metodos-de-array",
  "otros-class": "this",
  "otros-class-extends": "this",
  "otros-symbol-iterator": "funciones",
  "otros-generadores": "funciones",
  "react-componente-funcion": "react-jsx-y-componentes",
  "react-props-children": "react-props-y-children",
  "react-usestate": "react-estado-y-eventos",
  "react-eventos": "react-estado-y-eventos",
  "react-key": "react-listas-y-condicionales",
  "react-condicional": "react-listas-y-condicionales",
  "react-input-controlado": "react-formularios",
  "react-useeffect": "react-efectos-y-datos",
  "react-fetch-useeffect": "react-efectos-y-datos",
  "react-custom-hook": "react-hooks-propios-y-patrones",
};

/**
 * Lista de unidades en orden de estudio: javascript, algoritmos, react, typescript, node.
 * @param {{ id: string, titulo: string, area: string, orden?: number }[]} temas
 * @returns {{ id: string, titulo: string, area: string, orden: number, conTeoria: boolean }[]}
 */
export function crearUnidades(temas) {
  const lista = [
    ...temas.map((t) => ({ id: t.id, titulo: t.titulo, area: t.area ?? "javascript", ordenTema: t.orden ?? 99, conTeoria: true })),
    { ...UNIDAD_ALGORITMOS, ordenTema: 0 },
  ];
  const posArea = (a) => {
    const i = ORDEN_AREAS.indexOf(a);
    return i === -1 ? ORDEN_AREAS.length : i;
  };
  lista.sort((a, b) => posArea(a.area) - posArea(b.area) || a.ordenTema - b.ordenTema);
  return lista.map(({ ordenTema, ...u }, i) => ({ ...u, orden: i + 1 }));
}

/**
 * Unidad de un ejercicio: el tema que lo lista en `ejercicios` o, si ninguno, su `tema`.
 * @returns {string|null} id de la unidad (null si no tiene)
 */
export function unidadDeEjercicio(ej, temas) {
  const tema = temas.find((t) => (t.ejercicios ?? []).includes(ej.id));
  if (tema) return tema.id;
  return TEMA_A_UNIDAD[ej.tema] ?? null;
}

/** Unidad de una entrada de Referencia (por su id o, si no, por su categoría). */
export function unidadDeEntrada(entrada) {
  return ENTRADA_A_UNIDAD[entrada.id] ?? CATEGORIA_A_UNIDAD[entrada.categoria] ?? null;
}
