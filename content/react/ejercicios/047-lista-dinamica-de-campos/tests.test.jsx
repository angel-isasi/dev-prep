// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Ingredientes } from "./solucion.jsx";

const campo = (n) => screen.getByLabelText(`Ingrediente ${n}`);
const escribir = (n, texto) => fireEvent.change(campo(n), { target: { value: texto } });
const valores = () => screen.getAllByRole("textbox").map((input) => input.value);

test("empieza con un campo vacío", () => {
  render(<Ingredientes />);
  expect(valores()).toEqual([""]);
  expect(screen.getByLabelText("Quitar ingrediente 1")).toBeTruthy();
});

test('"Agregar ingrediente" suma un campo vacío al final', () => {
  render(<Ingredientes />);
  escribir(1, "queso");
  fireEvent.click(screen.getByText("Agregar ingrediente"));
  expect(valores()).toEqual(["queso", ""]);
  expect(campo(2)).toBeTruthy();
});

test("quitar el primero conserva el valor del segundo", () => {
  render(<Ingredientes />);
  escribir(1, "queso");
  fireEvent.click(screen.getByText("Agregar ingrediente"));
  escribir(2, "jamón");
  fireEvent.click(screen.getByLabelText("Quitar ingrediente 1"));
  expect(valores()).toEqual(["jamón"]);
  expect(campo(1).value).toBe("jamón");
});

test("quitar el del medio deja los otros en orden", () => {
  render(<Ingredientes />);
  escribir(1, "queso");
  fireEvent.click(screen.getByText("Agregar ingrediente"));
  escribir(2, "jamón");
  fireEvent.click(screen.getByText("Agregar ingrediente"));
  escribir(3, "piña");
  fireEvent.click(screen.getByLabelText("Quitar ingrediente 2"));
  expect(valores()).toEqual(["queso", "piña"]);
});

test("cada fila conserva su propio input al quitar otra (key estable)", () => {
  render(<Ingredientes />);
  escribir(1, "queso");
  fireEvent.click(screen.getByText("Agregar ingrediente"));
  escribir(2, "jamón");
  const inputDeJamon = campo(2);
  inputDeJamon.focus();
  fireEvent.click(screen.getByLabelText("Quitar ingrediente 1"));
  // El mismo elemento del DOM sigue en pantalla (ahora es el 1) y no perdió el foco.
  expect(campo(1)).toBe(inputDeJamon);
  expect(document.activeElement).toBe(inputDeJamon);
});
