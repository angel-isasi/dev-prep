// @vitest-environment jsdom
import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { crearInicial, pomodoro, Pomodoro } from "./solucion.jsx";

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

function reloj() {
  return screen.getByRole("timer").textContent;
}

test("el reducer resta con cada tic y al terminar cambia de modo", () => {
  const inicial = crearInicial({ trabajo: 3, descanso: 2 });
  expect(inicial).toEqual({
    modo: "trabajo",
    restante: 3,
    corriendo: false,
    duraciones: { trabajo: 3, descanso: 2 },
  });

  const unTic = pomodoro(inicial, { tipo: "tic" });
  expect(unTic.restante).toBe(2);
  expect(inicial.restante).toBe(3);

  const finTrabajo = pomodoro({ ...inicial, restante: 1 }, { tipo: "tic" });
  expect(finTrabajo).toMatchObject({ modo: "descanso", restante: 2 });

  const finDescanso = pomodoro({ ...finTrabajo, restante: 1 }, { tipo: "tic" });
  expect(finDescanso).toMatchObject({ modo: "trabajo", restante: 3 });
});

test("el reducer alterna, reinicia y rechaza acciones desconocidas", () => {
  const inicial = crearInicial({ trabajo: 3, descanso: 2 });
  const corriendo = pomodoro(inicial, { tipo: "alternar" });
  expect(corriendo.corriendo).toBe(true);
  expect(pomodoro(corriendo, { tipo: "alternar" }).corriendo).toBe(false);

  const enDescanso = { ...corriendo, modo: "descanso", restante: 1 };
  expect(pomodoro(enDescanso, { tipo: "reiniciar" })).toEqual(inicial);
  expect(() => pomodoro(inicial, { tipo: "saltar" })).toThrow();
});

test("por defecto muestra 25:00, A trabajar y el botón Iniciar", () => {
  render(<Pomodoro />);
  expect(reloj()).toBe("25:00");
  expect(screen.getByText("A trabajar")).toBeTruthy();
  expect(screen.getByText("Iniciar")).toBeTruthy();
});

test("al iniciar cuenta cada segundo y pasa a Descanso", () => {
  render(<Pomodoro trabajo={3} descanso={2} />);
  expect(reloj()).toBe("00:03");
  fireEvent.click(screen.getByText("Iniciar"));
  avanzar(2000);
  expect(reloj()).toBe("00:01");
  avanzar(1000);
  expect(screen.getByText("Descanso")).toBeTruthy();
  expect(reloj()).toBe("00:02");
});

test("Pausar congela el tiempo", () => {
  render(<Pomodoro trabajo={3} descanso={2} />);
  fireEvent.click(screen.getByText("Iniciar"));
  avanzar(3000);
  fireEvent.click(screen.getByText("Pausar"));
  avanzar(5000);
  expect(reloj()).toBe("00:02");
  expect(screen.getByText("Iniciar")).toBeTruthy();
});

test("Reiniciar vuelve a A trabajar con el tiempo completo y detenido", () => {
  render(<Pomodoro trabajo={3} descanso={2} />);
  fireEvent.click(screen.getByText("Iniciar"));
  avanzar(3000);
  fireEvent.click(screen.getByText("Reiniciar"));
  expect(screen.getByText("A trabajar")).toBeTruthy();
  expect(reloj()).toBe("00:03");
  avanzar(2000);
  expect(reloj()).toBe("00:03");
});
