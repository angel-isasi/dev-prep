// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { comparar, Distritos } from "./solucion.jsx";

function textos() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("ordena distritos como en un diccionario en español", () => {
  render(<Distritos nombres={["Ñaña", "Ocucaje", "ica", "Áncash", "Nasca"]} />);
  expect(textos()).toEqual(["Áncash", "ica", "Nasca", "Ñaña", "Ocucaje"]);
});

test("la ñ va después de la n y antes de la o", () => {
  render(<Distritos nombres={["oca", "ñandú", "nido"]} />);
  expect(textos()).toEqual(["nido", "ñandú", "oca"]);
});

test("las mayúsculas y las tildes no se adelantan", () => {
  render(<Distritos nombres={["zapallo", "Brea", "ámbar", "Ayacucho"]} />);
  expect(textos()).toEqual(["ámbar", "Ayacucho", "Brea", "zapallo"]);
});

test("no modifica el arreglo que recibe por props", () => {
  const nombres = ["Pisco", "Chincha", "Ica"];
  render(<Distritos nombres={nombres} />);
  expect(nombres).toEqual(["Pisco", "Chincha", "Ica"]);
  expect(textos()).toEqual(["Chincha", "Ica", "Pisco"]);
});

test("comparar ignora mayúsculas y tildes", () => {
  expect(comparar("a", "Á")).toBe(0);
  expect(comparar("árbol", "Barco")).toBeLessThan(0);
  expect(comparar("ñu", "nube")).toBeGreaterThan(0);
});
