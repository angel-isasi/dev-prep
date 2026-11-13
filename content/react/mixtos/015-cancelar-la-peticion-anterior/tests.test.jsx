// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Resultados } from "./solucion.jsx";

// Búsqueda falsa: "ma" tarda 40 ms y el resto 5 ms. Respeta el signal.
function crearBuscar() {
  return vi.fn(
    (texto, signal) =>
      new Promise((resolver, rechazar) => {
        const id = setTimeout(() => resolver([`resultado de ${texto}`]), texto === "ma" ? 40 : 5);
        signal.addEventListener("abort", () => {
          clearTimeout(id);
          rechazar(Object.assign(new Error("cancelada"), { name: "AbortError" }));
        });
      })
  );
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

test("una respuesta vieja y lenta no pisa a la nueva", async () => {
  const buscar = crearBuscar();
  const { rerender } = render(<Resultados texto="ma" buscar={buscar} />);
  rerender(<Resultados texto="mar" buscar={buscar} />);
  expect(await screen.findByText("resultado de mar")).toBeTruthy();
  await act(() => esperar(60));
  expect(screen.queryByText("resultado de ma")).toBeNull();
});

test("al cambiar el texto aborta la búsqueda anterior", () => {
  const buscar = crearBuscar();
  const { rerender } = render(<Resultados texto="ma" buscar={buscar} />);
  const signalViejo = buscar.mock.calls[0][1];
  expect(signalViejo.aborted).toBe(false);
  rerender(<Resultados texto="mar" buscar={buscar} />);
  expect(signalViejo.aborted).toBe(true);
  expect(buscar.mock.calls[1][1].aborted).toBe(false);
});

test("al desmontar aborta la búsqueda en curso", () => {
  const buscar = crearBuscar();
  const { unmount } = render(<Resultados texto="pizza" buscar={buscar} />);
  const signal = buscar.mock.calls[0][1];
  unmount();
  expect(signal.aborted).toBe(true);
});

test("si la búsqueda falla de verdad, la lista queda vacía", async () => {
  const buscar = vi.fn(async (texto) => {
    if (texto === "error") throw new Error("servidor caído");
    return ["Margarita"];
  });
  const { rerender } = render(<Resultados texto="mar" buscar={buscar} />);
  expect(await screen.findByText("Margarita")).toBeTruthy();
  rerender(<Resultados texto="error" buscar={buscar} />);
  await act(() => esperar(0));
  expect(screen.queryAllByRole("listitem")).toEqual([]);
});
