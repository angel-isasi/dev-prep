import { test, expect } from "vitest";
import { presentarCon, presentarConLista, crearPresentador } from "./solucion.js";

test("presentarCon presenta a la persona con argumentos sueltos", () => {
  expect(presentarCon({ nombre: "Ana" }, "Hola", "!")).toBe("Hola, soy Ana!");
  expect(presentarCon({ nombre: "Luis" }, "Buenas", ".")).toBe("Buenas, soy Luis.");
});

test("presentarConLista recibe los argumentos en un arreglo", () => {
  expect(presentarConLista({ nombre: "Rosa" }, ["Hola", "!"])).toBe("Hola, soy Rosa!");
  expect(presentarConLista({ nombre: "Pedro" }, ["Qué tal", "?"])).toBe("Qué tal, soy Pedro?");
});

test("crearPresentador devuelve una función que recuerda a la persona", () => {
  const presentarAna = crearPresentador({ nombre: "Ana" });
  expect(typeof presentarAna).toBe("function");
  expect(presentarAna("Buenas", ".")).toBe("Buenas, soy Ana.");
});

test("el presentador funciona como callback", () => {
  const presentarAna = crearPresentador({ nombre: "Ana" });
  const saludos = ["Hola", "Qué tal"].map((s) => presentarAna(s, "!"));
  expect(saludos).toEqual(["Hola, soy Ana!", "Qué tal, soy Ana!"]);
});

test("el presentador sigue atado aunque lo guarde otro objeto", () => {
  const presentarAna = crearPresentador({ nombre: "Ana" });
  const otro = { nombre: "Luis", hablar: presentarAna };
  expect(otro.hablar("Hola", "!")).toBe("Hola, soy Ana!");
});

test("no modifica a la persona", () => {
  const ana = { nombre: "Ana" };
  presentarCon(ana, "Hola", "!");
  presentarConLista(ana, ["Hola", "!"]);
  crearPresentador(ana)("Hola", "!");
  expect(ana).toEqual({ nombre: "Ana" });
});
