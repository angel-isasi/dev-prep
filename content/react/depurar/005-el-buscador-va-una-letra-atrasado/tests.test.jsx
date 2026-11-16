// @vitest-environment jsdom
import { test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Buscador } from "./solucion.jsx";

function escribir(input, ...textos) {
  for (const value of textos) fireEvent.change(input, { target: { value } });
}

test("busca con el texto que hay ahora, no con el anterior", () => {
  const onBuscar = vi.fn();
  render(<Buscador onBuscar={onBuscar} />);
  escribir(screen.getByRole("searchbox"), "r", "re", "rea");
  expect(onBuscar).toHaveBeenLastCalledWith("rea");
});

test("avisa una vez por cada cambio, con cada texto", () => {
  const onBuscar = vi.fn();
  render(<Buscador onBuscar={onBuscar} />);
  escribir(screen.getByRole("searchbox"), "r", "re");
  expect(onBuscar.mock.calls).toEqual([["r"], ["re"]]);
});

test("al borrar todo, busca con el texto vacío", () => {
  const onBuscar = vi.fn();
  render(<Buscador onBuscar={onBuscar} />);
  escribir(screen.getByRole("searchbox"), "c", "cs", "");
  expect(onBuscar).toHaveBeenLastCalledWith("");
});

test("el input muestra lo que se escribe", () => {
  render(<Buscador onBuscar={() => {}} />);
  const input = screen.getByRole("searchbox");
  escribir(input, "react");
  expect(input.value).toBe("react");
});
