// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pendientes } from "./solucion.jsx";

const iniciales = [
  { id: 1, texto: "Comprar pan" },
  { id: 2, texto: "Pagar la luz" },
  { id: 3, texto: "Llamar a mamá" },
];

const casilla = (texto) => screen.getByRole("checkbox", { name: texto });
const borrar = (texto) => fireEvent.click(screen.getByRole("button", { name: `Borrar ${texto}` }));

test("al borrar otra tarea, la marcada sigue marcada", () => {
  render(<Pendientes iniciales={iniciales} />);
  fireEvent.click(casilla("Pagar la luz"));
  borrar("Comprar pan");
  expect(casilla("Pagar la luz").checked).toBe(true);
});

test("la marca no salta a la tarea de al lado", () => {
  render(<Pendientes iniciales={iniciales} />);
  fireEvent.click(casilla("Pagar la luz"));
  borrar("Comprar pan");
  expect(casilla("Llamar a mamá").checked).toBe(false);
});

test("borrar quita la tarea de la lista", () => {
  render(<Pendientes iniciales={iniciales} />);
  borrar("Pagar la luz");
  expect(screen.getAllByRole("checkbox").map((c) => c.parentElement.textContent)).toEqual([
    "Comprar pan",
    "Llamar a mamá",
  ]);
});

test("marcar una casilla solo marca esa tarea", () => {
  render(<Pendientes iniciales={iniciales} />);
  fireEvent.click(casilla("Llamar a mamá"));
  expect(screen.getAllByRole("checkbox").map((c) => c.checked)).toEqual([false, false, true]);
});
