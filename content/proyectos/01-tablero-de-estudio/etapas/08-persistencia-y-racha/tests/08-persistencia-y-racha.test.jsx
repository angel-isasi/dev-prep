// @vitest-environment jsdom
import { beforeEach, expect, test } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { resetDatabase } from "../src/api.js";
import { useLocalStorage } from "../src/hooks/useLocalStorage.js";
import { addDays, currentStreak, registerActivity, toDateKey } from "../src/streak.js";

const TAREAS = [
  { id: 1, title: "Repasar closures", topic: "JavaScript", done: false },
  { id: 2, title: "Leer sobre useState", topic: "React", done: true },
];

beforeEach(() => {
  resetDatabase(TAREAS);
  localStorage.clear();
});

test("useLocalStorage usa el valor inicial si no hay nada guardado", () => {
  const { result } = renderHook(() => useLocalStorage("prueba", { tema: "oscuro" }));
  expect(result.current[0]).toEqual({ tema: "oscuro" });
});

test("useLocalStorage guarda el valor como JSON al cambiarlo", () => {
  const { result } = renderHook(() => useLocalStorage("prueba", 0));
  act(() => result.current[1](5));
  expect(result.current[0]).toBe(5);
  expect(localStorage.getItem("prueba")).toBe("5");
});

test("useLocalStorage lee lo que ya estaba guardado", () => {
  localStorage.setItem("prueba", JSON.stringify(["a", "b"]));
  const { result } = renderHook(() => useLocalStorage("prueba", []));
  expect(result.current[0]).toEqual(["a", "b"]);
});

test("useLocalStorage usa el valor inicial si lo guardado no es JSON válido", () => {
  localStorage.setItem("prueba", "{esto no es json");
  const { result } = renderHook(() => useLocalStorage("prueba", "por defecto"));
  expect(result.current[0]).toBe("por defecto");
});

test("toDateKey arma la fecha local y addDays suma o resta días", () => {
  expect(toDateKey(new Date(2026, 2, 5, 23, 30))).toBe("2026-03-05");
  expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
});

test("registerActivity empieza en 1, no cambia el mismo día, suma al día siguiente y se reinicia si saltas un día", () => {
  expect(registerActivity(null, "2026-05-10")).toEqual({ count: 1, lastDate: "2026-05-10" });
  const racha = { count: 3, lastDate: "2026-05-10" };
  expect(registerActivity(racha, "2026-05-10")).toEqual(racha);
  expect(registerActivity(racha, "2026-05-11")).toEqual({ count: 4, lastDate: "2026-05-11" });
  expect(registerActivity(racha, "2026-05-13")).toEqual({ count: 1, lastDate: "2026-05-13" });
});

test("currentStreak cuenta si la última actividad fue hoy o ayer, si no vale 0", () => {
  const racha = { count: 6, lastDate: "2026-05-10" };
  expect(currentStreak(racha, "2026-05-10")).toBe(6);
  expect(currentStreak(racha, "2026-05-11")).toBe(6);
  expect(currentStreak(racha, "2026-05-12")).toBe(0);
  expect(currentStreak(null, "2026-05-12")).toBe(0);
});

test("el filtro elegido se recuerda al volver a abrir la app", async () => {
  const user = userEvent.setup();
  const primera = render(<App />);
  await screen.findByText("Repasar closures");
  await user.click(screen.getByRole("button", { name: "Hechas" }));
  expect(JSON.parse(localStorage.getItem("tablero:filtro"))).toBe("done");
  primera.unmount();

  render(<App />);
  expect(await screen.findByText("Leer sobre useState")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Hechas" }).getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByText("Repasar closures")).toBeNull();
});

test("completar una tarea empieza la racha en 1 día y la guarda", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(await screen.findByText("Racha: 0 días")).toBeTruthy();

  await user.click(await screen.findByRole("checkbox", { name: "Repasar closures" }));
  expect(await screen.findByText("Racha: 1 día")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("tablero:racha"))).toEqual({ count: 1, lastDate: toDateKey() });
});

test("una racha que viene de ayer se muestra y sube al completar una tarea hoy", async () => {
  localStorage.setItem("tablero:racha", JSON.stringify({ count: 4, lastDate: addDays(toDateKey(), -1) }));
  const user = userEvent.setup();
  render(<App />);
  expect(await screen.findByText("Racha: 4 días")).toBeTruthy();

  await user.click(await screen.findByRole("checkbox", { name: "Repasar closures" }));
  expect(await screen.findByText("Racha: 5 días")).toBeTruthy();
});

test("desmarcar una tarea no cambia la racha", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(await screen.findByRole("checkbox", { name: "Leer sobre useState" }));
  await screen.findByText("0 de 2 hechas");
  expect(screen.getByText("Racha: 0 días")).toBeTruthy();
  expect(JSON.parse(localStorage.getItem("tablero:racha"))).toBeNull();
});
