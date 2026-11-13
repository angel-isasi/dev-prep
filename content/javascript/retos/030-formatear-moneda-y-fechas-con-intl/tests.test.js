import { test, expect } from "vitest";
import { soles, fechaLarga } from "./solucion.js";

// \s también acepta el espacio "duro" que pone Intl entre S/ y el número.
test("soles usa el símbolo S/, comas para los miles y punto decimal", () => {
  expect(soles(1234.5)).toMatch(/^S\/\s?1,234\.50$/);
});

test("soles muestra siempre 2 decimales", () => {
  expect(soles(5)).toMatch(/^S\/\s?5\.00$/);
  expect(soles(0)).toMatch(/^S\/\s?0\.00$/);
  expect(soles(1000000)).toMatch(/^S\/\s?1,000,000\.00$/);
});

test("fechaLarga escribe la fecha completa en español", () => {
  expect(fechaLarga("2026-11-17T12:00:00-05:00")).toBe("17 de noviembre de 2026");
  expect(fechaLarga("2027-03-01T12:00:00-05:00")).toBe("1 de marzo de 2027");
});

test("fechaLarga usa la hora de Lima, no la de la computadora", () => {
  // 03:00 en Londres (UTC) son las 22:00 del día anterior en Lima.
  expect(fechaLarga("2026-11-18T03:00:00Z")).toBe("17 de noviembre de 2026");
  // 04:59 UTC del 1 de enero todavía es 31 de diciembre en Lima.
  expect(fechaLarga("2027-01-01T04:59:00Z")).toBe("31 de diciembre de 2026");
});
