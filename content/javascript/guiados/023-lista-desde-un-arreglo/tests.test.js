// @vitest-environment jsdom
import { test, expect } from "vitest";
import { crearLista } from "./solucion.js";

const textos = (elemento) => [...elemento.children].map((hijo) => hijo.textContent);

test("devuelve un elemento <ul>", () => {
  const lista = crearLista(["Pan"]);
  expect(lista.tagName).toBe("UL");
});

test("crea un <li> por cada elemento, en orden", () => {
  const lista = crearLista(["Pan", "Leche", "Huevos"]);
  expect(lista.children.length).toBe(3);
  expect([...lista.children].every((hijo) => hijo.tagName === "LI")).toBe(true);
  expect(textos(lista)).toEqual(["Pan", "Leche", "Huevos"]);
});

test("con un arreglo vacío devuelve un <ul> sin hijos", () => {
  const lista = crearLista([]);
  expect(lista.tagName).toBe("UL");
  expect(lista.children.length).toBe(0);
});

test("acepta números", () => {
  expect(textos(crearLista([1, 2, 3]))).toEqual(["1", "2", "3"]);
});

test("muestra las etiquetas como texto, no como HTML (evita XSS)", () => {
  const lista = crearLista(["<b>hola</b>", '<img src="x" onerror="alert(1)">']);
  const [primero, segundo] = lista.children;
  expect(primero.textContent).toBe("<b>hola</b>");
  expect(primero.children.length).toBe(0);
  expect(segundo.querySelector("img")).toBeNull();
});
