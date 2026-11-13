// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Carga } from "./solucion.jsx";

test("si carga bien, muestra Cargando… y luego el dato", async () => {
  render(<Carga cargar={async () => "Menú del día"} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("Menú del día")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si falla, muestra el error y el botón Reintentar", async () => {
  render(<Carga cargar={vi.fn().mockRejectedValue(new Error("red"))} />);
  expect((await screen.findByRole("alert")).textContent).toBe("No se pudo cargar el menú");
  expect(screen.getByRole("button").textContent).toBe("Reintentar");
});

test("Reintentar vuelve a cargar y muestra el dato", async () => {
  const cargar = vi.fn().mockRejectedValueOnce(new Error("red")).mockResolvedValue("Menú listo");
  render(<Carga cargar={cargar} />);
  fireEvent.click(await screen.findByText("Reintentar"));
  expect(screen.getByText("Cargando…")).toBeTruthy();
  expect(await screen.findByText("Menú listo")).toBeTruthy();
  expect(cargar).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).toBeNull();
});

test("si el reintento también falla, vuelve a mostrar el error", async () => {
  const cargar = vi.fn().mockRejectedValue(new Error("red"));
  render(<Carga cargar={cargar} />);
  fireEvent.click(await screen.findByText("Reintentar"));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(cargar).toHaveBeenCalledTimes(2);
});
