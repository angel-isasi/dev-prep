import { describe, expect, it } from "vitest";
import { armarTemario, ventanaDeUnidades } from "./temario.js";

const unidad = (id, etapa, orden) => ({ id, etapa, orden, titulo: id, nivel: "A1" });
const item = (clave, unidad) => ({ clave, unidad, concepto: "palabra" });
const base = {
  unidades: [unidad("u1", "basico", 1), unidad("u2", "basico", 2), unidad("u3", "intermedio", 3)],
  items: [item("a", "u1"), item("b", "u1"), item("c", "u2"), item("d", "u3")],
  registros: {},
  extra: {},
  unidadActual: "u2",
};

describe("armarTemario", () => {
  it("agrupa las unidades por etapa, en orden, y marca la actual", () => {
    const { etapas, actual } = armarTemario(base);
    expect(etapas.map((e) => e.id)).toEqual(["basico", "intermedio"]);
    expect(etapas[0].unidades.map((u) => u.id)).toEqual(["u1", "u2"]);
    expect(actual.id).toBe("u2");
    expect(etapas[0].unidades[1].estado).toBe("actual");
    expect(etapas[0].unidades[0].estado).toBe("pendiente");
  });

  it("una unidad con todo aprendido queda hecha y suma en su etapa", () => {
    const registros = { a: { caja: 2 }, b: { caja: 3 }, c: { caja: 1, ultima: "no" } };
    const { etapas } = armarTemario({ ...base, registros });
    expect(etapas[0].hechas).toBe(1);
    expect(etapas[0].unidades[0].estado).toBe("hecha");
    // u2 es la actual aunque ya la empezaste; u3 no se ha tocado
    expect(etapas[0].unidades[1].estado).toBe("actual");
    expect(etapas[1].unidades[0].estado).toBe("pendiente");
  });

  it("el examen de nivel deja hechas (aprobadas) las unidades anteriores a donde llegaste", () => {
    const { etapas } = armarTemario({ ...base, unidadActual: "u3", extra: { examen: { hasta: "u3" } } });
    expect(etapas[0].hechas).toBe(2);
    expect(etapas[0].unidades[0].aprobada).toBe(true);
    expect(etapas[1].unidades[0].hecha).toBe(false);
  });

  it("sin unidad actual conocida, toma la primera; cofres y legendarias salen de lo extra", () => {
    const { actual, etapas } = armarTemario({ ...base, unidadActual: null, extra: { cofres: { u1: true }, legendarias: { u2: true } } });
    expect(actual.id).toBe("u1");
    expect(etapas[0].unidades[0].cofreAbierto).toBe(true);
    expect(etapas[0].unidades[1].legendaria).toBe(true);
  });
});

describe("ventanaDeUnidades", () => {
  it("una etapa corta se ve completa", () => {
    expect(ventanaDeUnidades(6, 3)).toEqual({ desde: 0, hasta: 6 });
  });

  it("una etapa larga muestra 5 alrededor de donde vas, sin salirse", () => {
    expect(ventanaDeUnidades(23, 0)).toEqual({ desde: 0, hasta: 5 });
    expect(ventanaDeUnidades(23, 10)).toEqual({ desde: 9, hasta: 14 });
    expect(ventanaDeUnidades(23, 22)).toEqual({ desde: 18, hasta: 23 });
  });
});
