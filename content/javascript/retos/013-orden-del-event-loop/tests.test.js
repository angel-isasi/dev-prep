import { test, expect } from "vitest";
import { prediccion1, prediccion2, prediccion3, prediccion4 } from "./solucion.js";

// Ejecuta un fragmento, espera a que corran todas sus tareas y devuelve el orden real.
async function ejecutar(fragmento) {
  const orden = [];
  fragmento((texto) => orden.push(texto));
  await new Promise((r) => setTimeout(r, 20));
  return orden;
}

test("fragmento 1: síncrono, microtarea y macrotarea", async () => {
  const real = await ejecutar((registrar) => {
    registrar("1 síncrono");
    setTimeout(() => registrar("macrotarea (setTimeout)"), 0);
    Promise.resolve().then(() => registrar("microtarea (promesa)"));
    registrar("2 síncrono");
  });
  expect(prediccion1).toEqual(real);
});

test("fragmento 2: una función async hasta su primer await", async () => {
  const real = await ejecutar((registrar) => {
    async function tarea() {
      registrar("B");
      await null;
      registrar("D");
    }
    registrar("A");
    tarea();
    registrar("C");
  });
  expect(prediccion2).toEqual(real);
});

test("fragmento 3: el cuerpo de new Promise es síncrono", async () => {
  const real = await ejecutar((registrar) => {
    registrar("A");
    new Promise((resolver) => {
      registrar("B");
      resolver();
    }).then(() => registrar("D"));
    registrar("C");
  });
  expect(prediccion3).toEqual(real);
});

test("fragmento 4: microtareas entre una macrotarea y la siguiente", async () => {
  const real = await ejecutar((registrar) => {
    setTimeout(() => {
      registrar("T1");
      Promise.resolve().then(() => registrar("M dentro de T1"));
    }, 0);
    setTimeout(() => registrar("T2"), 0);
    Promise.resolve().then(() => registrar("M1"));
  });
  expect(prediccion4).toEqual(real);
});
