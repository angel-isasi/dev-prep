import { test, expect } from "vitest";
import { agruparAnagramas } from "./solucion.js";

// El orden no importa: ordena cada grupo y luego los grupos, para comparar.
const normalizar = (grupos) => grupos.map((g) => [...g].sort()).sort();

test("ejemplo clásico: eat, tea, tan, ate, nat, bat", () => {
  const resultado = agruparAnagramas(["eat", "tea", "tan", "ate", "nat", "bat"]);
  expect(normalizar(resultado)).toEqual([["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]);
});

test("sin anagramas: cada palabra forma su propio grupo", () => {
  expect(normalizar(agruparAnagramas(["abc", "def"]))).toEqual([["abc"], ["def"]]);
});

test("mismas letras pero distinta cantidad no se agrupan: ab, abb, ba", () => {
  expect(normalizar(agruparAnagramas(["ab", "abb", "ba"]))).toEqual([["ab", "ba"], ["abb"]]);
});

test("palabras repetidas van juntas en el mismo grupo", () => {
  expect(normalizar(agruparAnagramas(["ab", "ba", "ab"]))).toEqual([["ab", "ab", "ba"]]);
});

test("una cadena vacía forma su propio grupo", () => {
  expect(normalizar(agruparAnagramas([""]))).toEqual([[""]]);
});

test("arreglo vacío devuelve []", () => {
  expect(agruparAnagramas([])).toEqual([]);
});
