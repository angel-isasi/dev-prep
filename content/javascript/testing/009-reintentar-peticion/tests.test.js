import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

async function correcta(pedir, intentos = 3) {
  let ultimoError;
  for (let i = 0; i < intentos; i++) {
    try {
      return await pedir();
    } catch (error) {
      ultimoError = error;
    }
  }
  throw ultimoError;
}

const mutantes = [
  {
    nombre: "una versión que intenta una vez de más (usa <= en vez de <)",
    fn: async (pedir, intentos = 3) => {
      let ultimoError;
      for (let i = 0; i <= intentos; i++) {
        try {
          return await pedir();
        } catch (error) {
          ultimoError = error;
        }
      }
      throw ultimoError;
    },
  },
  {
    nombre: "una versión que intenta una vez de menos",
    fn: async (pedir, intentos = 3) => {
      let ultimoError;
      for (let i = 0; i < intentos - 1; i++) {
        try {
          return await pedir();
        } catch (error) {
          ultimoError = error;
        }
      }
      throw ultimoError;
    },
  },
  {
    nombre: "una versión que sigue llamando aunque ya funcionó",
    fn: async (pedir, intentos = 3) => {
      let ultimoError;
      let resultado;
      let funciono = false;
      for (let i = 0; i < intentos; i++) {
        try {
          const valor = await pedir();
          if (!funciono) resultado = valor;
          funciono = true;
        } catch (error) {
          ultimoError = error;
        }
      }
      if (funciono) return resultado;
      throw ultimoError;
    },
  },
  {
    nombre: "una versión que rechaza con el error del primer intento",
    fn: async (pedir, intentos = 3) => {
      let primerError;
      for (let i = 0; i < intentos; i++) {
        try {
          return await pedir();
        } catch (error) {
          primerError ??= error;
        }
      }
      throw primerError;
    },
  },
  {
    nombre: "una versión que olvida el await (el try no atrapa el rechazo y no reintenta)",
    fn: async (pedir, intentos = 3) => {
      let ultimoError;
      for (let i = 0; i < intentos; i++) {
        try {
          return pedir();
        } catch (error) {
          ultimoError = error;
        }
      }
      throw ultimoError;
    },
  },
  {
    nombre: "una versión que se resuelve con undefined cuando todo falla",
    fn: async (pedir, intentos = 3) => {
      for (let i = 0; i < intentos; i++) {
        try {
          return await pedir();
        } catch {
          // sigue con el siguiente intento
        }
      }
      return undefined;
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
