import { describe, expect, test } from "vitest";
import { armadoCorrecto, comparable, conceptoDeClave, escrituraCorrecta, expandirIngles, fichasDe, generarItemsIngles, hablaCorrecta, nucleos, registrosPorConcepto } from "./ingles.js";

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
  calcos: [{ id: "c1", es: "Tengo 20 años.", natural: "I'm 20 years old.", calco: "I have 20 years.", explicacion: "Edad con to be." }],
  pares: [{ id: "p1", a: "ship", aEs: "barco", b: "sheep", bEs: "oveja", sonido: "i", nota: "corta y larga" }],
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
  const { unidades, items } = expandirIngles(generarItemsIngles([unidad]));
  const porClave = new Map(items.map((it) => [it.clave, it]));

  test("una unidad de área inglés por cada carpeta", () => {
    expect(unidades).toEqual([expect.objectContaining({ id: "en-basico-05", area: "ingles", orden: 1 })]);
  });

  test("una palabra es un solo concepto con varias formas de preguntarla, de reconocer a escribir", () => {
    const p = porClave.get("en:w1");
    expect(p.tipo).toBe("concepto");
    expect(p.variantes.map((v) => v.forma)).toEqual(["palabra", "oir-palabra", "inversa", "escribir-palabra"]);
    const significado = p.variantes[0];
    expect(significado.opciones[significado.correcta]).toBe("trabajar");
    expect(new Set(significado.opciones).size).toBe(significado.opciones.length);
    const inversa = p.variantes.find((v) => v.forma === "inversa");
    expect(inversa.opciones[inversa.correcta]).toBe("work");
    expect(p.variantes.find((v) => v.forma === "escribir-palabra").respuesta).toBe("work");
    expect(porClave.has("enr:w1")).toBe(false);
  });

  test("una frase es un concepto: escuchar, hueco, traducir, dictado, hablar y escribir", () => {
    const f = porClave.get("fr:f1");
    expect(f.variantes.map((v) => v.forma)).toEqual(["escuchar", "hueco", "traducir", "dictado", "hablar", "escribir"]);
    const a = f.variantes.find((v) => v.forma === "traducir");
    expect(a.respuesta).toEqual(["She", "works", "at", "a", "bank"]);
    for (const ficha of a.respuesta) expect(a.fichas).toContain(ficha);
    const hueco = f.variantes.find((v) => v.forma === "hueco");
    expect(hueco.pregunta).toContain("___");
    expect(hueco.opciones[hueco.correcta]).not.toBe("");
    expect(f.variantes.find((v) => v.forma === "dictado").voz).toBe(true);
    expect(f.variantes.find((v) => v.forma === "hablar").micro).toBe(true);
  });

  test("gramática, diálogos, calcos y pares mínimos", () => {
    expect(porClave.get("gra:e1").correcta).toBe(1);
    expect(porClave.get("dia:d1:0").dialogo.lineas).toHaveLength(2);
    const c = porClave.get("cal:c1");
    expect(c.opciones[c.correcta]).toBe("I'm 20 years old.");
    const par = porClave.get("oido:p1");
    expect(par.variantes.map((v) => v.opciones[v.correcta])).toEqual(["ship (barco)", "sheep (oveja)"]);
  });

  test("las claves viejas se juntan en su concepto sin pisar el registro nuevo", () => {
    expect(conceptoDeClave("enr:w1")).toBe("en:w1");
    expect(conceptoDeClave("dic:f1")).toBe("fr:f1");
    const r = registrosPorConcepto({ "esc:f1": { caja: 1, proximo: "2026-11-18" }, "arm:f1": { caja: 2, proximo: "2026-11-20" } });
    expect(r["fr:f1"]).toMatchObject({ caja: 2, proximo: "2026-11-18" });
    const propio = registrosPorConcepto({ "en:w1": { caja: 3, proximo: "x" }, "enr:w1": { caja: 1, proximo: "a" } });
    expect(propio["en:w1"]).toEqual({ caja: 3, proximo: "x" });
  });

  test("escribir perdona mayúsculas, signos, contracciones y un error de tipeo", () => {
    const item = { respuesta: "I'm not ready yet." };
    expect(escrituraCorrecta(item, "i am not ready yet")).toBe("exacta");
    expect(escrituraCorrecta(item, "I'm not redy yet")).toBe("casi");
    expect(escrituraCorrecta(item, "I not ready")).toBe(false);
    expect(escrituraCorrecta({ respuesta: "dog" }, "dig")).toBe(false); // palabras cortas: exacto
    expect(comparable("Don’t")).toBe("do not");
  });

  test("contracciones sin apóstrofo y números en cifras también valen", () => {
    expect(escrituraCorrecta({ respuesta: "I'm not ready yet." }, "Im not ready yet")).toBe("exacta");
    expect(escrituraCorrecta({ respuesta: "I don't like coffee." }, "I dont like coffee")).toBe("exacta");
    expect(comparable("its were well")).toBe("its were well"); // estas son otras palabras: no se tocan
    expect(hablaCorrecta("My sister is fifteen.", ["my sister is 15"])).toBe(true);
    expect(hablaCorrecta("They have two children.", ["they have 2 children"])).toBe(true);
    expect(comparable("I have 125 apples")).toBe("i have 125 apples");
  });

  test("ok = okay, contracciones menos comunes y 's o 'd con su otra lectura", () => {
    expect(escrituraCorrecta({ respuesta: "Okay, let's start." }, "ok lets start")).toBe(false); // lets es otra palabra
    expect(escrituraCorrecta({ respuesta: "Okay, let's start." }, "ok let's start")).toBe("exacta");
    expect(escrituraCorrecta({ respuesta: "She'll be here soon." }, "she will be here soon")).toBe("exacta");
    expect(escrituraCorrecta({ respuesta: "He's just joined the team." }, "He has just joined the team")).toBe("exacta");
    expect(escrituraCorrecta({ respuesta: "You'd better save your work." }, "you had better save your work")).toBe("exacta");
    expect(escrituraCorrecta({ respuesta: "He's from Lima." }, "he is from Lima")).toBe("exacta");
  });

  test("las opciones no tienen dos significados iguales", () => {
    expect(nucleos("gracias (informal)")).toEqual(["gracias"]);
    expect(nucleos("muy / de verdad")).toEqual(["muy", "de verdad"]);
  });

  test("hablar acepta si dijiste al menos el 80% de las palabras en orden", () => {
    expect(hablaCorrecta("She works at a bank.", ["she works at the bank", "otra"])).toBe(true);
    expect(hablaCorrecta("She works at a bank.", ["she walks"])).toBe(false);
  });

  test("las claves son únicas y estables entre exportaciones", () => {
    expect(new Set(items.map((it) => it.clave)).size).toBe(items.length);
    expect(expandirIngles(generarItemsIngles([unidad])).items).toEqual(items);
  });

  test("armar no distingue mayúsculas ni signos, y respeta las contracciones", () => {
    expect(fichasDe("I don't like coffee.")).toEqual(["I", "don't", "like", "coffee"]);
    expect(armadoCorrecto({ respuesta: ["She", "works", "at", "a", "bank"] }, ["she", "works", "at", "a", "bank"])).toBe(true);
    expect(armadoCorrecto({ respuesta: ["She", "works", "at", "a", "bank"] }, ["works", "she", "at", "a", "bank"])).toBe(false);
  });
});
