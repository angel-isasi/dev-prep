import { describe, expect, it } from "vitest";
import { tropiezosDe } from "./tropiezos.js";

describe("tropiezosDe", () => {
  it("sin datos no dice nada", () => {
    expect(tropiezosDe()).toEqual([]);
  });

  it("junta lecciones, quizzes, entrevista y soluciones vistas", () => {
    const lineas = tropiezosDe({
      items: [
        { clave: "a", unidad: "arrays", pregunta: "¿Qué devuelve map?\n```js\nx\n```" },
        { clave: "b", unidad: "arrays", pregunta: "¿Y filter?" },
        { clave: "c", unidad: "closures", pregunta: "¿Qué es un closure?" },
        { clave: "d", unidad: "closures", pregunta: "Bien respondida" },
      ],
      registrosItems: { a: { ultima: "no" }, b: { ultima: "no" }, c: { ultima: "no" }, d: { ultima: "sabia" } },
      titulo: { arrays: "Arrays", closures: "Closures" },
      preguntas: [{ id: "p1", pregunta: "¿Qué es el event loop?" }],
      registrosPreguntas: { p1: { ultima: "no" } },
      quizzes: { arrays: { ultimo: 2, total: 5 }, closures: { ultimo: 5, total: 5 }, "prueba:closures": { ultimo: 4, total: 12 } },
      vistas: ["Agrupar por propiedad"],
    });
    const texto = lineas.join("\n");
    expect(texto).toContain("3, sobre todo en Arrays (2), Closures (1)");
    expect(texto).toContain("¿Qué devuelve map?");
    expect(texto).not.toContain("Bien respondida");
    expect(texto).toContain("Arrays 2/5");
    expect(texto).toContain("Closures 4/12");
    expect(texto).not.toContain("5/5");
    expect(texto).toContain("event loop");
    expect(texto).toContain("Agrupar por propiedad");
  });
});
