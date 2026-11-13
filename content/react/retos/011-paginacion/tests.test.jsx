// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ListaPaginada } from "./solucion.jsx";

const ITEMS = ["a", "b", "c", "d", "e"];

const visibles = () => screen.queryAllByRole("listitem").map((li) => li.textContent);
const boton = (nombre) => screen.getByRole("button", { name: nombre });

test("al inicio muestra la página 1 y Anterior está deshabilitado", () => {
  render(<ListaPaginada items={ITEMS} porPagina={2} />);
  expect(visibles()).toEqual(["a", "b"]);
  expect(screen.getByText(/Página 1 de 3/)).toBeTruthy();
  expect(boton("Anterior").disabled).toBe(true);
  expect(boton("Siguiente").disabled).toBe(false);
});

test("Siguiente avanza a la página 2", () => {
  render(<ListaPaginada items={ITEMS} porPagina={2} />);
  fireEvent.click(boton("Siguiente"));
  expect(visibles()).toEqual(["c", "d"]);
  expect(screen.getByText(/Página 2 de 3/)).toBeTruthy();
});

test("en la última página muestra lo que queda y deshabilita Siguiente", () => {
  render(<ListaPaginada items={ITEMS} porPagina={2} />);
  fireEvent.click(boton("Siguiente"));
  fireEvent.click(boton("Siguiente"));
  expect(visibles()).toEqual(["e"]);
  expect(screen.getByText(/Página 3 de 3/)).toBeTruthy();
  expect(boton("Siguiente").disabled).toBe(true);
});

test("Anterior vuelve a la página previa", () => {
  render(<ListaPaginada items={ITEMS} porPagina={2} />);
  fireEvent.click(boton("Siguiente"));
  fireEvent.click(boton("Siguiente"));
  fireEvent.click(boton("Anterior"));
  expect(visibles()).toEqual(["c", "d"]);
});

test("usa 3 por página si no recibe porPagina", () => {
  render(<ListaPaginada items={ITEMS} />);
  expect(visibles()).toEqual(["a", "b", "c"]);
  expect(screen.getByText(/Página 1 de 2/)).toBeTruthy();
});

test("con la lista vacía hay 1 página y los dos botones están deshabilitados", () => {
  render(<ListaPaginada items={[]} porPagina={2} />);
  expect(screen.getByText(/Página 1 de 1/)).toBeTruthy();
  expect(boton("Anterior").disabled).toBe(true);
  expect(boton("Siguiente").disabled).toBe(true);
});
