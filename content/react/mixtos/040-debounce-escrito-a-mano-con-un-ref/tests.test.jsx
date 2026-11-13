// @vitest-environment jsdom
import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BuscadorConEspera } from "./solucion.jsx";

afterEach(() => {
  vi.useRealTimers();
});

function escribir(texto) {
  fireEvent.change(screen.getByLabelText("Buscar"), { target: { value: texto } });
}

function avanzar(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

test("el input muestra lo que escribes al instante", () => {
  vi.useFakeTimers();
  const onBuscar = vi.fn();
  render(<BuscadorConEspera onBuscar={onBuscar} />);
  escribir("mar");
  expect(screen.getByLabelText("Buscar").value).toBe("mar");
  expect(onBuscar).not.toHaveBeenCalled();
});

test("no avisa antes de que pasen 300 ms desde la última tecla", () => {
  vi.useFakeTimers();
  const onBuscar = vi.fn();
  render(<BuscadorConEspera onBuscar={onBuscar} />);
  escribir("m");
  avanzar(200);
  escribir("ma");
  avanzar(299);
  expect(onBuscar).not.toHaveBeenCalled();
  avanzar(1);
  expect(onBuscar).toHaveBeenCalledTimes(1);
});

test("si escribes seguido, avisa una sola vez con el último texto", () => {
  vi.useFakeTimers();
  const onBuscar = vi.fn();
  render(<BuscadorConEspera onBuscar={onBuscar} />);
  for (const valor of ["m", "ma", "mar"]) escribir(valor);
  avanzar(300);
  expect(onBuscar).toHaveBeenCalledTimes(1);
  expect(onBuscar).toHaveBeenCalledWith("mar");
});

test("respeta una espera personalizada", () => {
  vi.useFakeTimers();
  const onBuscar = vi.fn();
  render(<BuscadorConEspera onBuscar={onBuscar} espera={1000} />);
  escribir("pizza");
  avanzar(999);
  expect(onBuscar).not.toHaveBeenCalled();
  avanzar(1);
  expect(onBuscar).toHaveBeenCalledWith("pizza");
});

test("al desmontar cancela la búsqueda pendiente", () => {
  vi.useFakeTimers();
  const onBuscar = vi.fn();
  const { unmount } = render(<BuscadorConEspera onBuscar={onBuscar} />);
  escribir("mar");
  unmount();
  avanzar(300);
  expect(onBuscar).not.toHaveBeenCalled();
});
