// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CuentaRegresiva } from "./solucion.jsx";

const META = "2026-11-17T12:00:00-05:00";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const esperar = (ms) => act(() => vi.advanceTimersByTime(ms));

test("muestra días, horas, minutos y segundos que faltan", () => {
  vi.setSystemTime(new Date("2026-11-15T10:30:15-05:00"));
  render(<CuentaRegresiva hasta={META} />);
  expect(screen.getByText("2d 1h 29m 45s")).toBeTruthy();
});

test("se actualiza cada segundo", () => {
  vi.setSystemTime(new Date("2026-11-17T11:59:58-05:00"));
  render(<CuentaRegresiva hasta={META} />);
  expect(screen.getByText("0d 0h 0m 2s")).toBeTruthy();
  esperar(1000);
  expect(screen.getByText("0d 0h 0m 1s")).toBeTruthy();
});

test('al llegar a la fecha muestra "¡Ya empezó!"', () => {
  vi.setSystemTime(new Date("2026-11-17T11:59:58-05:00"));
  render(<CuentaRegresiva hasta={META} />);
  esperar(2000);
  expect(screen.getByText("¡Ya empezó!")).toBeTruthy();
});

test('si la fecha ya pasó muestra "¡Ya empezó!" desde el inicio', () => {
  vi.setSystemTime(new Date("2026-12-01T09:00:00-05:00"));
  render(<CuentaRegresiva hasta={META} />);
  expect(screen.getByText("¡Ya empezó!")).toBeTruthy();
});

test("al desmontar no deja temporizadores vivos", () => {
  vi.setSystemTime(new Date("2026-11-15T10:30:15-05:00"));
  const { unmount } = render(<CuentaRegresiva hasta={META} />);
  expect(screen.getByText("2d 1h 29m 45s")).toBeTruthy();
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
