// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Cronometro } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

const esperar = (ms) => act(() => vi.advanceTimersByTime(ms));
const clic = (texto) => fireEvent.click(screen.getByText(texto));

test("al inicio muestra 0.0 s y el botón Iniciar", () => {
  render(<Cronometro />);
  expect(screen.getByText("0.0 s")).toBeTruthy();
  expect(screen.getByText("Iniciar")).toBeTruthy();
});

test("al iniciar cuenta el tiempo y el botón cambia a Pausar", () => {
  render(<Cronometro />);
  clic("Iniciar");
  esperar(1500);
  expect(screen.getByText("1.5 s")).toBeTruthy();
  expect(screen.getByText("Pausar")).toBeTruthy();
});

test("al pausar el tiempo se congela", () => {
  render(<Cronometro />);
  clic("Iniciar");
  esperar(1500);
  clic("Pausar");
  esperar(1000);
  expect(screen.getByText("1.5 s")).toBeTruthy();
});

test("al reanudar sigue desde donde quedó", () => {
  render(<Cronometro />);
  clic("Iniciar");
  esperar(1500);
  clic("Pausar");
  esperar(1000);
  clic("Iniciar");
  esperar(500);
  expect(screen.getByText("2.0 s")).toBeTruthy();
});

test("Reiniciar vuelve a 0.0 s y detiene el cronómetro", () => {
  render(<Cronometro />);
  clic("Iniciar");
  esperar(1500);
  clic("Reiniciar");
  expect(screen.getByText("0.0 s")).toBeTruthy();
  esperar(1000);
  expect(screen.getByText("0.0 s")).toBeTruthy();
  expect(screen.getByText("Iniciar")).toBeTruthy();
});

test("al desmontar no deja temporizadores vivos", () => {
  const { unmount } = render(<Cronometro />);
  clic("Iniciar");
  esperar(300);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
