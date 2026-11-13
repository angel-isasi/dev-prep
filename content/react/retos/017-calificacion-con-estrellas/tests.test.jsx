// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Estrellas } from "./solucion.jsx";

const dibujo = () =>
  screen
    .getAllByRole("radio")
    .map((b) => b.textContent)
    .join("");

test("al inicio muestra 5 estrellas vacías con sus etiquetas", () => {
  render(<Estrellas />);
  expect(screen.getAllByRole("radio")).toHaveLength(5);
  expect(dibujo()).toBe("☆☆☆☆☆");
  expect(screen.getByLabelText("1 estrella")).toBeTruthy();
  expect(screen.getByLabelText("5 estrellas")).toBeTruthy();
});

test("al hacer clic llena hasta esa estrella y avisa con onCambio", () => {
  const onCambio = vi.fn();
  render(<Estrellas onCambio={onCambio} />);
  fireEvent.click(screen.getByLabelText("4 estrellas"));
  expect(onCambio).toHaveBeenCalledWith(4);
  expect(dibujo()).toBe("★★★★☆");
  expect(screen.getByLabelText("4 estrellas").getAttribute("aria-checked")).toBe("true");
  expect(screen.getByLabelText("3 estrellas").getAttribute("aria-checked")).toBe("false");
});

test("al pasar el mouse previsualiza sin cambiar el valor", () => {
  const onCambio = vi.fn();
  render(<Estrellas onCambio={onCambio} />);
  fireEvent.click(screen.getByLabelText("4 estrellas"));
  fireEvent.mouseEnter(screen.getByLabelText("2 estrellas"));
  expect(dibujo()).toBe("★★☆☆☆");
  expect(onCambio).toHaveBeenCalledTimes(1);
});

test("al sacar el mouse vuelve a mostrar el valor elegido", () => {
  render(<Estrellas />);
  fireEvent.click(screen.getByLabelText("4 estrellas"));
  fireEvent.mouseEnter(screen.getByLabelText("2 estrellas"));
  fireEvent.mouseLeave(screen.getByLabelText("2 estrellas"));
  expect(dibujo()).toBe("★★★★☆");
});

test("respeta la prop total y funciona sin onCambio", () => {
  render(<Estrellas total={3} />);
  expect(screen.getAllByRole("radio")).toHaveLength(3);
  fireEvent.click(screen.getByLabelText("3 estrellas"));
  expect(dibujo()).toBe("★★★");
});
