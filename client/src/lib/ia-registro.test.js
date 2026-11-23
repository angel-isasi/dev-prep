// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { anotarPedido, registroIa } from "./ia.js";

describe("registro de pedidos a la IA", () => {
  beforeEach(() => localStorage.clear());

  it("anota para qué fue, el modelo corto y el costo, el más nuevo primero", () => {
    anotarPedido("aksu", { modelo: "claude-haiku-5-5", entrada: 1000, salida: 100 }, new Date("2026-11-22T10:00:00Z"));
    anotarPedido("aksu-opus", { modelo: "claude-opus-5-5", entrada: 5000, salida: 500 }, new Date("2026-11-22T11:00:00Z"));
    const r = registroIa();
    expect(r.map((f) => [f.tarea, f.modelo])).toEqual([["aksu-opus", "opus"], ["aksu", "haiku"]]);
    expect(r[0].usd).toBeGreaterThan(r[1].usd);
  });

  it("guarda solo los últimos 60", () => {
    for (let i = 0; i < 70; i++) anotarPedido(`t${i}`, { modelo: "claude-haiku-5-5", entrada: 1, salida: 1 });
    expect(registroIa()).toHaveLength(60);
    expect(registroIa()[0].tarea).toBe("t69");
  });
});
