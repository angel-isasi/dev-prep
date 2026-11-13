// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Padre, rendersHijo } from "./solucion.jsx";

// `rendersHijo` es una variable exportada que Fila incrementa en cada render.
// Al importarla así, siempre leemos su valor actual.

const filas = () => screen.getAllByRole("listitem").map((li) => li.textContent);

test("muestra el contador y las filas", () => {
  render(<Padre />);
  expect(screen.getByText("Clics: 0")).toBeTruthy();
  expect(filas()).toEqual(["a Borrar", "b Borrar"]);
});

test("el contador sube con cada clic", () => {
  render(<Padre />);
  fireEvent.click(screen.getByText("Clics: 0"));
  fireEvent.click(screen.getByText("Clics: 1"));
  expect(screen.getByText("Clics: 2")).toBeTruthy();
});

test("las filas NO se vuelven a renderizar al contar clics", () => {
  render(<Padre />);
  const antes = rendersHijo;
  fireEvent.click(screen.getByText("Clics: 0"));
  fireEvent.click(screen.getByText("Clics: 1"));
  fireEvent.click(screen.getByText("Clics: 2"));
  expect(rendersHijo).toBe(antes);
});

test('"Borrar" sigue funcionando', () => {
  render(<Padre />);
  fireEvent.click(screen.getAllByText("Borrar")[0]);
  expect(filas()).toEqual(["b Borrar"]);
});

test("borrar una fila no vuelve a renderizar las otras", () => {
  render(<Padre />);
  fireEvent.click(screen.getByText("Clics: 0"));
  const antes = rendersHijo;
  fireEvent.click(screen.getAllByText("Borrar")[0]);
  expect(filas()).toEqual(["b Borrar"]);
  expect(rendersHijo).toBe(antes);
});
