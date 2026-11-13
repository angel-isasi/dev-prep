// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Segundero } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('empieza en "0 s"', () => {
  render(<Segundero />);
  expect(screen.getByText("0 s")).toBeTruthy();
});

test("después de 1 segundo muestra 1 s", () => {
  render(<Segundero />);
  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(screen.getByText("1 s")).toBeTruthy();
});

test("sigue contando: después de 3 segundos muestra 3 s", () => {
  render(<Segundero />);
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(screen.getByText("3 s")).toBeTruthy();
});

test("al desmontar no deja temporizadores vivos", () => {
  const { unmount } = render(<Segundero />);
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
