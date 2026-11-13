// Textos legibles para los valores internos (ids de colección, tema...).

const COLECCIONES = {
  "javascript/guiados": "JS · Fundamentos",
  "javascript/ejercicios": "JS · Práctica",
  "javascript/retos": "JS · Retos",
  "algoritmos/retos": "Algoritmos",
  "react/ejercicios": "React · Práctica",
  "react/mixtos": "JS + React",
  "react/retos": "React · Retos",
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
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1).replaceAll("-", " ");

export const nombreColeccion = (c) => COLECCIONES[c] ?? capitalizar(c);
export const nombreTema = (t) => TEMAS[t] ?? capitalizar(t);
