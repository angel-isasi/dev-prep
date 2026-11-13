// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { alternar, SelectorIngredientes } from "./solucion.jsx";

test("alternar agrega al final si no está", () => {
  const inicial = Object.freeze(["queso"]);
  expect(alternar(inicial, "jamón")).toEqual(["queso", "jamón"]);
});

test("alternar quita si ya está", () => {
  const inicial = Object.freeze(["queso", "jamón"]);
  expect(alternar(inicial, "queso")).toEqual(["jamón"]);
});

test("alternar devuelve siempre un arreglo nuevo", () => {
  const inicial = Object.freeze(["queso"]);
  const resultado = alternar(inicial, "jamón");
  expect(resultado).not.toBe(inicial);
  expect(inicial).toEqual(["queso"]);
});

test("las casillas se marcan y desmarcan, y el resumen respeta el orden", () => {
  render(<SelectorIngredientes opciones={["queso", "jamón", "aceitunas"]} />);
  expect(screen.getByText("No elegiste nada")).toBeTruthy();

  fireEvent.click(screen.getByLabelText("aceitunas"));
  fireEvent.click(screen.getByLabelText("queso"));
  expect(screen.getByLabelText("aceitunas").checked).toBe(true);
  expect(screen.getByLabelText("jamón").checked).toBe(false);
  expect(screen.getByText("Elegiste: aceitunas, queso")).toBeTruthy();

  fireEvent.click(screen.getByLabelText("aceitunas"));
  expect(screen.getByLabelText("aceitunas").checked).toBe(false);
  expect(screen.getByText("Elegiste: queso")).toBeTruthy();
});
