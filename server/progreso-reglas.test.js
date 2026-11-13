import { describe, test, expect } from "vitest";
import { registroVacio, marcarAbierto, aplicarResultado, sumarAlDia } from "./progreso-reglas.js";

const AHORA = "2026-11-13T15:00:00-05:00";
const DESPUES = "2026-11-13T15:10:00-05:00";

describe("marcarAbierto", () => {
  test("pendiente pasa a en-progreso con fecha de inicio", () => {
    const r = marcarAbierto(registroVacio(), AHORA);
    expect(r.estado).toBe("en-progreso");
    expect(r.iniciadoEn).toBe(AHORA);
  });

  test("no toca un ejercicio resuelto", () => {
    const resuelto = { ...registroVacio(), estado: "resuelto" };
    expect(marcarAbierto(resuelto, AHORA)).toBe(resuelto);
  });
});

describe("aplicarResultado", () => {
  const abierto = marcarAbierto(registroVacio(), AHORA);

  test("un guardado con tests fallando suma un intento y guarda el resultado", () => {
    const { registro, resueltoAhora } = aplicarResultado(abierto, { pasan: 3, total: 5, error: null }, { esIntento: true, ahora: DESPUES });
    expect(registro.intentos).toBe(1);
    expect(registro.estado).toBe("en-progreso");
    expect(registro.ultimoResultado).toEqual({ pasan: 3, total: 5, en: DESPUES });
    expect(resueltoAhora).toBe(false);
  });

  test("una corrida pedida por la app no suma intento", () => {
    const { registro } = aplicarResultado(abierto, { pasan: 0, total: 5, error: null }, { esIntento: false, ahora: DESPUES });
    expect(registro.intentos).toBe(0);
  });

  test("todos pasan: queda resuelto", () => {
    const { registro, resueltoAhora } = aplicarResultado(abierto, { pasan: 5, total: 5, error: null }, { esIntento: true, ahora: DESPUES });
    expect(registro.estado).toBe("resuelto");
    expect(registro.resueltoEn).toBe(DESPUES);
    expect(resueltoAhora).toBe(true);
  });

  test("si ya estaba resuelto, fallar después no lo des-resuelve", () => {
    const resuelto = aplicarResultado(abierto, { pasan: 5, total: 5, error: null }, { esIntento: true, ahora: AHORA }).registro;
    const { registro, resueltoAhora } = aplicarResultado(resuelto, { pasan: 2, total: 5, error: null }, { esIntento: true, ahora: DESPUES });
    expect(registro.estado).toBe("resuelto");
    expect(registro.resueltoEn).toBe(AHORA);
    expect(resueltoAhora).toBe(false);
  });

  test("todos pasan pero viste la solución: queda para repasar", () => {
    const vio = { ...abierto, vioSolucion: true };
    const { registro, resueltoAhora } = aplicarResultado(vio, { pasan: 5, total: 5, error: null }, { esIntento: true, ahora: DESPUES });
    expect(registro.estado).toBe("repasar");
    expect(resueltoAhora).toBe(false);
  });

  test("un error de sintaxis (0 de 0) no cuenta como resuelto", () => {
    const { registro } = aplicarResultado(abierto, { pasan: 0, total: 0, error: "sintaxis" }, { esIntento: true, ahora: DESPUES });
    expect(registro.estado).toBe("en-progreso");
  });

  test("no modifica el registro original", () => {
    const copia = structuredClone(abierto);
    aplicarResultado(abierto, { pasan: 5, total: 5, error: null }, { esIntento: true, ahora: DESPUES });
    expect(abierto).toEqual(copia);
  });
});

describe("sumarAlDia", () => {
  test("crea el día si no existe y suma", () => {
    const dias = sumarAlDia({}, "2026-11-13", "resueltos");
    expect(dias["2026-11-13"].resueltos).toBe(1);
    expect(sumarAlDia(dias, "2026-11-13", "resueltos")["2026-11-13"].resueltos).toBe(2);
  });
});
