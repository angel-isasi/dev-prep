// Textos legibles para los valores internos (ids de colección, tema...).

const COLECCIONES = {
  "javascript/guiados": "JS · Fundamentos",
  "javascript/ejercicios": "JS · Práctica",
  "javascript/retos": "JS · Retos",
  "algoritmos/retos": "Algoritmos",
  "react/ejercicios": "React · Práctica",
  "react/mixtos": "JS + React",
  "react/retos": "React · Retos",
  "typescript/practica": "TS · Práctica",
  "typescript/retos": "TS · Retos",
  "node/practica": "Node · Fundamentos",
  "node/apis": "Node · APIs",
  "node/sql": "SQL",
};

const TEMAS = {
  variables: "Variables y tipos",
  condicionales: "Condicionales y bucles",
  this: "this",
  dom: "DOM y eventos",
  objetos: "Objetos",
  arrays: "Arrays",
  strings: "Strings",
  funciones: "Funciones",
  closures: "Closures y scope",
  asincronia: "Asincronía",
  clases: "Clases y prototipos",
  iteradores: "Iteradores y generadores",
  algoritmos: "Algoritmos",
  "react-componentes": "React: componentes y props",
  "react-estado": "React: estado y eventos",
  "react-listas": "React: listas y condicionales",
  "react-formularios": "React: formularios",
  "react-efectos": "React: efectos y datos",
  "react-hooks": "React: hooks avanzados",
  "react-patrones": "React: patrones y rendimiento",
  "ts-basicos": "TS: tipos básicos",
  "ts-objetos": "TS: objetos e interfaces",
  "ts-uniones": "TS: uniones y narrowing",
  "ts-funciones": "TS: funciones",
  "ts-genericos": "TS: genéricos",
  "ts-utility": "TS: utility types",
  "ts-clases": "TS: clases y módulos",
  "ts-react": "TS: React con TypeScript",
  "node-modulos": "Node: módulos",
  "node-archivos": "Node: archivos",
  "node-async": "Node: asincronía y eventos",
  "node-express": "Node: APIs con Express",
  "node-middlewares": "Node: middlewares y errores",
  "sql-consultas": "SQL: consultas",
  "sql-joins": "SQL: JOIN y agrupación",
  "sql-escritura": "SQL: insertar y modificar",
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1).replaceAll("-", " ");

export const nombreColeccion = (c) => COLECCIONES[c] ?? capitalizar(c);
export const nombreTema = (t) => TEMAS[t] ?? capitalizar(t);

/** Número del ejercicio a partir de su id: "js-gu-012" -> "012". */
export const numeroEjercicio = (id) => id.match(/(\d+)$/)?.[1] ?? "";
