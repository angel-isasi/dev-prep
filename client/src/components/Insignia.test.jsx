// @vitest-environment jsdom
import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Insignia } from "./Insignia.jsx";

const variante = (texto) => screen.getByText(texto).getAttribute("data-variante");

describe("Insignia de estado", () => {
  test.each([
    ["resuelto", "Resuelto", "exito"],
    ["en-progreso", "En progreso", "aviso"],
    ["repasar", "Para repasar", "error"],
    ["pendiente", "Pendiente", "neutro"],
  ])('estado "%s" muestra "%s" con variante %s', (estado, texto, esperada) => {
    render(<Insignia estado={estado} />);
    expect(variante(texto)).toBe(esperada);
  });
});

describe("Insignia de nivel", () => {
  test.each([
    [1, "Básico", "exito"],
    [2, "Intermedio", "aviso"],
    [3, "Difícil", "error"],
  ])("nivel %i muestra \"%s\" con variante %s", (nivel, texto, esperada) => {
    render(<Insignia nivel={nivel} />);
    expect(variante(texto)).toBe(esperada);
  });
});

describe("casos raros", () => {
  test("un estado desconocido se muestra tal cual, en neutro", () => {
    render(<Insignia estado="archivado" />);
    expect(variante("archivado")).toBe("neutro");
  });

  test("usa un <span>", () => {
    render(<Insignia estado="resuelto" />);
    expect(screen.getByText("Resuelto").tagName).toBe("SPAN");
  });
});
