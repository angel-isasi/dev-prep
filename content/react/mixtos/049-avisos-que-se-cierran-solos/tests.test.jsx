// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook, screen, fireEvent, act } from "@testing-library/react";
import { useAvisos, Avisos } from "./solucion.jsx";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function avanzar(ms) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function agregarPizza() {
  fireEvent.click(screen.getByText("Agregar pizza"));
}

test("el hook agrega avisos con ids y los cierra al pasar la duración", () => {
  const { result } = renderHook(() => useAvisos(1000));
  act(() => result.current.avisar("Hola"));
  act(() => result.current.avisar("Chau"));
  expect(result.current.avisos).toEqual([
    { id: 1, texto: "Hola" },
    { id: 2, texto: "Chau" },
  ]);
  avanzar(1000);
  expect(result.current.avisos).toEqual([]);
});

test('"Agregar pizza" muestra un aviso con su botón para cerrar', () => {
  render(<Avisos />);
  agregarPizza();
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByText("Pizza agregada")).toBeTruthy();
  expect(screen.getByLabelText("Cerrar aviso 1")).toBeTruthy();
});

test("el aviso se cierra solo a los 3 segundos", () => {
  render(<Avisos />);
  agregarPizza();
  avanzar(2999);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  avanzar(1);
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("cada aviso tiene su propio temporizador", () => {
  render(<Avisos />);
  agregarPizza();
  avanzar(2000);
  agregarPizza();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  avanzar(1000);
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
  expect(screen.getByLabelText("Cerrar aviso 2")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Cerrar aviso 2"));
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("cerrar a mano quita solo ese aviso y cancela su temporizador", () => {
  render(<Avisos />);
  agregarPizza();
  agregarPizza();
  expect(vi.getTimerCount()).toBe(2);
  fireEvent.click(screen.getByLabelText("Cerrar aviso 1"));
  expect(screen.queryByLabelText("Cerrar aviso 1")).toBeNull();
  expect(screen.getByLabelText("Cerrar aviso 2")).toBeTruthy();
  expect(vi.getTimerCount()).toBe(1);
});

test("al desmontar no quedan temporizadores pendientes", () => {
  const { unmount } = render(<Avisos />);
  agregarPizza();
  agregarPizza();
  expect(vi.getTimerCount()).toBe(2);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
