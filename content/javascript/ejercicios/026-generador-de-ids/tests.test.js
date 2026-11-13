import { test, expect } from "vitest";
import { crearIds } from "./solucion.js";

test("el primer id termina en 1", () => {
  expect(crearIds("voto")()).toBe("voto-1");
});

test("cada llamada aumenta el número en 1", () => {
  const idPedido = crearIds("pedido");
  idPedido();
  expect(idPedido()).toBe("pedido-2");
});

test("genera una secuencia", () => {
  const idTarea = crearIds("tarea");
  expect([idTarea(), idTarea(), idTarea()]).toEqual(["tarea-1", "tarea-2", "tarea-3"]);
});

test("cada generador lleva su propia cuenta", () => {
  const idPedido = crearIds("pedido");
  idPedido();
  idPedido();
  const idVoto = crearIds("voto");
  expect(idVoto()).toBe("voto-1");
  expect(idPedido()).toBe("pedido-3");
});
