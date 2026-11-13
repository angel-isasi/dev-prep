import { test, expect } from "vitest";
import { aCamel, aSlug } from "./solucion.js";

test("aCamel convierte desde guiones bajos y guiones", () => {
  expect(aCamel("fecha_de_publicacion")).toBe("fechaDePublicacion");
  expect(aCamel("nombre-del-corto")).toBe("nombreDelCorto");
});

test("aCamel convierte desde espacios y pasa lo demás a minúsculas", () => {
  expect(aCamel("Nombre Completo")).toBe("nombreCompleto");
  expect(aCamel("NOMBRE_COMPLETO")).toBe("nombreCompleto");
});

test("aCamel trata varios separadores seguidos como uno y descarta el del final", () => {
  expect(aCamel("fecha__de--hoy")).toBe("fechaDeHoy");
  expect(aCamel("hola_")).toBe("hola");
});

test("aSlug quita tildes y signos", () => {
  expect(aSlug("¡Arqueología en Ica: Paracas y Nasca!")).toBe("arqueologia-en-ica-paracas-y-nasca");
  expect(aSlug("¿Qué es JS?")).toBe("que-es-js");
});

test("aSlug convierte la ñ en n y junta los espacios repetidos", () => {
  expect(aSlug("  Año Nuevo   2027 ")).toBe("ano-nuevo-2027");
});

test("aSlug deja igual un texto que ya es slug", () => {
  expect(aSlug("hola-mundo-2027")).toBe("hola-mundo-2027");
});
