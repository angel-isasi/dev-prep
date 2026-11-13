// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Favorito } from "./solucion.jsx";

test('al inicio dice "Agregar a favoritos"', () => {
  render(<Favorito />);
  expect(screen.getByRole("button").textContent).toBe("Agregar a favoritos");
});

test('al hacer clic dice "Quitar de favoritos"', () => {
  render(<Favorito />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Quitar de favoritos")).toBeTruthy();
});

test("un segundo clic lo vuelve a desmarcar", () => {
  render(<Favorito />);
  const boton = screen.getByRole("button");
  fireEvent.click(boton);
  fireEvent.click(boton);
  expect(boton.textContent).toBe("Agregar a favoritos");
});

test("alterna con cada clic", () => {
  render(<Favorito />);
  const boton = screen.getByRole("button");
  const textos = [];
  for (let i = 0; i < 3; i++) {
    fireEvent.click(boton);
    textos.push(boton.textContent);
  }
  expect(textos).toEqual(["Quitar de favoritos", "Agregar a favoritos", "Quitar de favoritos"]);
});

test("aria-pressed refleja si es favorito", () => {
  render(<Favorito />);
  const boton = screen.getByRole("button");
  expect(boton.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(boton);
  expect(boton.getAttribute("aria-pressed")).toBe("true");
});
