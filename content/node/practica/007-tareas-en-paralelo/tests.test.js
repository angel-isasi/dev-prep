import { test, expect } from "vitest";
import { cargarTodo, cargarLoQueSePueda } from "./solucion.js";

/**
 * Crea una tarea simulada: al llamarla anota "inicio", espera `ms`,
 * anota "fin" y se cumple con `valor` (o rechaza si `error` viene).
 */
function tarea(nombre, ms, registro, { valor = nombre, error } = {}) {
  return () => {
    registro.push(`inicio ${nombre}`);
    return new Promise((resolver, rechazar) => {
      setTimeout(() => {
        registro.push(`fin ${nombre}`);
        if (error) rechazar(new Error(error));
        else resolver(valor);
      }, ms);
    });
  };
}

test("cargarTodo devuelve los resultados en el orden de las tareas, aunque terminen en otro orden", async () => {
  const registro = [];
  const resultado = await cargarTodo([
    tarea("usuario", 30, registro, { valor: { id: 7, nombre: "Ana" } }),
    tarea("pedidos", 10, registro, { valor: [{ id: 1, total: 50 }] }),
    tarea("notificaciones", 20, registro, { valor: 3 }),
  ]);
  expect(resultado).toEqual([{ id: 7, nombre: "Ana" }, [{ id: 1, total: 50 }], 3]);
});

test("cargarTodo arranca todas las tareas antes de que termine alguna (en paralelo)", async () => {
  const registro = [];
  await cargarTodo([tarea("a", 30, registro), tarea("b", 10, registro), tarea("c", 20, registro)]);
  expect(registro.slice(0, 3)).toEqual(["inicio a", "inicio b", "inicio c"]);
  expect(registro.slice(3)).toEqual(["fin b", "fin c", "fin a"]);
});

test("cargarTodo falla con el error de la tarea que falla", async () => {
  const registro = [];
  const promesa = cargarTodo([
    tarea("usuario", 10, registro),
    tarea("pedidos", 20, registro, { error: "Servicio de pedidos caído" }),
  ]);
  await expect(promesa).rejects.toThrow("Servicio de pedidos caído");
});

test("cargarTodo con una lista vacía devuelve []", async () => {
  expect(await cargarTodo([])).toEqual([]);
});

test("cargarLoQueSePueda separa éxitos y mensajes de error, en orden", async () => {
  const registro = [];
  const resultado = await cargarLoQueSePueda([
    tarea("usuario", 20, registro, { valor: "Ana" }),
    tarea("pedidos", 10, registro, { error: "Servicio de pedidos caído" }),
    tarea("notificaciones", 5, registro, { valor: 3 }),
    tarea("ofertas", 15, registro, { error: "Tiempo de espera agotado" }),
  ]);
  expect(resultado).toEqual({
    exitos: ["Ana", 3],
    fallos: ["Servicio de pedidos caído", "Tiempo de espera agotado"],
  });
});

test("cargarLoQueSePueda no falla aunque fallen todas", async () => {
  const registro = [];
  const resultado = await cargarLoQueSePueda([
    tarea("a", 10, registro, { error: "uno" }),
    tarea("b", 5, registro, { error: "dos" }),
  ]);
  expect(resultado).toEqual({ exitos: [], fallos: ["uno", "dos"] });
});

test("cargarLoQueSePueda también arranca todas a la vez", async () => {
  const registro = [];
  await cargarLoQueSePueda([tarea("a", 20, registro), tarea("b", 10, registro, { error: "x" })]);
  expect(registro).toEqual(["inicio a", "inicio b", "fin b", "fin a"]);
});
