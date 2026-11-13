// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Campo } from "./solucion.jsx";

test("el label queda unido al input con htmlFor e id", () => {
  render(<Campo etiqueta="Nombre" />);
  const input = screen.getByLabelText("Nombre");
  expect(input.tagName).toBe("INPUT");
  expect(input.id).not.toBe("");
  expect(document.querySelector("label").getAttribute("for")).toBe(input.id);
});

test("el input no está dentro del label", () => {
  render(<Campo etiqueta="Nombre" />);
  expect(document.querySelector("label input")).toBeNull();
});

test("pasa el resto de props al input", () => {
  render(<Campo etiqueta="Teléfono" type="tel" placeholder="999 999 999" />);
  const input = screen.getByLabelText("Teléfono");
  expect(input.type).toBe("tel");
  expect(input.placeholder).toBe("999 999 999");
});

test("dos campos distintos tienen ids distintos", () => {
  render(
    <>
      <Campo etiqueta="Nombre" />
      <Campo etiqueta="Teléfono" type="tel" />
    </>,
  );
  expect(screen.getByLabelText("Teléfono").type).toBe("tel");
  expect(screen.getByLabelText("Nombre").id).not.toBe(screen.getByLabelText("Teléfono").id);
});

test("dos campos con la misma etiqueta no comparten id", () => {
  render(
    <>
      <Campo etiqueta="Nombre" />
      <Campo etiqueta="Nombre" />
    </>,
  );
  const [primero, segundo] = screen.getAllByLabelText("Nombre");
  expect(primero).not.toBe(segundo);
  expect(primero.id).not.toBe(segundo.id);
});
