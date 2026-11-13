// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TresEnRaya } from "./solucion.jsx";

const casilla = (n) => screen.getByLabelText(`Casilla ${n}`);

function jugar(...numeros) {
  for (const n of numeros) fireEvent.click(casilla(n));
}

const tablero = () =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => casilla(n).textContent || "·").join("");

test("empieza con el tablero vacío y turno de X", () => {
  render(<TresEnRaya />);
  expect(tablero()).toBe("·········");
  expect(screen.getByText("Turno de X")).toBeTruthy();
});

test("los turnos se alternan entre X y O", () => {
  render(<TresEnRaya />);
  jugar(1);
  expect(casilla(1).textContent).toBe("X");
  expect(screen.getByText("Turno de O")).toBeTruthy();
  jugar(5);
  expect(casilla(5).textContent).toBe("O");
  expect(screen.getByText("Turno de X")).toBeTruthy();
});

test("no se puede jugar en una casilla ocupada", () => {
  render(<TresEnRaya />);
  jugar(1, 1);
  expect(casilla(1).textContent).toBe("X");
  expect(screen.getByText("Turno de O")).toBeTruthy();
});

test("detecta al ganador y bloquea el tablero", () => {
  render(<TresEnRaya />);
  jugar(1, 4, 2, 5, 3); // X completa la primera fila
  expect(screen.getByText("Ganó X")).toBeTruthy();
  jugar(9);
  expect(casilla(9).textContent).toBe("");
});

test("detecta el empate", () => {
  render(<TresEnRaya />);
  // X O X / X O O / O X X : nadie hace tres en raya
  jugar(1, 2, 3, 5, 4, 6, 8, 7, 9);
  expect(screen.getByText("Empate")).toBeTruthy();
});

test('"Reiniciar" deja el tablero vacío y el turno a X', () => {
  render(<TresEnRaya />);
  jugar(1, 4, 2, 5, 3);
  fireEvent.click(screen.getByText("Reiniciar"));
  expect(tablero()).toBe("·········");
  expect(screen.getByText("Turno de X")).toBeTruthy();
});
