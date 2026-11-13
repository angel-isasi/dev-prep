import { describe, test, expect } from "vitest";
import { filtrarEjercicios } from "./filtrarEjercicios.js";

const LISTA = [
  { id: "a", titulo: "Frecuencia de palabras", tema: "objetos", nivel: 1, estado: "resuelto", tags: ["contador"] },
  { id: "b", titulo: "Two Sum", tema: "algoritmos", nivel: 2, estado: "pendiente", tags: ["map", "leetcode"] },
  { id: "c", titulo: "Buscador con filtro", tema: "react-estado", nivel: 2, estado: "en-progreso", tags: ["useState"] },
  { id: "d", titulo: "Agrupar por propiedad", tema: "objetos", nivel: 3, estado: "pendiente", tags: ["reduce"] },
];

const SIN_FILTROS = { texto: "", tema: "", nivel: "", estado: "" };
const ids = (lista) => lista.map((e) => e.id);

describe("filtrarEjercicios", () => {
  test("sin filtros devuelve todos", () => {
    expect(ids(filtrarEjercicios(LISTA, SIN_FILTROS))).toEqual(["a", "b", "c", "d"]);
  });

  test("filtra por tema", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, tema: "objetos" }))).toEqual(["a", "d"]);
  });

  test("filtra por nivel (llega como texto desde el <select>)", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, nivel: "2" }))).toEqual(["b", "c"]);
  });

  test("filtra por estado", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, estado: "pendiente" }))).toEqual(["b", "d"]);
  });

  test("combina varios filtros (todos se deben cumplir)", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, tema: "objetos", estado: "pendiente" }))).toEqual(["d"]);
  });

  test("el texto busca en el título sin importar mayúsculas", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, texto: "TWO" }))).toEqual(["b"]);
  });

  test("el texto también busca en los tags", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, texto: "reduce" }))).toEqual(["d"]);
  });

  test("el texto ignora espacios a los costados", () => {
    expect(ids(filtrarEjercicios(LISTA, { ...SIN_FILTROS, texto: "  buscador " }))).toEqual(["c"]);
  });

  test("filtra por colección", () => {
    const conColeccion = LISTA.map((e, i) => ({ ...e, coleccion: i < 2 ? "javascript/ejercicios" : "react/retos" }));
    expect(ids(filtrarEjercicios(conColeccion, { ...SIN_FILTROS, coleccion: "react/retos" }))).toEqual(["c", "d"]);
  });

  test("si nada coincide devuelve un arreglo vacío", () => {
    expect(filtrarEjercicios(LISTA, { ...SIN_FILTROS, texto: "xyz" })).toEqual([]);
  });

  test("no modifica la lista original", () => {
    const copia = structuredClone(LISTA);
    filtrarEjercicios(LISTA, { ...SIN_FILTROS, tema: "objetos" });
    expect(LISTA).toEqual(copia);
  });
});
