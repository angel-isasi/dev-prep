import { describe, expect, test } from "vitest";
import { armarSesion } from "./sesion.js";

const LECCION = { titulo: "Predice el resultado", unidad: "Variables y tipos", a: "/leccion?unidad=variables-y-tipos&parte=p2" };
const EJERCICIO = { id: "js-ej-001", titulo: "Duplicar" };
const ids = (s) => s.pasos.map((p) => p.id);

describe("sesión de hoy", () => {
  test("primero lo que toca repasar y después lo nuevo", () => {
    const s = armarSesion({
      repaso: { preguntas: 9, tarjetas: 4, ejercicios: [{ id: "js-gu-001", titulo: "Ficha de presentación" }, { id: "js-gu-002", titulo: "Otro" }] },
      nuevo: { leccion: LECCION, ejercicio: EJERCICIO },
      ingles: { meta: 15, minutosHoy: 0 },
    });
    expect(ids(s)).toEqual(["leccion", "tarjetas", "repaso", "ingles", "ejercicio"]);
    expect(s.pasos.map((p) => p.tipo)).toEqual(["repaso", "repaso", "repaso", "nuevo", "nuevo"]);
    expect(s.siguiente.id).toBe("leccion");
    expect(s.pasos[2]).toMatchObject({ titulo: "Repasa: Ficha de presentación", detalle: "Y 1 más para repasar", a: "/practicar/js-gu-001" });
  });

  test("la lección se anuncia como repaso si hay preguntas vencidas, y como lección nueva si no", () => {
    const conRepaso = armarSesion({ repaso: { preguntas: 1 }, nuevo: { leccion: LECCION } }).pasos[0];
    expect(conRepaso).toMatchObject({ tipo: "repaso", titulo: "Repasa 1 pregunta que te toca hoy", detalle: "Y avanza en Variables y tipos", a: "/leccion" });
    const sinRepaso = armarSesion({ nuevo: { leccion: LECCION } }).pasos[0];
    expect(sinRepaso).toMatchObject({ tipo: "nuevo", titulo: "Lección: Predice el resultado", detalle: "Variables y tipos", a: LECCION.a });
  });

  test("el siguiente es el primer paso sin hacer, y los minutos cuentan solo lo pendiente", () => {
    const s = armarSesion({
      dia: { lecciones: 1 },
      nuevo: { leccion: LECCION, ejercicio: EJERCICIO },
      ingles: { meta: 15, minutosHoy: 6.4 },
    });
    expect(s.pasos[0].hecho).toBe(true);
    expect(s.siguiente.id).toBe("ingles");
    expect(s.hechos).toBe(1);
    expect(s.minutos).toBe(9 + 20); // faltan 9 de inglés y el ejercicio
    expect(s.completa).toBe(false);
  });

  test("con el motor de la laptop el ejercicio vale 25; sin él se estudia y vale 5", () => {
    const enLaptop = armarSesion({ nuevo: { ejercicio: EJERCICIO }, conMotor: true }).pasos[0];
    expect(enLaptop).toMatchObject({ puntos: 25, detalle: "En VS Code, con tests en vivo" });
    const enCelular = armarSesion({ nuevo: { ejercicio: EJERCICIO }, conMotor: false }).pasos[0];
    expect(enCelular.puntos).toBe(5);
    // En el celular, estudiarlo ya marca el paso; en la laptop hace falta resolverlo
    expect(armarSesion({ dia: { lecturas: 1 }, nuevo: { ejercicio: EJERCICIO } }).pasos[0].hecho).toBe(true);
    expect(armarSesion({ dia: { lecturas: 1 }, nuevo: { ejercicio: EJERCICIO }, conMotor: true }).pasos[0].hecho).toBe(false);
  });

  test("continuar un ejercicio a medias se dice distinto que empezar uno nuevo", () => {
    expect(armarSesion({ nuevo: { ejercicio: EJERCICIO, continuar: true } }).pasos[0].titulo).toBe("Continúa: Duplicar");
    expect(armarSesion({ nuevo: { ejercicio: EJERCICIO } }).pasos[0].titulo).toBe("Ejercicio nuevo: Duplicar");
  });

  test("las tarjetas quedan marcadas cuando ya no vence ninguna", () => {
    expect(armarSesion({ repaso: { tarjetas: 3 } }).pasos[0]).toMatchObject({ id: "tarjetas", hecho: false, titulo: "3 tarjetas de entrevista" });
    expect(armarSesion({ dia: { preguntas: 3 }, repaso: { tarjetas: 0 } }).pasos[0]).toMatchObject({ id: "tarjetas", hecho: true });
    expect(ids(armarSesion({ repaso: { tarjetas: 0 } }))).toEqual([]);
  });

  test("el examen sale el fin de semana y el diario al cumplir la meta", () => {
    expect(ids(armarSesion({ finDeSemana: true }))).toEqual(["examen"]);
    expect(ids(armarSesion({ meta: { cumplioMeta: true } }))).toEqual(["diario"]);
    expect(armarSesion({ meta: { cumplioMeta: true }, diarioHecho: true }).completa).toBe(true);
  });

  test("sin nada que hacer no hay siguiente ni se da por completa", () => {
    const s = armarSesion({});
    expect(s).toMatchObject({ pasos: [], siguiente: null, hechos: 0, minutos: 0, completa: false, pausa: false });
  });

  test("avisa si es semana de exámenes", () => {
    expect(armarSesion({ meta: { pausa: true } }).pausa).toBe(true);
  });
});
