// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tablero } from "./solucion.jsx";

function textosVisibles() {
  return screen.queryAllByRole("listitem").map((li) => li.textContent);
}

test("muestra lo que cargó y marca lo que falló", async () => {
  const fuentes = [
    { nombre: "Ventas", cargar: async () => "S/ 540" },
    {
      nombre: "Clima",
      cargar: async () => {
        throw new Error("caído");
      },
    },
  ];
  render(<Tablero fuentes={fuentes} />);
  expect(await screen.findByText("Ventas: S/ 540")).toBeTruthy();
  expect(screen.getByText("Clima: no disponible")).toBeTruthy();
});

test("muestra Cargando… mientras espera", async () => {
  const fuentes = [{ nombre: "Pedidos", cargar: async () => "12" }];
  render(<Tablero fuentes={fuentes} />);
  expect(screen.getByText("Cargando…")).toBeTruthy();
  await screen.findByText("Pedidos: 12");
});

test("llama a todas las fuentes y respeta su orden", async () => {
  const fuentes = [
    { nombre: "A", cargar: vi.fn(() => new Promise((r) => setTimeout(() => r("lenta"), 20))) },
    { nombre: "B", cargar: vi.fn(async () => "rápida") },
  ];
  render(<Tablero fuentes={fuentes} />);
  expect(fuentes[0].cargar).toHaveBeenCalledTimes(1);
  expect(fuentes[1].cargar).toHaveBeenCalledTimes(1);
  await screen.findByText("A: lenta");
  expect(textosVisibles()).toEqual(["A: lenta", "B: rápida"]);
});

test("si todas fallan, todas aparecen como no disponibles", async () => {
  const fallar = async () => {
    throw new Error("x");
  };
  const fuentes = [
    { nombre: "Ventas", cargar: fallar },
    { nombre: "Clima", cargar: fallar },
  ];
  render(<Tablero fuentes={fuentes} />);
  await screen.findByText("Ventas: no disponible");
  expect(textosVisibles()).toEqual(["Ventas: no disponible", "Clima: no disponible"]);
});
