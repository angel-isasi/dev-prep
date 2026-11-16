import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 4 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

function correcta(precio, porcentaje) {
  if (porcentaje < 0 || porcentaje > 100) throw new Error("Porcentaje fuera de rango");
  return Math.max(0, Math.round(precio * (1 - porcentaje / 100) * 100) / 100);
}

const mutantes = [
  {
    nombre: "una versión que no redondea a 2 decimales",
    fn: (precio, porcentaje) => {
      if (porcentaje < 0 || porcentaje > 100) throw new Error("Porcentaje fuera de rango");
      return Math.max(0, precio * (1 - porcentaje / 100));
    },
  },
  {
    nombre: "una versión que acepta descuentos de más de 100 %",
    fn: (precio, porcentaje) => {
      if (porcentaje < 0) throw new Error("Porcentaje fuera de rango");
      return Math.max(0, Math.round(precio * (1 - porcentaje / 100) * 100) / 100);
    },
  },
  {
    nombre: "una versión que rechaza el 100 % (se equivoca en el límite)",
    fn: (precio, porcentaje) => {
      if (porcentaje < 0 || porcentaje >= 100) throw new Error("Porcentaje fuera de rango");
      return Math.max(0, Math.round(precio * (1 - porcentaje / 100) * 100) / 100);
    },
  },
  {
    nombre: "una versión que acepta porcentajes negativos",
    fn: (precio, porcentaje) => {
      if (porcentaje > 100) throw new Error("Porcentaje fuera de rango");
      return Math.max(0, Math.round(precio * (1 - porcentaje / 100) * 100) / 100);
    },
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
