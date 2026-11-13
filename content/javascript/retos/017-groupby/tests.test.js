import { test, expect, vi, afterEach } from "vitest";
import { agruparPor } from "./solucion.js";

const gente = [
  { n: "Ana", ciudad: "Ica" },
  { n: "Luis", ciudad: "Lima" },
  { n: "Rosa", ciudad: "Ica" },
];

afterEach(() => {
  vi.restoreAllMocks();
});

test("agrupa por el nombre de una propiedad", () => {
  expect(agruparPor(gente, "ciudad")).toEqual({
    Ica: [
      { n: "Ana", ciudad: "Ica" },
      { n: "Rosa", ciudad: "Ica" },
    ],
    Lima: [{ n: "Luis", ciudad: "Lima" }],
  });
});

test("los grupos salen en el orden en que aparecen", () => {
  expect(Object.keys(agruparPor(gente, "ciudad"))).toEqual(["Ica", "Lima"]);
});

test("acepta una función que decide el grupo", () => {
  expect(agruparPor([1, 2, 3, 4], (x) => (x % 2 ? "impar" : "par"))).toEqual({ impar: [1, 3], par: [2, 4] });
  expect(agruparPor(["sol", "luna", "mar"], (p) => p.length)).toEqual({ 3: ["sol", "mar"], 4: ["luna"] });
});

test("guarda los mismos elementos, no copias, y no modifica la lista", () => {
  const copiaDeGente = structuredClone(gente);
  const grupos = agruparPor(gente, "ciudad");
  expect(grupos.Ica[0]).toBe(gente[0]);
  expect(gente).toEqual(copiaDeGente);
});

test("una lista vacía devuelve un objeto vacío", () => {
  expect(agruparPor([], "ciudad")).toEqual({});
});

test("no usa Object.groupBy", () => {
  if (typeof Object.groupBy !== "function") return;
  const espia = vi.spyOn(Object, "groupBy");
  agruparPor(gente, "ciudad");
  expect(espia, "el reto es agrupar a mano").not.toHaveBeenCalled();
});
