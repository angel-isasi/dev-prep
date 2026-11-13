// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Acordeon } from "./solucion.jsx";

const ITEMS = [
  { pregunta: "¿Quién vota?", respuesta: "Cualquiera con Google" },
  { pregunta: "¿Cuántas veces?", respuesta: "Una sola" },
  { pregunta: "¿Hasta cuándo?", respuesta: "Hasta el viernes" },
];

const boton = (pregunta) => screen.getByRole("button", { name: pregunta });

test("al inicio todas las preguntas están cerradas", () => {
  render(<Acordeon items={ITEMS} />);
  expect(screen.getAllByRole("button").length).toBe(3);
  expect(screen.queryByText("Cualquiera con Google")).toBeNull();
  expect(screen.queryByText("Una sola")).toBeNull();
  expect(screen.queryByText("Hasta el viernes")).toBeNull();
});

test("clic en una pregunta muestra su respuesta", () => {
  render(<Acordeon items={ITEMS} />);
  fireEvent.click(boton("¿Quién vota?"));
  expect(screen.getByText("Cualquiera con Google")).toBeTruthy();
});

test("abrir otra pregunta cierra la anterior", () => {
  render(<Acordeon items={ITEMS} />);
  fireEvent.click(boton("¿Quién vota?"));
  fireEvent.click(boton("¿Cuántas veces?"));
  expect(screen.queryByText("Cualquiera con Google")).toBeNull();
  expect(screen.getByText("Una sola")).toBeTruthy();
});

test("clic en la pregunta abierta la cierra", () => {
  render(<Acordeon items={ITEMS} />);
  fireEvent.click(boton("¿Cuántas veces?"));
  fireEvent.click(boton("¿Cuántas veces?"));
  expect(screen.queryByText("Una sola")).toBeNull();
});

test("aria-expanded indica cuál está abierta", () => {
  render(<Acordeon items={ITEMS} />);
  expect(boton("¿Quién vota?").getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(boton("¿Hasta cuándo?"));
  expect(boton("¿Hasta cuándo?").getAttribute("aria-expanded")).toBe("true");
  expect(boton("¿Quién vota?").getAttribute("aria-expanded")).toBe("false");
});
