import { test, expect } from "vitest";
import { EventEmitter } from "node:events";
import { Pedido, registrarAvisos } from "./solucion.js";

test("un Pedido es un EventEmitter y empieza en estado \"creado\" con su id", () => {
  const pedido = new Pedido(7);
  expect(pedido).toBeInstanceOf(EventEmitter);
  expect(pedido.id).toBe(7);
  expect(pedido.estado).toBe("creado");
});

test("pagar cambia el estado y emite \"pagado\" con { id, monto }", () => {
  const pedido = new Pedido(7);
  const recibidos = [];
  pedido.on("pagado", (datos) => recibidos.push(datos));
  pedido.pagar(50);
  expect(pedido.estado).toBe("pagado");
  expect(recibidos).toEqual([{ id: 7, monto: 50 }]);
});

test("el flujo completo emite pagado, enviado y entregado en orden", () => {
  const pedido = new Pedido(3);
  const eventos = [];
  for (const nombre of ["pagado", "enviado", "entregado"]) {
    pedido.on(nombre, (datos) => eventos.push([nombre, datos.id]));
  }
  pedido.pagar(20);
  pedido.enviar();
  pedido.entregar();
  expect(eventos).toEqual([
    ["pagado", 3],
    ["enviado", 3],
    ["entregado", 3],
  ]);
  expect(pedido.estado).toBe("entregado");
});

test("emite \"cambioDeEstado\" en cada paso con { id, anterior, nuevo }", () => {
  const pedido = new Pedido(9);
  const cambios = [];
  pedido.on("cambioDeEstado", (cambio) => cambios.push(cambio));
  pedido.pagar(10);
  pedido.enviar();
  expect(cambios).toEqual([
    { id: 9, anterior: "creado", nuevo: "pagado" },
    { id: 9, anterior: "pagado", nuevo: "enviado" },
  ]);
});

test("no se puede enviar sin pagar: lanza un error y no cambia ni emite nada", () => {
  const pedido = new Pedido(8);
  let emitidos = 0;
  pedido.on("enviado", () => emitidos++);
  pedido.on("cambioDeEstado", () => emitidos++);
  expect(() => pedido.enviar()).toThrow();
  expect(pedido.estado).toBe("creado");
  expect(emitidos).toBe(0);
});

test("no se puede pagar dos veces ni entregar sin enviar", () => {
  const pedido = new Pedido(4);
  pedido.pagar(30);
  expect(() => pedido.pagar(30)).toThrow();
  expect(() => pedido.entregar()).toThrow();
  expect(pedido.estado).toBe("pagado");
});

test("registrarAvisos escucha los eventos y arma los mensajes para el cliente", () => {
  const pedido = new Pedido(7);
  const avisos = registrarAvisos(pedido);
  expect(avisos).toEqual([]);
  pedido.pagar(50);
  pedido.enviar();
  pedido.entregar();
  expect(avisos).toEqual([
    "Pedido 7: pago recibido (S/ 50.00)",
    "Pedido 7: en camino",
    "Pedido 7: entregado",
  ]);
});

test("cada pedido tiene sus propios oyentes", () => {
  const a = new Pedido(1);
  const b = new Pedido(2);
  const avisosA = registrarAvisos(a);
  b.pagar(99.9);
  a.pagar(5);
  expect(avisosA).toEqual(["Pedido 1: pago recibido (S/ 5.00)"]);
});
