import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

function correcta(clave) {
  if (clave.length < 8 || clave.length > 20) return false;
  if (!/[0-9]/.test(clave)) return false;
  if (!/[A-Z]/.test(clave)) return false;
  return true;
}

const mutantes = [
  {
    nombre: "una versión que rechaza 8 caracteres justos (usa <= en vez de <)",
    fn: (clave) => {
      if (clave.length <= 8 || clave.length > 20) return false;
      if (!/[0-9]/.test(clave)) return false;
      if (!/[A-Z]/.test(clave)) return false;
      return true;
    },
  },
  {
    nombre: "una versión que acepta 7 caracteres (el mínimo quedó en 7)",
    fn: (clave) => {
      if (clave.length < 7 || clave.length > 20) return false;
      if (!/[0-9]/.test(clave)) return false;
      if (!/[A-Z]/.test(clave)) return false;
      return true;
    },
  },
  {
    nombre: "una versión que rechaza 20 caracteres justos (usa >= en vez de >)",
    fn: (clave) => {
      if (clave.length < 8 || clave.length >= 20) return false;
      if (!/[0-9]/.test(clave)) return false;
      if (!/[A-Z]/.test(clave)) return false;
      return true;
    },
  },
  {
    nombre: "una versión que no tiene largo máximo",
    fn: (clave) => {
      if (clave.length < 8) return false;
      if (!/[0-9]/.test(clave)) return false;
      if (!/[A-Z]/.test(clave)) return false;
      return true;
    },
  },
  {
    nombre: "una versión que no exige un número",
    fn: (clave) => {
      if (clave.length < 8 || clave.length > 20) return false;
      if (!/[A-Z]/.test(clave)) return false;
      return true;
    },
  },
  {
    nombre: "una versión que no exige una mayúscula",
    fn: (clave) => {
      if (clave.length < 8 || clave.length > 20) return false;
      if (!/[0-9]/.test(clave)) return false;
      return true;
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
