import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 5 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

function correcta(productos, precioMaximo) {
  // filter crea un arreglo nuevo, así que el sort ordena ese y no el original.
  return productos.filter((p) => p.precio <= precioMaximo).sort((a, b) => a.precio - b.precio);
}

const mutantes = [
  {
    nombre: "una versión que deja fuera el producto que cuesta justo el máximo",
    fn: (productos, precioMaximo) =>
      productos.filter((p) => p.precio < precioMaximo).sort((a, b) => a.precio - b.precio),
  },
  {
    nombre: "una versión que ordena de mayor a menor",
    fn: (productos, precioMaximo) =>
      productos.filter((p) => p.precio <= precioMaximo).sort((a, b) => b.precio - a.precio),
  },
  {
    nombre: "una versión que desordena el arreglo original (ordena antes de filtrar)",
    fn: (productos, precioMaximo) =>
      productos.sort((a, b) => a.precio - b.precio).filter((p) => p.precio <= precioMaximo),
  },
  {
    nombre: "una versión que ordena los precios como texto",
    fn: (productos, precioMaximo) =>
      productos
        .filter((p) => p.precio <= precioMaximo)
        .sort((a, b) => String(a.precio).localeCompare(String(b.precio))),
  },
  {
    nombre: "una versión que pierde propiedades de los productos",
    fn: (productos, precioMaximo) =>
      productos
        .filter((p) => p.precio <= precioMaximo)
        .sort((a, b) => a.precio - b.precio)
        .map((p) => ({ nombre: p.nombre, precio: p.precio })),
  },
];

// ---------------------------------------------------------------------------
// Corre tus tests contra una versión de la función y cuenta cuántos fallan.
// ---------------------------------------------------------------------------
async function correrMisTests(fn) {
  const casos = [];
  misTests({ test: (nombre, cuerpo) => casos.push({ nombre, cuerpo }), expect }, fn);
  const fallidos = [];
  for (const caso of casos) {
    try {
      await caso.cuerpo();
    } catch (error) {
      fallidos.push(`"${caso.nombre}": ${error.message.split("\n")[0]}`);
    }
  }
  return { total: casos.length, fallidos };
}

test("escribiste al menos 3 tests", async () => {
  const { total } = await correrMisTests(correcta);
  expect(total, `Tienes ${total} test(s). Escribe al menos 3.`).toBeGreaterThanOrEqual(3);
});

test("tus tests pasan con la función correcta", async () => {
  const { fallidos } = await correrMisTests(correcta);
  expect(fallidos, `Estos tests fallan con la función correcta, así que esperan algo equivocado:\n${fallidos.join("\n")}`).toEqual([]);
});

for (const mutante of mutantes) {
  test(`atrapa ${mutante.nombre}`, async () => {
    const { fallidos } = await correrMisTests(mutante.fn);
    expect(fallidos.length, `Todos tus tests pasan con ${mutante.nombre}. Escribe un test que la haga fallar.`).toBeGreaterThan(0);
  });
}
