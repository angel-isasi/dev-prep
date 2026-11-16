import { describe, expect, test } from "vitest";
import { armadoCorrecto, fichasDe, generarItemsIngles } from "./ingles.js";

const unidad = {
  id: "en-basico-05",
  titulo: "Presente simple",
  etapa: "basico",
  nivel: "A1",
  teoria: "## En una frase\n...",
  palabras: [
    { id: "w1", en: "work", es: "trabajar", pron: "uérk", tipo: "verbo", ejemplo: { en: "I work from home.", es: "Trabajo desde casa." } },
    { id: "w2", en: "live", es: "vivir", pron: "liv", tipo: "verbo" },
    { id: "w3", en: "study", es: "estudiar", pron: "stádi", tipo: "verbo" },
    { id: "w4", en: "want", es: "querer", pron: "uánt", tipo: "verbo" },
    { id: "w5", en: "need", es: "necesitar", pron: "níid", tipo: "verbo" },
  ],
  frases: [
    { id: "f1", en: "She works at a bank.", es: "Ella trabaja en un banco." },
    { id: "f2", en: "I don't like coffee.", es: "No me gusta el café." },
    { id: "f3", en: "We study English every day.", es: "Estudiamos inglés todos los días." },
    { id: "f4", en: "They live in Lima.", es: "Ellos viven en Lima." },
  ],
  ejercicios: [{ id: "e1", pregunta: "She ___ at a bank.", opciones: ["work", "works", "working"], correcta: 1, explicacion: "Con she, -s." }],
  dialogos: [
    {
      id: "d1",
      titulo: "En la oficina",
      lineas: [
        { quien: "Tom", en: "Do you work here?", es: "¿Trabajas aquí?" },
        { quien: "Ana", en: "Yes, I do.", es: "Sí." },
      ],
      preguntas: [{ pregunta: "¿Ana trabaja ahí?", opciones: ["Sí", "No", "No se sabe"], correcta: 0, explicacion: "Dice yes." }],
    },
  ],
};

describe("ítems de inglés", () => {
  const { unidades, items } = generarItemsIngles([unidad]);
  const porClave = new Map(items.map((it) => [it.clave, it]));

  test("una unidad de área inglés por cada carpeta", () => {
    expect(unidades).toEqual([expect.objectContaining({ id: "en-basico-05", area: "ingles", orden: 1 })]);
  });

  test("palabras: significado con audio y la versión inversa, con una sola respuesta correcta", () => {
    const p = porClave.get("en:w1");
    expect(p.opciones[p.correcta]).toBe("trabajar");
    expect(p.audio).toBe("work");
    expect(new Set(p.opciones).size).toBe(p.opciones.length);
    const r = porClave.get("enr:w1");
    expect(r.opciones[r.correcta]).toBe("work");
  });

  test("frases: escuchar, traducir y dictado; las fichas traen la respuesta y distractores", () => {
    expect(porClave.get("esc:f1").soloAudio).toBe(true);
    const a = porClave.get("arm:f1");
    expect(a.respuesta).toEqual(["She", "works", "at", "a", "bank"]);
    for (const ficha of a.respuesta) expect(a.fichas).toContain(ficha);
    expect(a.fichas.length).toBeGreaterThan(a.respuesta.length);
    expect(porClave.get("dic:f1").audio).toBe("She works at a bank.");
  });

  test("gramática, emparejar y diálogos", () => {
    expect(porClave.get("gra:e1").correcta).toBe(1);
    expect(porClave.get("par:en:en-basico-05:0").pares).toHaveLength(4);
    expect(porClave.get("dia:d1:0").dialogo.lineas).toHaveLength(2);
  });

  test("las claves son únicas y estables entre exportaciones", () => {
    expect(new Set(items.map((it) => it.clave)).size).toBe(items.length);
    expect(generarItemsIngles([unidad]).items).toEqual(items);
  });

  test("armar no distingue mayúsculas ni signos, y respeta las contracciones", () => {
    expect(fichasDe("I don't like coffee.")).toEqual(["I", "don't", "like", "coffee"]);
    expect(armadoCorrecto({ respuesta: ["She", "works", "at", "a", "bank"] }, ["she", "works", "at", "a", "bank"])).toBe(true);
    expect(armadoCorrecto({ respuesta: ["She", "works", "at", "a", "bank"] }, ["works", "she", "at", "a", "bank"])).toBe(false);
  });
});
