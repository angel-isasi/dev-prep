// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MasVendidas } from "./solucion.jsx";

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("muestra las tres más vendidas, de mayor a menor", () => {
  render(<MasVendidas ventas={{ Margarita: 40, Hawaiana: 12, Pepperoni: 55, Vegana: 8 }} />);
  expect(textosVisibles()).toEqual(["Pepperoni (55)", "Margarita (40)", "Hawaiana (12)"]);
});

test("si hay menos de tres, muestra las que haya", () => {
  render(<MasVendidas ventas={{ Vegana: 8, Margarita: 40 }} />);
  expect(textosVisibles()).toEqual(["Margarita (40)", "Vegana (8)"]);
});

test("sin ventas, la lista queda vacía", () => {
  render(<MasVendidas ventas={{}} />);
  expect(textosVisibles()).toEqual([]);
});

test("no modifica la prop", () => {
  const ventas = Object.freeze({ Margarita: 40, Pepperoni: 55 });
  render(<MasVendidas ventas={ventas} />);
  expect(Object.keys(ventas)).toEqual(["Margarita", "Pepperoni"]);
  expect(textosVisibles()).toEqual(["Pepperoni (55)", "Margarita (40)"]);
});
