// Textos legibles para los valores internos (ids de colección, tema...).

const COLECCIONES = {
  "javascript/ejercicios": "JavaScript",
  "javascript/retos": "Retos JS",
  "algoritmos/retos": "Algoritmos",
  "react/ejercicios": "React",
  "react/mixtos": "JS + React",
  "react/retos": "Retos React",
};

const TEMAS = {
  objetos: "Objetos",
  arrays: "Arrays",
  strings: "Strings",
  funciones: "Funciones",
  algoritmos: "Algoritmos",
  "react-estado": "React: estado",
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1).replaceAll("-", " ");

export const nombreColeccion = (c) => COLECCIONES[c] ?? capitalizar(c);
export const nombreTema = (t) => TEMAS[t] ?? capitalizar(t);
