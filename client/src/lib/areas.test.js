import { describe, test, expect } from "vitest";
import { buscarColeccion, ejercicioAlAzar, siguienteEjercicio } from "./areas.js";

describe("buscarColeccion", () => {
  test("encuentra el área y la colección", () => {
    const r = buscarColeccion("react/retos");
    expect(r.area.id).toBe("react");
    expect(r.coleccion.nombre).toBe("Retos de entrevista");
  });

  test("devuelve null si no existe", () => {
    expect(buscarColeccion("nada/nada")).toBeNull();
  });
});

describe("siguienteEjercicio", () => {
  test("prefiere el que está en progreso", () => {
    const lista = [
      { id: "a", estado: "resuelto" },
      { id: "b", estado: "pendiente" },
      { id: "c", estado: "en-progreso" },
    ];
    expect(siguienteEjercicio(lista).id).toBe("c");
  });

  test("si no hay en progreso, el primer pendiente", () => {
    const lista = [
      { id: "a", estado: "resuelto" },
      { id: "b", estado: "pendiente" },
      { id: "c", estado: "pendiente" },
    ];
    expect(siguienteEjercicio(lista).id).toBe("b");
  });

  test("null si todo está resuelto", () => {
    expect(siguienteEjercicio([{ id: "a", estado: "resuelto" }])).toBeNull();
  });
});

describe("ejercicioAlAzar", () => {
  test("elige solo entre los no resueltos", () => {
    const lista = [
      { id: "a", estado: "resuelto" },
      { id: "b", estado: "pendiente" },
    ];
    for (let i = 0; i < 20; i++) expect(ejercicioAlAzar(lista).id).toBe("b");
  });

  test("si todo está resuelto, elige cualquiera", () => {
    expect(ejercicioAlAzar([{ id: "a", estado: "resuelto" }]).id).toBe("a");
  });

  test("null con la lista vacía", () => {
    expect(ejercicioAlAzar([])).toBeNull();
  });
});
