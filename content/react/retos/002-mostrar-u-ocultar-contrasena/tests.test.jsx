// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampoClave } from "./solucion.jsx";

test('al inicio el input es de tipo "password"', () => {
  render(<CampoClave />);
  expect(screen.getByLabelText("Contraseña").type).toBe("password");
  expect(screen.getByText("Mostrar")).toBeTruthy();
});

test('"Mostrar" cambia el input a texto y el botón a "Ocultar"', () => {
  render(<CampoClave />);
  fireEvent.click(screen.getByText("Mostrar"));
  expect(screen.getByLabelText("Contraseña").type).toBe("text");
  expect(screen.getByText("Ocultar")).toBeTruthy();
  expect(screen.queryByText("Mostrar")).toBeNull();
});

test("un segundo clic vuelve a ocultarla", () => {
  render(<CampoClave />);
  fireEvent.click(screen.getByText("Mostrar"));
  fireEvent.click(screen.getByText("Ocultar"));
  expect(screen.getByLabelText("Contraseña").type).toBe("password");
  expect(screen.getByText("Mostrar")).toBeTruthy();
});

test("aria-pressed indica si se está mostrando", () => {
  render(<CampoClave />);
  const boton = screen.getByRole("button");
  expect(boton.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(boton);
  expect(boton.getAttribute("aria-pressed")).toBe("true");
});

test("lo escrito no se pierde al alternar", () => {
  render(<CampoClave />);
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "secreta123" } });
  fireEvent.click(screen.getByText("Mostrar"));
  expect(screen.getByLabelText("Contraseña").value).toBe("secreta123");
});

test("dentro de un formulario, el botón no lo envía", () => {
  const onSubmit = vi.fn((evento) => evento.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <CampoClave />
    </form>
  );
  fireEvent.click(screen.getByText("Mostrar"));
  expect(onSubmit).not.toHaveBeenCalled();
});
