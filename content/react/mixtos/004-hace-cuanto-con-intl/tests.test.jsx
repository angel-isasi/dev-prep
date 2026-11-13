// @vitest-environment jsdom
import { test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { haceCuanto, Publicado } from "./solucion.jsx";

const AHORA = Date.parse("2026-11-12T12:00:00Z");

test("usa días cuando pasó al menos un día", () => {
  expect(haceCuanto("2026-11-09T12:00:00Z", AHORA)).toBe("hace 3 días");
  expect(haceCuanto("2026-11-11T12:00:00Z", AHORA)).toBe("ayer");
});

test("usa horas y minutos para diferencias más cortas", () => {
  expect(haceCuanto("2026-11-12T10:00:00Z", AHORA)).toBe("hace 2 horas");
  expect(haceCuanto("2026-11-12T11:55:00Z", AHORA)).toBe("hace 5 minutos");
});

test('menos de un minuto es "ahora mismo"', () => {
  expect(haceCuanto("2026-11-12T11:59:40Z", AHORA)).toBe("ahora mismo");
});

test("también sirve para fechas futuras", () => {
  expect(haceCuanto("2026-11-15T12:00:00Z", AHORA)).toBe("dentro de 3 días");
});

test("Publicado pinta un <time> con la fecha y el texto relativo", () => {
  render(<Publicado fecha="2026-11-12T10:00:00Z" ahora={AHORA} />);
  const elemento = screen.getByText("hace 2 horas");
  expect(elemento.tagName).toBe("TIME");
  expect(elemento.getAttribute("datetime")).toBe("2026-11-12T10:00:00Z");
});
