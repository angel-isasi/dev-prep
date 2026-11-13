import { test, expect } from "vitest";
import { Usuario, Editor } from "./solucion.js";

test("un usuario solo puede leer", () => {
  const ana = new Usuario("Ana");
  expect([ana.puede("leer"), ana.puede("publicar"), ana.puede("borrar")]).toEqual([true, false, false]);
});

test("un editor puede leer y publicar, pero no borrar", () => {
  const editor = new Editor("Marilyn");
  expect([editor.puede("leer"), editor.puede("publicar"), editor.puede("borrar")]).toEqual([true, true, false]);
});

test("describir dice el nombre y la clase de cada objeto", () => {
  expect(new Usuario("Ana").describir()).toBe("Ana (Usuario)");
  expect(new Editor("Marilyn").describir()).toBe("Marilyn (Editor)");
});

test("el editor hereda el nombre del constructor de Usuario", () => {
  expect(new Editor("Marilyn").nombre).toBe("Marilyn");
});

test("un editor también es un Usuario", () => {
  const editor = new Editor("Marilyn");
  expect(editor instanceof Editor).toBe(true);
  expect(editor instanceof Usuario).toBe(true);
  expect(new Usuario("Ana") instanceof Editor).toBe(false);
});
