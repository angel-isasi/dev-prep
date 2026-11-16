import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

const MENSAJES = {
  nombre: "El nombre es obligatorio",
  correo: "El correo no es válido",
  edad: "Debes tener al menos 18 años",
  clave: "La contraseña debe tener al menos 8 caracteres",
  confirmar: "Las contraseñas no coinciden",
};

// Cada regla devuelve true si el campo está MAL.
const REGLAS_CORRECTAS = {
  nombre: (d) => d.nombre.trim() === "",
  correo: (d) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo),
  edad: (d) => d.edad < 18,
  clave: (d) => d.clave.length < 8,
  confirmar: (d) => d.confirmar !== d.clave,
};

// Arma un validador a partir de sus reglas, para que cada mutante cambie solo una.
function crearValidador(cambios = {}) {
  const reglas = { ...REGLAS_CORRECTAS, ...cambios };
  return (datos) => {
    const errores = {};
    for (const campo of Object.keys(reglas)) {
      if (reglas[campo](datos)) errores[campo] = MENSAJES[campo];
    }
    return errores;
  };
}

const correcta = crearValidador();

const mutantes = [
  {
    nombre: "una versión que se detiene en el primer error",
    fn: (datos) => {
      for (const campo of Object.keys(REGLAS_CORRECTAS)) {
        if (REGLAS_CORRECTAS[campo](datos)) return { [campo]: MENSAJES[campo] };
      }
      return {};
    },
  },
  {
    nombre: "una versión que acepta un nombre de solo espacios",
    fn: crearValidador({ nombre: (d) => d.nombre === "" }),
  },
  {
    nombre: "una versión que acepta un correo sin punto después de la arroba",
    fn: crearValidador({ correo: (d) => !/^[^\s@]+@[^\s@]+$/.test(d.correo) }),
  },
  {
    nombre: "una versión que rechaza 18 años justos (usa <= en vez de <)",
    fn: crearValidador({ edad: (d) => d.edad <= 18 }),
  },
  {
    nombre: "una versión que no compara las contraseñas",
    fn: crearValidador({ confirmar: () => false }),
  },
  {
    nombre: "una versión que deja los campos válidos con valor undefined",
    fn: (datos) => {
      // Parece vacío, pero Object.keys(errores) tiene 5 claves y el formulario nunca se envía.
      const errores = {};
      for (const campo of Object.keys(REGLAS_CORRECTAS)) {
        errores[campo] = REGLAS_CORRECTAS[campo](datos) ? MENSAJES[campo] : undefined;
      }
      return errores;
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
