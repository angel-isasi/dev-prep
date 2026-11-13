// @vitest-environment jsdom
import { test, expect } from "vitest";
import { requerido, minimo, esCorreo, validar } from "./solucion.jsx";

const REGLAS = {
  nombre: [requerido, minimo(3)],
  correo: [requerido, esCorreo],
};

test("requerido: null si hay texto, mensaje si está vacío o solo tiene espacios", () => {
  expect(requerido("Ana")).toBeNull();
  expect(requerido("")).toBe("Este campo es obligatorio");
  expect(requerido("   ")).toBe("Este campo es obligatorio");
});

test("minimo(n) devuelve un validador que recuerda su n", () => {
  const minimo3 = minimo(3);
  const minimo5 = minimo(5);
  expect(typeof minimo3).toBe("function");
  expect(minimo3("Ana")).toBeNull();
  expect(minimo3(" Al ")).toBe("Escribe al menos 3 caracteres");
  expect(minimo5("Ana")).toBe("Escribe al menos 5 caracteres");
});

test("esCorreo acepta algo@algo.algo y rechaza lo demás", () => {
  expect(esCorreo("a@b.pe")).toBeNull();
  expect(esCorreo("angel@unica.edu.pe")).toBeNull();
  expect(esCorreo("angel@unica")).toBe("Ingresa un correo válido");
  expect(esCorreo("angel unica.pe")).toBe("Ingresa un correo válido");
});

test("validar junta el error de cada campo", () => {
  expect(validar({ nombre: "Al", correo: "" }, REGLAS)).toEqual({
    nombre: "Escribe al menos 3 caracteres",
    correo: "Este campo es obligatorio",
  });
});

test("validar se queda con el PRIMER error de cada campo y trata lo que falta como vacío", () => {
  expect(validar({ correo: "mal" }, REGLAS)).toEqual({
    nombre: "Este campo es obligatorio",
    correo: "Ingresa un correo válido",
  });
});

test("si todo está bien devuelve un objeto vacío", () => {
  expect(validar({ nombre: "Angel", correo: "a@b.pe" }, REGLAS)).toEqual({});
});
