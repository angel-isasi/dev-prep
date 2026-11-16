import { test, expect } from "vitest";
import { misTests } from "./solucion.js";

// ---------------------------------------------------------------------------
// La función correcta y 6 versiones con un error escondido ("mutantes").
// Tus tests deben pasar con la correcta y fallar con cada mutante.
// ---------------------------------------------------------------------------

const ENVIO = 15;
const MINIMO_ENVIO_GRATIS = 100;
const redondear = (n) => Math.round(n * 100) / 100;
const subtotalDe = (items) => items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

function correcta(items, cupon = "") {
  if (items.length === 0) return 0;
  const subtotal = subtotalDe(items);
  const descuento = cupon.toUpperCase() === "DESC10" ? subtotal * 0.1 : 0;
  const conDescuento = subtotal - descuento;
  const envio = conDescuento >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
  return redondear(conDescuento + envio);
}

const mutantes = [
  {
    nombre: "una versión que ignora la cantidad de cada item",
    fn: (items, cupon = "") => {
      if (items.length === 0) return 0;
      const subtotal = items.reduce((suma, item) => suma + item.precio, 0);
      const descuento = cupon.toUpperCase() === "DESC10" ? subtotal * 0.1 : 0;
      const conDescuento = subtotal - descuento;
      const envio = conDescuento >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      return redondear(conDescuento + envio);
    },
  },
  {
    nombre: "una versión que cobra envío con 100 justos (usa > en vez de >=)",
    fn: (items, cupon = "") => {
      if (items.length === 0) return 0;
      const subtotal = subtotalDe(items);
      const descuento = cupon.toUpperCase() === "DESC10" ? subtotal * 0.1 : 0;
      const conDescuento = subtotal - descuento;
      const envio = conDescuento > MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      return redondear(conDescuento + envio);
    },
  },
  {
    nombre: "una versión que decide el envío antes de aplicar el cupón",
    fn: (items, cupon = "") => {
      if (items.length === 0) return 0;
      const subtotal = subtotalDe(items);
      const envio = subtotal >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      const descuento = cupon.toUpperCase() === "DESC10" ? subtotal * 0.1 : 0;
      return redondear(subtotal - descuento + envio);
    },
  },
  {
    nombre: "una versión que no acepta el cupón en minúsculas",
    fn: (items, cupon = "") => {
      if (items.length === 0) return 0;
      const subtotal = subtotalDe(items);
      const descuento = cupon === "DESC10" ? subtotal * 0.1 : 0;
      const conDescuento = subtotal - descuento;
      const envio = conDescuento >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      return redondear(conDescuento + envio);
    },
  },
  {
    nombre: "una versión que descuenta con cualquier cupón",
    fn: (items, cupon = "") => {
      if (items.length === 0) return 0;
      const subtotal = subtotalDe(items);
      const descuento = cupon ? subtotal * 0.1 : 0;
      const conDescuento = subtotal - descuento;
      const envio = conDescuento >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      return redondear(conDescuento + envio);
    },
  },
  {
    nombre: "una versión que cobra envío al carrito vacío",
    fn: (items, cupon = "") => {
      const subtotal = subtotalDe(items);
      const descuento = cupon.toUpperCase() === "DESC10" ? subtotal * 0.1 : 0;
      const conDescuento = subtotal - descuento;
      const envio = conDescuento >= MINIMO_ENVIO_GRATIS ? 0 : ENVIO;
      return redondear(conDescuento + envio);
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
