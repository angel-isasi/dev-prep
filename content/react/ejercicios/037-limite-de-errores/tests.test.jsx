// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LimiteDeError } from "./solucion.jsx";

// React imprime en la consola los errores atrapados; los silenciamos en los tests.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function Rota() {
  throw new Error("boom");
}

test("si los hijos están bien, los muestra tal cual", () => {
  render(
    <LimiteDeError>
      <p>Carta del día</p>
    </LimiteDeError>,
  );
  expect(screen.getByText("Carta del día")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si un hijo lanza un error, muestra el mensaje en un alert", () => {
  render(
    <LimiteDeError>
      <Rota />
    </LimiteDeError>,
  );
  expect(screen.getByRole("alert").textContent).toBe("Algo salió mal. Recarga la página.");
});

test("lo que está fuera del límite sigue visible", () => {
  render(
    <div>
      <h1>Pizzería</h1>
      <LimiteDeError>
        <Rota />
      </LimiteDeError>
    </div>,
  );
  expect(screen.getByText("Pizzería")).toBeTruthy();
  expect(screen.getByRole("alert")).toBeTruthy();
});

test("cada límite solo reemplaza su propia zona", () => {
  render(
    <div>
      <LimiteDeError>
        <p>Promociones</p>
      </LimiteDeError>
      <LimiteDeError>
        <Rota />
      </LimiteDeError>
    </div>,
  );
  expect(screen.getByText("Promociones")).toBeTruthy();
  expect(screen.getAllByRole("alert").length).toBe(1);
});
