// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Buscador } from "./solucion.jsx";

const ITEMS = ["Arqueología", "Turismo", "Comunicación"];

function escribir(texto) {
  fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: texto } });
}

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("al inicio muestra todos los items", () => {
  render(<Buscador items={ITEMS} />);
  expect(textosVisibles()).toEqual(ITEMS);
});

test("filtra mientras escribes", () => {
  render(<Buscador items={ITEMS} />);
  escribir("arqueo");
  expect(textosVisibles()).toEqual(["Arqueología"]);
});

test("no distingue mayúsculas", () => {
  render(<Buscador items={ITEMS} />);
  escribir("TURISMO");
  expect(textosVisibles()).toEqual(["Turismo"]);
});

test("no distingue tildes", () => {
  render(<Buscador items={ITEMS} />);
  escribir("comunicacion");
  expect(textosVisibles()).toEqual(["Comunicación"]);
});

test("ignora espacios al inicio y al final", () => {
  render(<Buscador items={ITEMS} />);
  escribir("  turismo  ");
  expect(textosVisibles()).toEqual(["Turismo"]);
});

test('muestra "Sin resultados" si nada coincide', () => {
  render(<Buscador items={ITEMS} />);
  escribir("xyz");
  expect(textosVisibles()).toEqual([]);
  expect(screen.getByText(/^Sin resultados/)).toBeTruthy();
});
