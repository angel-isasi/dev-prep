import { describe, test, expect } from "vitest";
import {
  registroVacio,
  aplicarResultado,
  iniciarRepaso,
  verSolucion,
  estadoVisible,
  repasoPendiente,
  solucionDesbloqueada,
  sumarDias,
} from "./progreso-reglas.js";

const DIA1 = "2026-11-13T15:00:00-05:00";
const OK = { pasan: 3, total: 3, error: null };
const resolver = (r, ahora = DIA1) => aplicarResultado(r, OK, { esIntento: true, ahora });

describe("sumarDias", () => {
  test("cruza meses y años", () => {
    expect(sumarDias("2026-11-29", 3)).toBe("2026-12-02");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("repaso espaciado", () => {
  test("resolver sin pistas programa el repaso en 3 días (caja 2)", () => {
    const { registro } = resolver(registroVacio());
    expect(registro.repaso).toEqual({ caja: 2, proximo: "2026-11-16" });
  });

  test("resolver con 2 pistas lo programa para mañana (caja 1)", () => {
    const { registro } = resolver({ ...registroVacio(), pistasVistas: 2 });
    expect(registro.repaso).toEqual({ caja: 1, proximo: "2026-11-14" });
  });

  test("cuando vence, se muestra como 'repasar'", () => {
    const { registro } = resolver(registroVacio());
    expect(estadoVisible(registro, "2026-11-15")).toBe("resuelto");
    expect(estadoVisible(registro, "2026-11-16")).toBe("repasar");
    expect(repasoPendiente(registro, "2026-11-16")).toBe(true);
  });

  test("completar un repaso sin solución sube de caja", () => {
    const resuelto = resolver(registroVacio()).registro; // caja 2
    const enRepaso = iniciarRepaso(resuelto);
    expect(enRepaso.repasando).toBe(true);
    expect(solucionDesbloqueada(enRepaso)).toBe(false);
    const { registro, repasoCompletado } = resolver(enRepaso, "2026-11-16T10:00:00-05:00");
    expect(repasoCompletado).toBe(true);
    expect(registro.repasando).toBe(false);
    expect(registro.repaso).toEqual({ caja: 3, proximo: "2026-11-23" });
    expect(registro.estado).toBe("resuelto");
  });

  test("ver la solución durante el repaso te devuelve a la caja 1", () => {
    const enRepaso = iniciarRepaso(resolver(registroVacio()).registro);
    const vio = verSolucion(enRepaso, DIA1);
    expect(vio.vioSolucion).toBe(true);
    const { registro, repasoCompletado } = resolver(vio, "2026-11-16T10:00:00-05:00");
    expect(repasoCompletado).toBe(false);
    expect(registro.estado).toBe("repasar");
    expect(registro.repaso).toEqual({ caja: 1, proximo: "2026-11-17" });
  });

  test("si viste la solución antes de resolver, queda para repasar mañana", () => {
    const vio = verSolucion({ ...registroVacio(), estado: "en-progreso" }, DIA1);
    const { registro } = resolver(vio);
    expect(registro.estado).toBe("repasar");
    expect(registro.repaso).toEqual({ caja: 1, proximo: "2026-11-14" });
    expect(repasoPendiente(registro, "2026-11-13")).toBe(false);
    expect(repasoPendiente(registro, "2026-11-14")).toBe(true);
  });

  test("redimirse: repasar y resolver sin mirar lo deja resuelto", () => {
    const vio = resolver(verSolucion({ ...registroVacio(), estado: "en-progreso" }, DIA1)).registro;
    const { registro, repasoCompletado } = resolver(iniciarRepaso(vio), "2026-11-14T10:00:00-05:00");
    expect(repasoCompletado).toBe(true);
    expect(registro.estado).toBe("resuelto");
    expect(registro.vioSolucion).toBe(false);
  });
});
