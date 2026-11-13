// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Semaforo } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const luz = () => screen.getByTestId("luz").textContent;

function avanzar(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

test("empieza en rojo", () => {
  render(<Semaforo />);
  expect(luz()).toBe("rojo");
});

test("el rojo dura 3 segundos y pasa a verde", () => {
  render(<Semaforo />);
  avanzar(2999);
  expect(luz()).toBe("rojo");
  avanzar(1);
  expect(luz()).toBe("verde");
});

test("el verde dura 2 segundos y pasa a amarillo", () => {
  render(<Semaforo />);
  avanzar(3000);
  avanzar(1999);
  expect(luz()).toBe("verde");
  avanzar(1);
  expect(luz()).toBe("amarillo");
});

test("el amarillo dura 1 segundo y vuelve a rojo", () => {
  render(<Semaforo />);
  avanzar(3000);
  avanzar(2000);
  expect(luz()).toBe("amarillo");
  avanzar(999);
  expect(luz()).toBe("amarillo");
  avanzar(1);
  expect(luz()).toBe("rojo");
});

test("repite el ciclo sin detenerse", () => {
  render(<Semaforo />);
  // Primera vuelta completa: 3 s + 2 s + 1 s.
  avanzar(3000);
  avanzar(2000);
  avanzar(1000);
  // Segunda vuelta.
  avanzar(3000);
  expect(luz()).toBe("verde");
  avanzar(2000);
  avanzar(1000);
  expect(luz()).toBe("rojo");
});

test("al desmontarse no deja temporizadores pendientes", () => {
  const { unmount } = render(<Semaforo />);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
