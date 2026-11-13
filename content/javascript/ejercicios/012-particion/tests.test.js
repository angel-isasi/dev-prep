import { test, expect } from "vitest";
import { particion } from "./solucion.js";

test("separa los que cumplen de los que no", () => {
  expect(particion([11, 18, 20, 9], (nota) => nota >= 11)).toEqual([[11, 18, 20], [9]]);
});

test("funciona con cualquier condición y con textos", () => {
  expect(particion(["sol", "luna", "mar"], (palabra) => palabra.length > 3)).toEqual([
    ["luna"],
    ["sol", "mar"],
  ]);
});

test("si ninguno cumple, el primer grupo queda vacío", () => {
  expect(particion([1, 3, 5], (n) => n % 2 === 0)).toEqual([[], [1, 3, 5]]);
});

test("una lista vacía devuelve dos grupos vacíos", () => {
  expect(particion([], (n) => n > 0)).toEqual([[], []]);
});

test("llama a la condición una vez por elemento y no modifica la lista", () => {
  const lista = [4, 7, 1];
  let llamadas = 0;
  particion(lista, (n) => {
    llamadas++;
    return n > 3;
  });
  expect(llamadas).toBe(3);
  expect(lista).toEqual([4, 7, 1]);
});
