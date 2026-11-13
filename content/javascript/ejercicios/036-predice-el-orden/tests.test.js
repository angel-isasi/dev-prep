import { test, expect } from "vitest";
import { prediccion1, prediccion2, prediccion3, prediccion4 } from "./solucion.js";

// Ejecuta un fragmento, espera a que se vacíen todas las colas y devuelve el orden real.
async function ordenReal(fragmento) {
  const orden = [];
  const log = (letra) => orden.push(letra);
  fragmento(log);
  await new Promise((resolver) => setTimeout(resolver, 20));
  return orden;
}

// Compara sin mostrar el orden real, para no regalarte la respuesta.
function revisar(prediccion, real) {
  const coincide = Array.isArray(prediccion) && prediccion.join(" ") === real.join(" ");
  expect(
    coincide,
    `Tu predicción [${prediccion}] no coincide. Separa: síncrono, microtareas (.then, después de await) y macrotareas (setTimeout).`,
  ).toBe(true);
}

test("fragmento 1: síncrono, promesa y setTimeout", async () => {
  const real = await ordenReal((log) => {
    log("A");
    setTimeout(() => log("B"), 0);
    Promise.resolve().then(() => log("C"));
    log("D");
  });
  revisar(prediccion1, real);
});

test("fragmento 2: función async con await", async () => {
  const real = await ordenReal((log) => {
    async function principal() {
      log("A");
      setTimeout(() => log("B"), 0);
      Promise.resolve().then(() => log("C"));
      await null;
      log("D");
    }
    principal();
    log("E");
  });
  revisar(prediccion2, real);
});

test("fragmento 3: new Promise y .then encadenados", async () => {
  const real = await ordenReal((log) => {
    log("A");
    const promesa = new Promise((resolver) => {
      log("B");
      resolver();
      log("C");
    });
    promesa.then(() => log("D")).then(() => log("E"));
    setTimeout(() => log("F"), 0);
    Promise.resolve().then(() => log("G"));
    log("H");
  });
  revisar(prediccion3, real);
});

test("fragmento 4: una promesa dentro de un setTimeout", async () => {
  const real = await ordenReal((log) => {
    setTimeout(() => {
      log("A");
      Promise.resolve().then(() => log("B"));
    }, 0);
    setTimeout(() => log("C"), 0);
    log("D");
  });
  revisar(prediccion4, real);
});
