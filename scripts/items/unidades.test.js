import { describe, test, expect } from "vitest";
import { crearUnidades, nombrePatron, PATRONES, unidadDeEjercicio, unidadDeEntrada, TEMA_A_UNIDAD } from "./unidades.js";

const TEMAS = [
  { id: "node-archivos", titulo: "Archivos", area: "node", orden: 1, ejercicios: [] },
  { id: "react-estado-y-eventos", titulo: "Estado", area: "react", orden: 3, ejercicios: ["re-1"] },
  { id: "arrays", titulo: "Arrays", area: "javascript", orden: 4, ejercicios: ["js-1"] },
  { id: "variables-y-tipos", titulo: "Variables", area: "javascript", orden: 1, ejercicios: [] },
  { id: "ts-genericos", titulo: "Genéricos", area: "typescript", orden: 5, ejercicios: [] },
  { id: "alg-tabla-hash", titulo: "Tabla hash", area: "algoritmos", orden: 3, ejercicios: ["alg-reto-001"] },
  { id: "alg-big-o", titulo: "Big O", area: "algoritmos", orden: 1, ejercicios: [] },
];

describe("crearUnidades", () => {
  test("ordena javascript, algoritmos, react, typescript y node, con orden correlativo", () => {
    const unidades = crearUnidades(TEMAS);
    expect(unidades.map((u) => u.id)).toEqual([
      "variables-y-tipos",
      "arrays",
      "alg-big-o",
      "alg-tabla-hash",
      "react-estado-y-eventos",
      "ts-genericos",
      "node-archivos",
    ]);
    expect(unidades.map((u) => u.orden)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  test("cada tema es una unidad con teoría (también los de algoritmos) y trae id, titulo, area, orden y conTeoria", () => {
    const unidades = crearUnidades(TEMAS);
    expect(unidades.find((u) => u.id === "alg-big-o")).toEqual({ id: "alg-big-o", titulo: "Big O", area: "algoritmos", conTeoria: true, orden: 3 });
    expect(unidades.every((u) => u.conTeoria)).toBe(true);
    expect(unidades.some((u) => u.id === "algoritmos")).toBe(false); // ya no hay unidad suelta sin teoría
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
  });

  test("un reto de algoritmos va al tema que lo lista; si no, al tema de su patrón", () => {
    expect(unidadDeEjercicio({ id: "alg-reto-001", tema: "algoritmos", patron: "pila" }, TEMAS)).toBe("alg-tabla-hash");
    expect(unidadDeEjercicio({ id: "alg-reto-099", tema: "algoritmos", patron: "ventana" }, TEMAS)).toBe("alg-ventana-deslizante");
    expect(unidadDeEjercicio({ id: "alg-reto-098", tema: "algoritmos", patron: "matematica" }, TEMAS)).toBe("alg-big-o");
    // sin patrón (o con uno desconocido) usa la tabla por tema
    expect(unidadDeEjercicio({ id: "alg-reto-097", tema: "algoritmos" }, TEMAS)).toBe(TEMA_A_UNIDAD.algoritmos);
    expect(unidadDeEjercicio({ id: "alg-reto-096", tema: "algoritmos", patron: "cobol" }, TEMAS)).toBe(TEMA_A_UNIDAD.algoritmos);
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

describe("PATRONES", () => {
  test("ids únicos, con nombre legible y tema de Algoritmos", () => {
    expect(new Set(PATRONES.map((p) => p.id)).size).toBe(PATRONES.length);
    for (const p of PATRONES) {
      expect(p.nombre).toBeTruthy();
      expect(p.unidad.startsWith("alg-")).toBe(true);
    }
    expect(nombrePatron("hash")).toBe("Tabla hash");
    expect(nombrePatron("dos-punteros")).toBe("Dos punteros");
    expect(nombrePatron("raro")).toBe("raro");
  });
});
