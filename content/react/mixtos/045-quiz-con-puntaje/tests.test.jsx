// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Quiz } from "./solucion.jsx";

const PREGUNTAS = [
  { texto: "¿Qué hook guarda estado?", opciones: ["useState", "useEffect"], correcta: "useState" },
  { texto: "¿Qué método no muta el arreglo?", opciones: ["push", "map"], correcta: "map" },
];

function elegir(opcion) {
  fireEvent.click(screen.getByText(opcion));
}

test("empieza en la pregunta 1 con su texto y sus opciones", () => {
  render(<Quiz preguntas={PREGUNTAS} />);
  expect(screen.getByText("Pregunta 1 de 2")).toBeTruthy();
  expect(screen.getByRole("heading").textContent).toBe("¿Qué hook guarda estado?");
  expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["useState", "useEffect"]);
});

test("al responder pasa a la siguiente pregunta", () => {
  render(<Quiz preguntas={PREGUNTAS} />);
  elegir("useEffect");
  expect(screen.getByText("Pregunta 2 de 2")).toBeTruthy();
  expect(screen.getByRole("heading").textContent).toBe("¿Qué método no muta el arreglo?");
});

test("al final muestra el puntaje con una respuesta mala", () => {
  render(<Quiz preguntas={PREGUNTAS} />);
  elegir("useState");
  elegir("push");
  expect(screen.getByText("Acertaste 1 de 2")).toBeTruthy();
  expect(screen.queryByRole("heading")).toBeNull();
});

test("si todo está bien muestra el puntaje completo", () => {
  render(<Quiz preguntas={PREGUNTAS} />);
  elegir("useState");
  elegir("map");
  expect(screen.getByText("Acertaste 2 de 2")).toBeTruthy();
});

test('"Jugar de nuevo" vuelve a empezar desde cero', () => {
  render(<Quiz preguntas={PREGUNTAS} />);
  elegir("useEffect");
  elegir("push");
  expect(screen.getByText("Acertaste 0 de 2")).toBeTruthy();
  elegir("Jugar de nuevo");
  expect(screen.getByText("Pregunta 1 de 2")).toBeTruthy();
  elegir("useState");
  elegir("map");
  expect(screen.getByText("Acertaste 2 de 2")).toBeTruthy();
});
