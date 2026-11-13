// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { generarIds, Mesas } from "./solucion.jsx";

function textos() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

function agregar(veces) {
  for (let i = 0; i < veces; i++) fireEvent.click(screen.getByText("Agregar mesa"));
}

test("el generador entrega ids con el prefijo, empezando en 1", () => {
  const ids = generarIds("mesa");
  expect(ids.next().value).toBe("mesa-1");
  expect(ids.next().value).toBe("mesa-2");
  expect(ids.next().value).toBe("mesa-3");
});

test("dos generadores son independientes", () => {
  const mesas = generarIds("mesa");
  const pedidos = generarIds("pedido");
  mesas.next();
  mesas.next();
  expect(pedidos.next().value).toBe("pedido-1");
  expect(mesas.next().value).toBe("mesa-3");
});

test("al inicio no hay mesas", () => {
  render(<Mesas />);
  expect(textos()).toEqual([]);
});

test("cada clic agrega una mesa con el siguiente id", () => {
  render(<Mesas />);
  agregar(2);
  expect(textos()).toEqual(["mesa-1", "mesa-2"]);
});

test("con muchos clics los ids no se repiten", () => {
  render(<Mesas />);
  agregar(5);
  const lista = textos();
  expect(lista).toEqual(["mesa-1", "mesa-2", "mesa-3", "mesa-4", "mesa-5"]);
  expect(new Set(lista).size).toBe(5);
});
