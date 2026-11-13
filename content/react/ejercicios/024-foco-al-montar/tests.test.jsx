// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Buscador } from "./solucion.jsx";

test("el input recibe el foco al montar", () => {
  render(<Buscador />);
  expect(document.activeElement).toBe(screen.getByLabelText("Buscar pizza"));
});

test('el campo "Buscar pizza" es un input', () => {
  render(<Buscador />);
  expect(screen.getByLabelText("Buscar pizza").tagName).toBe("INPUT");
});

test("no roba el foco si el componente se vuelve a renderizar", () => {
  const { rerender } = render(<Buscador />);

  // El usuario se va a otro elemento de la página.
  const otroBoton = document.createElement("button");
  document.body.appendChild(otroBoton);
  otroBoton.focus();

  rerender(<Buscador />);
  expect(document.activeElement).toBe(otroBoton);

  otroBoton.remove();
});

test("cada vez que aparece de nuevo vuelve a enfocarse", () => {
  const { unmount } = render(<Buscador />);
  unmount();
  render(<Buscador />);
  expect(document.activeElement).toBe(screen.getByLabelText("Buscar pizza"));
});
