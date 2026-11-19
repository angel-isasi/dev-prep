import { describe, expect, it } from "vitest";
import { costoUsd, MODELOS, PRECIOS } from "./ia-precios.js";

describe("costoUsd", () => {
  it("cobra entrada y salida al precio del modelo", () => {
    // 1.500 de entrada a 2 USD y 800 de salida a 10 USD por millón
    expect(costoUsd({ modelo: "claude-sonnet-5-5", entrada: 1500, salida: 800 })).toBeCloseTo(0.011, 5);
    expect(costoUsd({ modelo: "claude-haiku-5-5", entrada: 1000, salida: 1000 })).toBeCloseTo(0.0006, 6);
  });

  it("un modelo desconocido se cuenta como el más caro, y sin datos es cero", () => {
    expect(costoUsd({ modelo: "otro", entrada: 1000, salida: 1000 })).toBeCloseTo(0.024, 5);
    expect(costoUsd()).toBe(0);
  });

  it("todas las tareas usan un modelo con precio conocido", () => {
    for (const modelo of Object.values(MODELOS)) expect(PRECIOS[modelo]).toBeTruthy();
  });
});
