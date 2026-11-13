import { test, expect } from "vitest";
import { parsearQuery, crearQuery } from "./solucion.js";

test("parsearQuery lee los pares y decodifica los valores", () => {
  expect(parsearQuery("?q=cortos%20ica&pagina=2")).toEqual({ q: "cortos ica", pagina: "2" });
});

test("parsearQuery acepta el texto sin '?' y entiende '+' y caracteres codificados", () => {
  expect(parsearQuery("q=cortos+ica&ciudad=Ca%C3%B1ete")).toEqual({ q: "cortos ica", ciudad: "Cañete" });
});

test("parsearQuery con texto vacío devuelve {}", () => {
  expect(parsearQuery("")).toEqual({});
  expect(parsearQuery("?")).toEqual({});
});

test("crearQuery arma el texto y omite los valores vacíos", () => {
  expect(crearQuery({ q: "cortos ica", pagina: 2, vacio: "" })).toBe("q=cortos+ica&pagina=2");
  expect(crearQuery({ a: undefined, b: 1 })).toBe("b=1");
  expect(crearQuery({})).toBe("");
});

test("crearQuery codifica los caracteres especiales", () => {
  expect(crearQuery({ q: "a&b", ciudad: "Cañete" })).toBe("q=a%26b&ciudad=Ca%C3%B1ete");
});

test("ida y vuelta: parsear lo que se creó devuelve los mismos textos", () => {
  const filtros = { q: "cine & teatro", orden: "fecha", pagina: "3" };
  expect(parsearQuery(crearQuery(filtros))).toEqual(filtros);
});
