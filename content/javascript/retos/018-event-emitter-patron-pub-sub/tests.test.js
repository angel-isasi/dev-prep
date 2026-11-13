import { test, expect, vi } from "vitest";
import { Emisor } from "./solucion.js";

test("la función que devuelve on cancela la suscripción", () => {
  const e = new Emisor();
  const recibidos = [];
  const quitar = e.on("voto", (corto) => recibidos.push(corto));
  e.emit("voto", "Drama");
  quitar();
  e.emit("voto", "Terror");
  expect(recibidos).toEqual(["Drama"]);
});

test("avisa a todos los suscriptores, en el orden en que se suscribieron", () => {
  const e = new Emisor();
  const orden = [];
  e.on("voto", () => orden.push("primero"));
  e.on("voto", () => orden.push("segundo"));
  e.emit("voto");
  expect(orden).toEqual(["primero", "segundo"]);
});

test("emit pasa todos los argumentos", () => {
  const e = new Emisor();
  const fn = vi.fn();
  e.on("puntaje", fn);
  e.emit("puntaje", "Drama", 9, { jurado: true });
  expect(fn).toHaveBeenCalledWith("Drama", 9, { jurado: true });
});

test("off quita solo esa función y deja las demás", () => {
  const e = new Emisor();
  const a = vi.fn();
  const b = vi.fn();
  e.on("voto", a);
  e.on("voto", b);
  e.off("voto", a);
  e.emit("voto", "Drama");
  expect(a).not.toHaveBeenCalled();
  expect(b).toHaveBeenCalledWith("Drama");
});

test("eventos distintos no se mezclan y emitir sin suscriptores no falla", () => {
  const e = new Emisor();
  const fn = vi.fn();
  e.on("comentario", fn);
  expect(() => e.emit("voto", "Drama")).not.toThrow();
  expect(fn).not.toHaveBeenCalled();
});

test("cada emisor es independiente", () => {
  const uno = new Emisor();
  const otro = new Emisor();
  const fn = vi.fn();
  uno.on("voto", fn);
  otro.emit("voto", "Drama");
  expect(fn).not.toHaveBeenCalled();
});
