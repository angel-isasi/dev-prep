// @vitest-environment jsdom
import { test, expect, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { leerGuardado, Preferencias } from "./solucion.jsx";

afterEach(() => {
  localStorage.clear();
});

test("leerGuardado devuelve el respaldo si la clave no existe", () => {
  expect(leerGuardado("no-existe", "claro")).toBe("claro");
});

test("leerGuardado convierte el JSON guardado", () => {
  localStorage.setItem("config", JSON.stringify({ tema: "oscuro", tamano: 16 }));
  expect(leerGuardado("config", null)).toEqual({ tema: "oscuro", tamano: 16 });
});

test("leerGuardado no lanza error si lo guardado está corrupto", () => {
  localStorage.setItem("tema", "{roto");
  expect(() => leerGuardado("tema", "claro")).not.toThrow();
  expect(leerGuardado("tema", "claro")).toBe("claro");
});

test("con datos corruptos arranca en claro y guarda el nuevo tema como JSON", () => {
  localStorage.setItem("tema", "{roto");
  render(<Preferencias />);
  fireEvent.click(screen.getByText("Tema: claro"));
  expect(screen.getByText("Tema: oscuro")).toBeTruthy();
  expect(localStorage.getItem("tema")).toBe('"oscuro"');
});

test("arranca con el tema que estaba guardado", () => {
  localStorage.setItem("tema", '"oscuro"');
  render(<Preferencias />);
  expect(screen.getByRole("button").textContent).toBe("Tema: oscuro");
  fireEvent.click(screen.getByRole("button"));
  expect(localStorage.getItem("tema")).toBe('"claro"');
});
