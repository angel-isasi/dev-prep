// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { aplanar, Hilo } from "./solucion.jsx";

const COMENTARIOS = [
  {
    id: 1,
    texto: "Buenísima",
    respuestas: [{ id: 2, texto: "Gracias", respuestas: [{ id: 3, texto: "Volveré" }] }],
  },
  { id: 4, texto: "Llegó fría" },
];

test("aplana en orden de lectura con el nivel de cada comentario", () => {
  expect(aplanar(COMENTARIOS)).toEqual([
    { id: 1, texto: "Buenísima", nivel: 0 },
    { id: 2, texto: "Gracias", nivel: 1 },
    { id: 3, texto: "Volveré", nivel: 2 },
    { id: 4, texto: "Llegó fría", nivel: 0 },
  ]);
});

test("un comentario con varias respuestas las pone todas antes del siguiente", () => {
  const arbol = [
    { id: "a", texto: "A", respuestas: [{ id: "a1", texto: "A1" }, { id: "a2", texto: "A2" }] },
    { id: "b", texto: "B", respuestas: [] },
  ];
  expect(aplanar(arbol).map((c) => `${c.texto}:${c.nivel}`)).toEqual(["A:0", "A1:1", "A2:1", "B:0"]);
});

test("sin comentarios devuelve una lista vacía", () => {
  expect(aplanar([])).toEqual([]);
});

test("Hilo pinta todos los comentarios con 24px de sangría por nivel", () => {
  render(<Hilo comentarios={COMENTARIOS} />);
  expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
    "Buenísima",
    "Gracias",
    "Volveré",
    "Llegó fría",
  ]);
  expect(screen.getByText("Gracias").style.marginLeft).toBe("24px");
  expect(screen.getByText("Volveré").style.marginLeft).toBe("48px");
});
