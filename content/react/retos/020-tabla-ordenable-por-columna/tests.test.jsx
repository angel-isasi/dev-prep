// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TablaOrdenable } from "./solucion.jsx";

const crearFilas = () => [
  { nombre: "Terror", votos: 12 },
  { nombre: "Drama", votos: 30 },
  { nombre: "Acción", votos: 7 },
];

// Textos de la primera celda de cada fila del cuerpo (se salta la del encabezado)
const primeraColumna = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((fila) => fila.cells[0].textContent);

const clicEn = (columna) => fireEvent.click(screen.getByRole("button", { name: columna }));

test("al inicio ordena por la primera columna, alfabético en español", () => {
  render(<TablaOrdenable filas={crearFilas()} />);
  expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
    "nombre",
    "votos",
  ]);
  expect(primeraColumna()).toEqual(["Acción", "Drama", "Terror"]);
});

test("clic en otra columna ordena por ella, ascendente y como números", () => {
  render(<TablaOrdenable filas={crearFilas()} />);
  clicEn("votos");
  expect(primeraColumna()).toEqual(["Acción", "Terror", "Drama"]);
});

test("un segundo clic en la misma columna invierte el orden", () => {
  render(<TablaOrdenable filas={crearFilas()} />);
  clicEn("votos");
  clicEn("votos");
  expect(primeraColumna()).toEqual(["Drama", "Terror", "Acción"]);
});

test("clic en la columna ya ordenada al inicio la pone descendente", () => {
  render(<TablaOrdenable filas={crearFilas()} />);
  clicEn("nombre");
  expect(primeraColumna()).toEqual(["Terror", "Drama", "Acción"]);
});

test("marca la columna ordenada con aria-sort", () => {
  render(<TablaOrdenable filas={crearFilas()} />);
  const encabezado = (nombre) => screen.getByRole("columnheader", { name: nombre });
  expect(encabezado("nombre").getAttribute("aria-sort")).toBe("ascending");
  expect(encabezado("votos").getAttribute("aria-sort")).toBe("none");
  clicEn("votos");
  clicEn("votos");
  expect(encabezado("votos").getAttribute("aria-sort")).toBe("descending");
  expect(encabezado("nombre").getAttribute("aria-sort")).toBe("none");
});

test("no modifica el arreglo filas que recibe", () => {
  const filas = crearFilas();
  render(<TablaOrdenable filas={filas} />);
  clicEn("votos");
  expect(filas.map((f) => f.nombre)).toEqual(["Terror", "Drama", "Acción"]);
});
