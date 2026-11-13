import { test, expect, vi, afterEach } from "vitest";
import "./solucion.js";

function presentar(saludo, signo) {
  return `${saludo}, ${this.nombre}${signo}`;
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("fija el this y pone los argumentos previos delante", () => {
  const ligada = presentar.miBind({ nombre: "Ica" }, "Hola");
  expect(ligada("!")).toBe("Hola, Ica!");
  expect(ligada("?")).toBe("Hola, Ica?");
});

test("funciona sin argumentos previos", () => {
  const ligada = presentar.miBind({ nombre: "Lima" });
  expect(ligada("Buenas", ".")).toBe("Buenas, Lima.");
});

test("no ejecuta la función al ligarla, solo al llamarla", () => {
  const fn = vi.fn(() => "listo");
  const ligada = fn.miBind({});
  expect(fn, "miBind solo debe devolver otra función").not.toHaveBeenCalled();
  expect(typeof ligada).toBe("function");
  expect(ligada()).toBe("listo");
  expect(fn).toHaveBeenCalledTimes(1);
});

test("el this sigue fijo aunque la llames desde otro objeto", () => {
  const ligada = presentar.miBind({ nombre: "Ica" }, "Hola");
  const otro = { nombre: "Cusco", presentar: ligada };
  expect(otro.presentar("!")).toBe("Hola, Ica!");
});

test("no usa el bind nativo", () => {
  const espia = vi.spyOn(Function.prototype, "bind");
  const ligada = presentar.miBind({ nombre: "Puno" }, "Hola");
  expect(ligada("!")).toBe("Hola, Puno!");
  expect(espia, "el reto es implementarlo con apply o call").not.toHaveBeenCalled();
});
