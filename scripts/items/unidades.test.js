import { describe, test, expect } from "vitest";
import { crearUnidades, unidadDeEjercicio, unidadDeEntrada, TEMA_A_UNIDAD } from "./unidades.js";

const TEMAS = [
  { id: "node-archivos", titulo: "Archivos", area: "node", orden: 1, ejercicios: [] },
  { id: "react-estado-y-eventos", titulo: "Estado", area: "react", orden: 3, ejercicios: ["re-1"] },
  { id: "arrays", titulo: "Arrays", area: "javascript", orden: 4, ejercicios: ["js-1"] },
  { id: "variables-y-tipos", titulo: "Variables", area: "javascript", orden: 1, ejercicios: [] },
  { id: "ts-genericos", titulo: "Genéricos", area: "typescript", orden: 5, ejercicios: [] },
];

describe("crearUnidades", () => {
  test("ordena javascript, algoritmos, react, typescript y node, con orden correlativo", () => {
    const unidades = crearUnidades(TEMAS);
    expect(unidades.map((u) => u.id)).toEqual([
      "variables-y-tipos",
      "arrays",
      "algoritmos",
      "react-estado-y-eventos",
      "ts-genericos",
      "node-archivos",
    ]);
    expect(unidades.map((u) => u.orden)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test("solo algoritmos va sin teoría y cada unidad trae id, titulo, area, orden y conTeoria", () => {
    const unidades = crearUnidades(TEMAS);
    const algoritmos = unidades.find((u) => u.id === "algoritmos");
    expect(algoritmos).toEqual({ id: "algoritmos", titulo: "Algoritmos", area: "algoritmos", conTeoria: false, orden: 3 });
    expect(unidades.filter((u) => u.conTeoria)).toHaveLength(5);
    for (const u of unidades) expect(Object.keys(u).sort()).toEqual(["area", "conTeoria", "id", "orden", "titulo"]);
  });
});

describe("unidadDeEjercicio", () => {
  test("primero manda el tema que lo lista en sus ejercicios", () => {
    expect(unidadDeEjercicio({ id: "js-1", tema: "strings" }, TEMAS)).toBe("arrays");
  });

  test("si ningún tema lo lista, usa la tabla por su tema", () => {
    expect(unidadDeEjercicio({ id: "js-9", tema: "strings" }, TEMAS)).toBe("variables-y-tipos");
    expect(unidadDeEjercicio({ id: "re-9", tema: "react-estado" }, TEMAS)).toBe("react-estado-y-eventos");
    expect(unidadDeEjercicio({ id: "alg-1", tema: "algoritmos" }, TEMAS)).toBe("algoritmos");
  });

  test("un tema desconocido no tiene unidad", () => {
    expect(unidadDeEjercicio({ id: "x", tema: "cobol" }, TEMAS)).toBeNull();
    expect(TEMA_A_UNIDAD.cobol).toBeUndefined();
  });
});

describe("unidadDeEntrada", () => {
  test("va por categoría, con excepciones por entrada", () => {
    expect(unidadDeEntrada({ id: "array-push", categoria: "Arrays" })).toBe("arrays");
    expect(unidadDeEntrada({ id: "array-map", categoria: "Arrays" })).toBe("metodos-de-array");
    expect(unidadDeEntrada({ id: "react-usememo", categoria: "React" })).toBe("react-hooks-avanzados");
    expect(unidadDeEntrada({ id: "react-usestate", categoria: "React" })).toBe("react-estado-y-eventos");
    expect(unidadDeEntrada({ id: "x", categoria: "Otra" })).toBeNull();
  });
});
