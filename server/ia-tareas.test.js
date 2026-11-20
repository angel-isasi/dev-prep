import { describe, expect, it } from "vitest";
import { armarPedido, limpiarResultado } from "./ia.js";
import { TAREAS, limpiarPorEsquema } from "./ia-tareas.js";

const codigo = "function sumar(a, b) {\n  return a + b;\n}";

describe("registro de tareas del plan v6", () => {
  it("cada tarea tiene modelo, instrucciones, esquema y armado", () => {
    for (const [nombre, t] of Object.entries(TAREAS)) {
      expect(t.modelo, nombre).toMatch(/^claude-/);
      expect(t.sistema.length, nombre).toBeGreaterThan(50);
      expect(t.esquema.type, nombre).toBe("object");
      expect(typeof t.armar, nombre).toBe("function");
    }
  });

  it("la pista usa el código y los tests que fallan", () => {
    const p = armarPedido({
      tarea: "pista",
      pregunta: "Suma dos números",
      codigo,
      fallos: [{ nombre: "suma negativos", esperado: -3, recibido: 3 }],
      pistasVistas: ["Mira los signos"],
    });
    expect(p.error).toBeUndefined();
    expect(p.mensaje).toContain("suma negativos");
    expect(p.mensaje).toContain("Recibido: 3");
    expect(p.mensaje).toContain("Mira los signos");
  });

  it("sin código no pide pista", () => {
    expect(armarPedido({ tarea: "pista", pregunta: "x", codigo: "" }).error).toBeTruthy();
  });

  it("¿qué imprime? exige la salida real y la predicción", () => {
    expect(armarPedido({ tarea: "imprime-evaluar", codigo: "console.log(1)", salida: "", respuesta: "1" }).error).toBeTruthy();
    const p = armarPedido({ tarea: "imprime-evaluar", codigo: "console.log(1)", salida: "1", respuesta: "imprime 1" });
    expect(p.mensaje).toContain("Salida real");
  });

  it("la memoria del tutor se agrega a cualquier tarea", () => {
    const p = armarPedido({ tarea: "complejidad", pregunta: "x", codigo, respuesta: "O(1)", perfil: "Le cuestan los closures" });
    expect(p.mensaje).toContain("Le cuestan los closures");
    const viejo = armarPedido({ tarea: "ingles", pregunta: "How are you?", respuesta: "I am fine thanks", perfil: "Nivel B1" });
    expect(viejo.mensaje).toContain("Nivel B1");
  });

  it("la revisión de código incluye la solución oficial para comparar", () => {
    const p = armarPedido({ tarea: "codigo", pregunta: "Suma", respuesta: codigo, oficial: "const sumar = (a, b) => a + b;" });
    expect(p.mensaje).toContain("Solución oficial");
    expect(limpiarResultado("codigo", { puntaje: 8, comparacion: ["a"] }).comparacion).toEqual(["a"]);
  });

  it("limpia según el esquema", () => {
    const r = limpiarPorEsquema(TAREAS["review-evaluar"].esquema, { puntaje: 15, encontrados: "x", comentario: 3 });
    expect(r).toEqual({ puntaje: 10, encontrados: [], faltaron: [], comentario: "3" });
    expect(limpiarPorEsquema(TAREAS.complejidad.esquema, { veredicto: "raro" }).veredicto).toBe("casi");
  });

  it("una tarea desconocida o heredada de Object no pasa", () => {
    expect(armarPedido({ tarea: "toString" }).error).toBe("Tarea desconocida");
  });
});

describe("mentor del plan junior", () => {
  it("sin el plan no hay pedido", () => {
    expect(armarPedido({ tarea: "mentor", datos: "" }).error).toBeTruthy();
  });

  it("del día: manda el plan y pide el estado de hoy", () => {
    const p = armarPedido({ tarea: "mentor", datos: "Plan junior de 15 días. Hoy es el día 3. Estado: Al día." });
    expect(p.error).toBeUndefined();
    expect(p.mensaje).toContain("día 3");
    expect(p.mensaje).toContain("Dile cómo va hoy");
  });

  it("al terminar un ejercicio y al preguntar, lo incluye", () => {
    const paso = armarPedido({ tarea: "mentor", datos: "Plan", hecho: "Resolvió Two Sum en 3 intentos" });
    expect(paso.mensaje).toContain("Two Sum");
    expect(paso.mensaje).toContain("qué sigue");
    const pregunta = armarPedido({ tarea: "mentor", datos: "Plan", pregunta: "¿Me salto closures?", historial: [{ de: "yo", texto: "hola" }, { de: "mentor", texto: "Sigue con arrays" }] });
    expect(pregunta.mensaje).toContain("¿Me salto closures?");
    expect(pregunta.mensaje).toContain("Estudiante: hola");
    expect(pregunta.mensaje).toContain("Tú: Sigue con arrays");
  });

  it("usa el modelo de más criterio y devuelve pasos con su tarea", () => {
    expect(TAREAS.mentor.modelo).toBe("claude-sonnet-5-5");
    const limpio = limpiarPorEsquema(TAREAS.mentor.esquema, { titular: "Vas bien", mensaje: "Sigue", pasos: [{ texto: "Haz esto", tarea: "ej:js-gu-001", extra: 1 }], alerta: "" });
    expect(limpio.pasos).toEqual([{ texto: "Haz esto", tarea: "ej:js-gu-001" }]);
  });
});

describe("Jarvis", () => {
  it("necesita un momento o una pregunta", () => {
    expect(armarPedido({ tarea: "jarvis", datos: "Plan" }).error).toBeTruthy();
    expect(armarPedido({ tarea: "jarvis", pregunta: "¿qué sigue?" }).error).toBeUndefined();
  });

  it("manda contexto, código, charla y momento", () => {
    const p = armarPedido({
      tarea: "jarvis-pro",
      datos: "Día 3 del plan",
      momento: "Lleva 3 guardadas fallando el mismo test: suma negativos",
      codigo: "function sumar(a, b) { return a - b; }",
      historial: [{ de: "yo", texto: "no me sale" }, { de: "jarvis", texto: "mira el signo" }],
    });
    expect(p.mensaje).toContain("Día 3 del plan");
    expect(p.mensaje).toContain("return a - b");
    expect(p.mensaje).toContain("Él: no me sale");
    expect(p.mensaje).toContain("Tú: mira el signo");
    expect(p.mensaje).toContain("suma negativos");
  });

  it("el barato conversa y el de más criterio lee código; mismo formato de respuesta", () => {
    expect(TAREAS.jarvis.modelo).toBe("claude-haiku-5-5");
    expect(TAREAS["jarvis-pro"].modelo).toBe("claude-sonnet-5-5");
    const r = limpiarPorEsquema(TAREAS.jarvis.esquema, { mensaje: "Hola", pregunta: "", destino: "plan", nota: "", profundo: false, otro: 1 });
    expect(r).toEqual({ mensaje: "Hola", pregunta: "", destino: "plan", nota: "", profundo: false });
  });

  it("puede pedir la respuesta en inglés", () => {
    expect(armarPedido({ tarea: "jarvis", pregunta: "hola", ingles: true }).mensaje).toContain("en inglés");
  });
});
