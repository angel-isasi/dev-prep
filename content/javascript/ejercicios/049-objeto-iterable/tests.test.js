import { test, expect } from "vitest";
import { Playlist } from "./solucion.js";

test("funciona con spread", () => {
  const lista = new Playlist("A", "B", "C");
  expect([...lista]).toEqual(["A", "B", "C"]);
});

test("funciona con for...of, en orden", () => {
  const lista = new Playlist("A", "B", "C");
  const vistas = [];
  for (const cancion of lista) vistas.push(cancion);
  expect(vistas).toEqual(["A", "B", "C"]);
});

test("funciona con Array.from y con desestructuración", () => {
  const lista = new Playlist("A", "B", "C");
  expect(Array.from(lista)).toEqual(["A", "B", "C"]);
  const [primera, segunda] = lista;
  expect([primera, segunda]).toEqual(["A", "B"]);
});

test("se puede recorrer varias veces", () => {
  const lista = new Playlist("A", "B");
  expect([...lista]).toEqual(["A", "B"]);
  expect([...lista]).toEqual(["A", "B"]);
});

test("una playlist vacía no entrega nada", () => {
  expect([...new Playlist()]).toEqual([]);
});

test("modificar la copia no cambia la playlist", () => {
  const lista = new Playlist("A", "B");
  const copia = [...lista];
  copia.push("Z");
  expect([...lista]).toEqual(["A", "B"]);
});
