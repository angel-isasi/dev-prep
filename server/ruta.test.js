import { describe, expect, test } from "vitest";
import { armarRuta, unidadLista } from "./ruta.js";

// 2026-11-18 es miércoles. El lunes de esa semana es el 16.
const HOY = "2026-11-18";
const unidades = (n, listas = 0) =>
  Array.from({ length: n }, (_, i) => ({ id: `u${i + 1}`, titulo: `Unidad ${i + 1}`, area: "javascript", valor: i < listas ? 0.5 : 0, estado: i < listas ? "amarillo" : "sin-empezar" }));

describe("ruta hasta la fecha meta", () => {
  test("una unidad cuenta como lista en amarillo o en verde", () => {
    expect(["verde", "amarillo", "rojo", "sin-empezar"].map((estado) => unidadLista({ estado }))).toEqual([true, true, false, false]);
  });

  test("arma las semanas de lunes a domingo hasta la de la fecha meta, con los hitos al final", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36) });
    expect(r.diasRestantes).toBe(74);
    expect(r.semanas).toHaveLength(11);
    expect(r.semanas[0]).toMatchObject({ numero: 1, desde: "2026-11-16", hasta: "2026-11-22", actual: true, dias: 5 });
    expect(r.semanas.at(-1)).toMatchObject({ desde: "2027-01-25", hasta: "2027-01-31" });
    expect(r.semanas.at(-1).hito.id).toBe("postular");
    expect(r.semanas.at(-2).hito.id).toBe("proyecto");
    expect(r.semanas.slice(0, 9).every((s) => s.hito === null)).toBe(true);
  });

  test("reparte todas las unidades pendientes, en orden y sin repetir, solo en semanas de estudio", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36) });
    const repartidas = r.semanas.flatMap((s) => s.unidades.map((u) => u.id));
    expect(repartidas).toEqual(unidades(36).map((u) => u.id));
    expect(r.semanas.at(-1).unidades).toEqual([]);
    expect(r.semanas.at(-2).unidades).toEqual([]);
    expect(r.sinLugar).toEqual([]);
  });

  test("esta semana lleva menos porque ya empezó", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36) });
    // 9 semanas de estudio: la primera con 5 días útiles y las demás con 7
    expect(r.semanas[0].unidades.length).toBeLessThan(r.semanas[1].unidades.length);
    expect(r.estaSemana).toEqual(r.semanas[0].unidades);
  });

  test("lo que ya está listo no se vuelve a repartir", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36, 10) });
    expect(r).toMatchObject({ total: 36, listas: 10, pendientes: 26 });
    // 10 unidades a 0,5 y 26 en 0: el dominio general es el promedio del mapa
    expect(r.dominio).toBe(14);
    expect(r.semanas.flatMap((s) => s.unidades).map((u) => u.id)[0]).toBe("u11");
  });

  test("una semana de exámenes no recibe unidades", () => {
    const pausas = [{ desde: "2026-11-23", hasta: "2026-11-29" }];
    const r = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36), pausas });
    expect(r.semanas[1]).toMatchObject({ dias: 0, unidades: [] });
    expect(r.semanas.flatMap((s) => s.unidades)).toHaveLength(36);
  });

  test("los primeros días no hay veredicto", () => {
    expect(armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", inicio: "2026-11-16", unidades: unidades(36) }).estado).toBe("empezando");
  });

  test("al día, atrasado o adelantado según lo que tocaría llevar a ritmo parejo", () => {
    // De 2026-10-19 a 2027-01-17 (fin de las semanas de estudio) hay 91 días; al 18 de noviembre van 30:
    // tocaría llevar 36 × 30 / 91 = 11,8 unidades
    const base = { hoy: HOY, fechaMeta: "2027-01-31", inicio: "2026-10-19" };
    expect(armarRuta({ ...base, unidades: unidades(36, 11) })).toMatchObject({ esperadas: 11, estado: "al-dia" });
    expect(armarRuta({ ...base, unidades: unidades(36, 12) }).estado).toBe("al-dia");
    expect(armarRuta({ ...base, unidades: unidades(36, 10) }).estado).toBe("atrasado");
    expect(armarRuta({ ...base, unidades: unidades(36, 13) }).estado).toBe("adelantado");
  });

  test("con todo listo, la ruta está terminada", () => {
    expect(armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", inicio: "2026-10-19", unidades: unidades(5, 5) }).estado).toBe("terminada");
  });

  test("si la fecha ya pasó, está vencida y lo pendiente queda sin lugar", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2026-11-10", inicio: "2026-10-19", unidades: unidades(4, 1) });
    expect(r).toMatchObject({ estado: "vencida", semanas: [], apretada: true });
    expect(r.sinLugar).toHaveLength(3);
  });

  test("avisa cuando el ritmo que exige es demasiado", () => {
    // 36 unidades en 2 semanas de estudio
    const apretada = armarRuta({ hoy: HOY, fechaMeta: "2026-12-06", unidades: unidades(36) });
    expect(apretada.apretada).toBe(true);
    expect(apretada.porSemana).toBeGreaterThan(5);
    const holgada = armarRuta({ hoy: HOY, fechaMeta: "2027-01-31", unidades: unidades(36) });
    expect(holgada).toMatchObject({ apretada: false, porSemana: 4 });
  });

  test("con muy pocas semanas no se reservan hitos", () => {
    const r = armarRuta({ hoy: HOY, fechaMeta: "2026-11-27", unidades: unidades(4) });
    expect(r.semanas).toHaveLength(2);
    expect(r.semanas.every((s) => s.hito === null)).toBe(true);
  });
});
