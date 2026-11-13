import { describe, test, expect } from "vitest";
import { registroVacio, sumarTiempo, verPista, verSolucion, solucionDesbloqueada } from "./progreso-reglas.js";

const T0 = "2026-11-13T15:00:00-05:00";

describe("sumarTiempo", () => {
  test("la primera actividad no suma tiempo", () => {
    const { registro, segundos } = sumarTiempo(registroVacio(), T0);
    expect(segundos).toBe(0);
    expect(registro.ultimaActividad).toBe(T0);
  });

  test("suma el intervalo entre dos actividades", () => {
    const a = sumarTiempo(registroVacio(), T0).registro;
    const { registro, segundos } = sumarTiempo(a, "2026-11-13T15:02:30-05:00");
    expect(segundos).toBe(150);
    expect(registro.segundosActivos).toBe(150);
  });

  test("un intervalo largo cuenta como máximo 5 minutos", () => {
    const a = sumarTiempo(registroVacio(), T0).registro;
    expect(sumarTiempo(a, "2026-11-13T17:00:00-05:00").segundos).toBe(300);
  });
});

describe("verPista", () => {
  test("se ven en orden y se recuerda la mayor", () => {
    const r1 = verPista(registroVacio(), 1, T0);
    expect(r1.pistasVistas).toBe(1);
    expect(r1.estado).toBe("en-progreso");
    expect(verPista(r1, 2, T0).pistasVistas).toBe(2);
    expect(verPista(verPista(r1, 2, T0), 1, T0).pistasVistas).toBe(2);
  });

  test("no deja saltarse pistas", () => {
    expect(verPista(registroVacio(), 3, T0)).toBeNull();
    expect(verPista(registroVacio(), 0, T0)).toBeNull();
  });
});

describe("verSolucion", () => {
  test("antes de resolver: penaliza y queda para repasar", () => {
    const r = verSolucion({ ...registroVacio(), estado: "en-progreso" }, T0);
    expect(r.vioSolucion).toBe(true);
    expect(r.estado).toBe("repasar");
    expect(solucionDesbloqueada(r)).toBe(true);
  });

  test("después de resolver: no penaliza", () => {
    const r = verSolucion({ ...registroVacio(), estado: "resuelto" }, T0);
    expect(r.vioSolucion).toBe(false);
    expect(r.estado).toBe("resuelto");
  });

  test("bloqueada si no está resuelto ni la viste", () => {
    expect(solucionDesbloqueada(registroVacio())).toBe(false);
  });
});
