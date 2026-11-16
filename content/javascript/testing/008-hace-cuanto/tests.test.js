import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

// Arma la función a partir de sus piezas, para que cada mutante cambie solo una.
function crearHaceCuanto({
  redondearMinutos = Math.floor,
  limiteMomento = (segundos) => segundos < 60,
  singularHora = true,
  diceAyer = true,
  rechazaFuturo = true,
} = {}) {
  return (fecha, ahora) => {
    const segundos = Math.floor((ahora - fecha) / 1000);
    if (rechazaFuturo && segundos < 0) throw new Error("La fecha está en el futuro");
    if (limiteMomento(segundos)) return "hace un momento";
    const minutos = redondearMinutos(segundos / 60);
    if (minutos < 60) return minutos === 1 ? "hace 1 minuto" : `hace ${minutos} minutos`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return singularHora && horas === 1 ? "hace 1 hora" : `hace ${horas} horas`;
    const dias = Math.floor(horas / 24);
    if (diceAyer && dias === 1) return "ayer";
    return `hace ${dias} días`;
  };
}

const correcta = crearHaceCuanto();

const mutantes = [
  {
    nombre: "una versión que ignora `ahora` y usa el reloj real (new Date())",
    fn: (fecha) => correcta(fecha, new Date()),
  },
  {
    nombre: "una versión que redondea los minutos en vez de contarlos completos",
    fn: crearHaceCuanto({ redondearMinutos: Math.round }),
  },
  {
    nombre: "una versión que dice 'hace un momento' con 60 segundos justos",
    fn: crearHaceCuanto({ limiteMomento: (segundos) => segundos <= 60 }),
  },
  {
    nombre: "una versión que dice 'hace 1 horas' (sin singular)",
    fn: crearHaceCuanto({ singularHora: false }),
  },
  {
    nombre: "una versión que nunca dice 'ayer'",
    fn: crearHaceCuanto({ diceAyer: false }),
  },
  {
    nombre: "una versión que no lanza error con una fecha en el futuro",
    fn: crearHaceCuanto({ rechazaFuturo: false }),
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
