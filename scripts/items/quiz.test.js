import { test, expect } from "vitest";
import { generarQuiz } from "./quiz.js";

const tema = {
  id: "arrays",
  titulo: "Arrays",
  quiz: [
    { pregunta: "¿Qué da `[1].length`?", opciones: ["1", "0", "undefined"], correcta: 0, explicacion: "Tiene un elemento." },
    { pregunta: "Rota", opciones: ["a", "b"], correcta: 5, explicacion: "x" },
    { pregunta: "Repetidas", opciones: ["a", "A", "b"], correcta: 0, explicacion: "x" },
  ],
};

test("copia las preguntas del quiz tal cual, con clave quiz:<tema>:<n>", () => {
  const items = generarQuiz([tema]);
  expect(items).toEqual([
    {
      clave: "quiz:arrays:0",
      tipo: "opcion",
      subtipo: "quiz",
      unidad: "arrays",
      fuente: { tipo: "tema", id: "arrays", titulo: "Arrays" },
      pregunta: "¿Qué da `[1].length`?",
      opciones: ["1", "0", "undefined"],
      correcta: 0,
      explicacion: "Tiene un elemento.",
    },
  ]);
});
