import { test, expect } from "vitest";
import { unicos, unicosPor } from "./solucion.js";

const votos = () => [
  { id: 1, corto: "A" },
  { id: 2, corto: "B" },
  { id: 1, corto: "C" },
];

test("unicos quita primitivos repetidos y respeta el orden de aparición", () => {
  expect(unicos([3, 1, 3, 2, 1])).toEqual([3, 1, 2]);
  expect(unicos(["a", "b", "a"])).toEqual(["a", "b"]);
  expect(unicos([])).toEqual([]);
});

test("unicos distingue el número 1 del texto '1'", () => {
  expect(unicos([1, "1", 1])).toEqual([1, "1"]);
});

test("unicosPor se queda con el primero de cada valor", () => {
  expect(unicosPor(votos(), "id").map((v) => v.corto)).toEqual(["A", "B"]);
});

test("unicosPor devuelve los mismos objetos y no modifica la lista", () => {
  const lista = votos();
  const resultado = unicosPor(lista, "id");
  expect(resultado[0]).toBe(lista[0]);
  expect(resultado[1]).toBe(lista[1]);
  expect(lista).toHaveLength(3);
});

test("unicosPor funciona con cualquier propiedad", () => {
  const gente = [
    { n: "Ana", ciudad: "Ica" },
    { n: "Luis", ciudad: "Lima" },
    { n: "Rosa", ciudad: "Ica" },
    { n: "Ana", ciudad: "Puno" },
  ];
  expect(unicosPor(gente, "ciudad").map((p) => p.n)).toEqual(["Ana", "Luis", "Ana"]);
  expect(unicosPor(gente, "n").map((p) => p.ciudad)).toEqual(["Ica", "Lima", "Ica"]);
});
