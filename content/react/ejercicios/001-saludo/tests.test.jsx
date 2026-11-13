// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Saludo } from "./solucion.jsx";

test('sin nombre saluda a "invitado"', () => {
  render(<Saludo />);
  expect(screen.getByRole("heading").textContent).toBe("Hola, invitado");
});

test("saluda con el nombre que recibe", () => {
  render(<Saludo nombre="Angel" />);
  expect(screen.getByRole("heading").textContent).toBe("Hola, Angel");
});

test("el saludo es un título <h1>", () => {
  render(<Saludo nombre="Rosa" />);
  expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
});

test("cada uso del componente muestra su propio nombre", () => {
  render(
    <>
      <Saludo nombre="Ana" />
      <Saludo />
    </>
  );
  const textos = screen.getAllByRole("heading").map((h) => h.textContent);
  expect(textos).toEqual(["Hola, Ana", "Hola, invitado"]);
});
