// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cantidades } from "./solucion.jsx";

function crearInicial() {
  return [
    { id: 1, nombre: "Margarita", cantidad: 1 },
    { id: 2, nombre: "Hawaiana", cantidad: 3 },
  ];
}

function clic(etiqueta, veces = 1) {
  for (let i = 0; i < veces; i++) fireEvent.click(screen.getByLabelText(etiqueta));
}

test("sube y baja la cantidad con los botones", () => {
  render(<Cantidades inicial={[{ id: 1, nombre: "Margarita", cantidad: 1 }]} />);
  clic("Más Margarita", 2);
  clic("Menos Margarita");
  expect(screen.getByText(/Margarita x2/)).toBeTruthy();
});

test("la cantidad nunca baja de 1", () => {
  render(<Cantidades inicial={crearInicial()} />);
  clic("Menos Margarita", 3);
  expect(screen.getByText(/Margarita x1/)).toBeTruthy();
  expect(screen.queryByText(/Margarita x0/)).toBeNull();
});

test("solo cambia el item cuyo botón tocaste", () => {
  render(<Cantidades inicial={crearInicial()} />);
  clic("Más Hawaiana");
  expect(screen.getByText(/Hawaiana x4/)).toBeTruthy();
  expect(screen.getByText(/Margarita x1/)).toBeTruthy();
});

test("no modifica el arreglo inicial ni sus objetos", () => {
  const inicial = crearInicial();
  render(<Cantidades inicial={inicial} />);
  clic("Más Margarita", 2);
  expect(inicial[0].cantidad).toBe(1);
  expect(screen.getByText(/Margarita x3/)).toBeTruthy();
});
