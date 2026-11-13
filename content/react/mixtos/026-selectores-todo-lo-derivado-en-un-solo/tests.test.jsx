// @vitest-environment jsdom
import { test, expect } from "vitest";
import { seleccionar } from "./solucion.jsx";

function crearPizzas() {
  return [
    { nombre: "Margarita", precio: 28, veggie: true },
    { nombre: "Marinera", precio: 24, veggie: true },
    { nombre: "Carnívora", precio: 38, veggie: false },
  ];
}

const nombres = (lista) => lista.map((pizza) => pizza.nombre);

test("sin filtros devuelve todas, su cantidad y la más barata", () => {
  const resultado = seleccionar(crearPizzas());
  expect(nombres(resultado.visibles)).toEqual(["Margarita", "Marinera", "Carnívora"]);
  expect(resultado.cantidad).toBe(3);
  expect(resultado.masBarata.nombre).toBe("Marinera");
});

test('busca por nombre: "mar" deja Margarita y Marinera', () => {
  const resultado = seleccionar(crearPizzas(), { busqueda: "mar" });
  expect(nombres(resultado.visibles)).toEqual(["Margarita", "Marinera"]);
  expect(resultado.masBarata.nombre).toBe("Marinera");
});

test("la búsqueda ignora mayúsculas y espacios de los extremos", () => {
  const resultado = seleccionar(crearPizzas(), { busqueda: "  CARNÍ " });
  expect(nombres(resultado.visibles)).toEqual(["Carnívora"]);
});

test("soloVeggie deja solo las vegetarianas", () => {
  const resultado = seleccionar(crearPizzas(), { soloVeggie: true });
  expect(resultado.cantidad).toBe(2);
  expect(nombres(resultado.visibles)).toEqual(["Margarita", "Marinera"]);
});

test("si nada coincide, masBarata es null y no hay visibles", () => {
  const resultado = seleccionar(crearPizzas(), { busqueda: "zzz" });
  expect(resultado.visibles).toEqual([]);
  expect(resultado.cantidad).toBe(0);
  expect(resultado.masBarata).toBeNull();
});

test("no modifica ni reordena el arreglo original", () => {
  const pizzas = crearPizzas();
  const copia = structuredClone(pizzas);
  seleccionar(pizzas, { busqueda: "a", soloVeggie: true });
  expect(pizzas).toEqual(copia);
});
