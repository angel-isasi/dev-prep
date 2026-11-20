import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { armarCatalogo, armarPlan, DIAS_PLAN, duracion, esEsencial, planEnTexto, repartir, sumarDias, diasDesde, TEMAS, textoEstado, totalEsenciales } from "./plan-junior.js";

// ---------- La selección apunta a contenido que existe ----------
const CONTENIDO = path.join(import.meta.dirname, "..", "content");
function ejerciciosReales() {
  const lista = [];
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const meta = path.join(dir, e.name, "meta.json");
      if (existsSync(meta)) lista.push(JSON.parse(readFileSync(meta, "utf8")));
      else recorrer(path.join(dir, e.name));
    }
  };
  recorrer(CONTENIDO);
  return lista;
}

describe("la selección de lo esencial", () => {
  const reales = ejerciciosReales();
  const porId = new Map(reales.map((e) => [e.id, e]));

  it("todos los ejercicios elegidos existen y ninguno se repite", () => {
    const ids = TEMAS.flatMap((t) => t.ejercicios);
    expect(ids.filter((id) => !porId.has(id))).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(totalEsenciales()).toBe(ids.length);
  });

  it("es nivel junior: casi nada difícil y solo JavaScript y React", () => {
    const elegidos = TEMAS.flatMap((t) => t.ejercicios).map((id) => porId.get(id));
    expect(elegidos.filter((e) => e.nivel >= 3).length).toBeLessThanOrEqual(3);
    expect(elegidos.every((e) => /^(js|react|mix)-/.test(e.id))).toBe(true);
    // Es una parte de la app, no toda
    expect(elegidos.length).toBeGreaterThan(100);
    expect(elegidos.length).toBeLessThan(reales.length / 2);
  });

  it("las preguntas de entrevista elegidas existen", () => {
    const carpeta = path.join(CONTENIDO, "entrevistas", "preguntas");
    const texto = readdirSync(carpeta).map((f) => readFileSync(path.join(carpeta, f), "utf8")).join("\n");
    for (const id of TEMAS.flatMap((t) => t.preguntas)) expect(texto.includes(`"${id}"`), id).toBe(true);
  });

  it("esEsencial distingue lo del plan de lo demás", () => {
    expect(esEsencial("js-gu-001")).toBe(true);
    expect(esEsencial("js-ej-050")).toBe(false);
    expect(esEsencial("alg-reto-001")).toBe(false);
  });
});

// ---------- El cálculo ----------
const ejercicios = TEMAS.flatMap((t) => t.ejercicios).map((id, i) => ({ id, titulo: `Ejercicio ${id}`, nivel: (i % 2) + 1 }));
const lecciones = Object.fromEntries(TEMAS.filter((t) => t.unidad).map((t) => [t.unidad, 3]));
const preguntas = Object.fromEntries(TEMAS.flatMap((t) => t.preguntas).map((id) => [id, `Pregunta ${id}`]));
const tareas = armarCatalogo({ ejercicios, lecciones, preguntas });
const INICIO = "2026-11-22";
const hechasHasta = (n) => Object.fromEntries(tareas.slice(0, n).map((t) => [t.clave, 1]));

describe("fechas", () => {
  it("suma y resta días sin depender de la zona horaria", () => {
    expect(sumarDias("2026-11-22", 14)).toBe("2026-12-06");
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(diasDesde("2026-11-22", "2026-12-06")).toBe(14);
  });
});

describe("repartir", () => {
  it("deja cargas parejas y respeta el orden", () => {
    const dias = repartir([10, 10, 10, 10, 10, 10], 3);
    expect(dias).toEqual([0, 0, 1, 1, 2, 2]);
    expect(repartir([5, 5], 1)).toEqual([0, 0]);
    expect(repartir([], 4)).toEqual([]);
  });
});

describe("armarCatalogo", () => {
  it("cada tema trae teoría, lecciones, ejercicios y preguntas, y cada etapa cierra con su control", () => {
    const delPrimero = tareas.filter((t) => t.tema === "variables-y-tipos").map((t) => t.tipo);
    expect(delPrimero.slice(0, 2)).toEqual(["teoria", "lecciones"]);
    expect(delPrimero.filter((t) => t === "ejercicio")).toHaveLength(7);
    expect(delPrimero.filter((t) => t === "pregunta")).toHaveLength(5);
    expect(tareas.filter((t) => t.tipo === "control").map((t) => t.clave)).toEqual(["control:javascript", "control:react"]);
    expect(tareas.at(-1).clave).toBe("simulacro");
    expect(new Set(tareas.map((t) => t.clave)).size).toBe(tareas.length);
  });

  it("ignora un ejercicio que ya no existe", () => {
    expect(armarCatalogo({ ejercicios: [], lecciones, preguntas }).some((t) => t.tipo === "ejercicio")).toBe(false);
  });
});

describe("armarPlan", () => {
  it("el primer día: al día, con tareas de JavaScript para hoy", () => {
    const plan = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    expect(plan.dia).toBe(1);
    expect(plan.dias).toBe(DIAS_PLAN);
    expect(plan.estado.tipo).toBe("al-dia");
    expect(plan.hoy.total).toBeGreaterThan(5);
    expect(plan.hoy.tareas.every((t) => t.etapa === "javascript")).toBe(true);
    expect(plan.siguiente.clave).toBe(tareas[0].clave);
    expect(plan.calendario).toHaveLength(15);
    expect(plan.calendario[0].tipo).toBe("hoy");
  });

  it("JavaScript ocupa unos 5 días, React 8, y los dos últimos son repaso y simulacro", () => {
    const plan = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    const etapas = plan.calendario.map((d) => d.etapa);
    expect(etapas.filter((e) => e === "javascript").length).toBe(5);
    expect(etapas.filter((e) => e === "react").length).toBe(8);
    expect(etapas.slice(-2)).toEqual(["repaso", "simulacro"]);
  });

  it("si no avanzas, quedas atrasado y lo pendiente se reparte en los días que quedan", () => {
    const dia1 = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    const dia4 = armarPlan({ tareas, inicio: INICIO, hoy: sumarDias(INICIO, 3) });
    expect(dia4.estado).toEqual({ tipo: "atrasado", dias: 3 });
    expect(dia4.hoy.total).toBeGreaterThan(dia1.hoy.total);
    expect(dia4.ritmo).toBeGreaterThan(dia1.ritmo);
    expect(dia4.calendario[0].cubierto).toBe(false);
  });

  it("si haces de más, quedas adelantado", () => {
    const mitad = Math.round(tareas.length / 2);
    const plan = armarPlan({ tareas, progreso: hechasHasta(mitad), inicio: INICIO, hoy: sumarDias(INICIO, 1) });
    expect(plan.estado.tipo).toBe("adelantado");
    expect(plan.estado.dias).toBeGreaterThanOrEqual(1);
  });

  it("la lista de hoy no cambia mientras avanzas: lo hecho se marca", () => {
    const alEmpezar = {};
    const antes = armarPlan({ tareas, progreso: {}, alEmpezar, inicio: INICIO, hoy: INICIO });
    const tres = Object.fromEntries(antes.hoy.tareas.slice(0, 3).map((t) => [t.clave, 1]));
    const despues = armarPlan({ tareas, progreso: tres, alEmpezar, inicio: INICIO, hoy: INICIO });
    expect(despues.hoy.tareas.map((t) => t.clave)).toEqual(antes.hoy.tareas.map((t) => t.clave));
    expect(despues.hoy.hechas).toBe(3);
    expect(despues.siguiente.clave).toBe(antes.hoy.tareas[3].clave);
  });

  it("al terminar lo de hoy propone adelantar", () => {
    const antes = armarPlan({ tareas, alEmpezar: {}, inicio: INICIO, hoy: INICIO });
    const todas = Object.fromEntries(antes.hoy.tareas.map((t) => [t.clave, 1]));
    const plan = armarPlan({ tareas, progreso: todas, alEmpezar: {}, inicio: INICIO, hoy: INICIO });
    expect(plan.siguiente).toBeNull();
    expect(plan.adelanta.clave).toBe(tareas[antes.hoy.total].clave);
  });

  it("una tarea a medias cuenta por su parte", () => {
    const sin = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    const con = armarPlan({ tareas, progreso: { [tareas[1].clave]: 0.5 }, inicio: INICIO, hoy: INICIO });
    expect(con.total.porcentaje).toBeGreaterThan(sin.total.porcentaje);
    expect(con.total.hechas).toBe(0);
  });

  it("el penúltimo día toca repaso y el último el simulacro", () => {
    const estudio = Object.fromEntries(tareas.filter((t) => t.etapa === "javascript" || t.etapa === "react").map((t) => [t.clave, 1]));
    const d14 = armarPlan({ tareas, progreso: estudio, inicio: INICIO, hoy: sumarDias(INICIO, 13) });
    expect(d14.hoy.tareas.map((t) => t.tipo)).toEqual(["repaso", "repaso"]);
    const d15 = armarPlan({ tareas, progreso: { ...estudio, "repaso:lecciones": 1, "repaso:ejercicios": 1 }, inicio: INICIO, hoy: sumarDias(INICIO, 14) });
    expect(d15.hoy.tareas.map((t) => t.tipo)).toEqual(["simulacro"]);
    expect(armarPlan({ tareas, progreso: hechasHasta(tareas.length), inicio: INICIO, hoy: sumarDias(INICIO, 14) }).terminado).toBe(true);
  });

  it("antes de empezar y después de terminar", () => {
    expect(armarPlan({ tareas, inicio: INICIO, hoy: sumarDias(INICIO, -2) }).estado).toEqual({ tipo: "por-empezar", dias: 2 });
    const vencido = armarPlan({ tareas, inicio: INICIO, hoy: sumarDias(INICIO, 20) });
    expect(vencido.estado.tipo).toBe("vencido");
    expect(vencido.hoy.total).toBe(tareas.length);
  });

  it("acepta otra duración", () => {
    const plan = armarPlan({ tareas, inicio: INICIO, hoy: INICIO, dias: 30 });
    expect(plan.calendario).toHaveLength(30);
    expect(plan.hoy.total).toBeLessThan(armarPlan({ tareas, inicio: INICIO, hoy: INICIO }).hoy.total);
    expect(armarPlan({ tareas, inicio: INICIO, hoy: INICIO, dias: 2 }).dias).toBe(7);
  });
});

describe("inglés diario", () => {
  it("suma una tarea de 20 minutos al final de hoy, sin tocar lo técnico ni el estado", () => {
    const sin = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    const con = armarPlan({ tareas, inicio: INICIO, hoy: INICIO, minutosIngles: 5 });
    expect(con.hoy.tareas.at(-1)).toMatchObject({ tipo: "ingles", minutos: 20, avance: 0.25, hecha: false });
    expect(con.hoy.total).toBe(sin.hoy.total + 1);
    expect(con.estado).toEqual(sin.estado);
    expect(con.calendario[3].minutos).toBe(sin.calendario[3].minutos + 20);
    expect(armarPlan({ tareas, inicio: INICIO, hoy: INICIO, minutosIngles: 25 }).hoy.tareas.at(-1).hecha).toBe(true);
  });
});

describe("textos", () => {
  it("estado y duración", () => {
    expect(textoEstado({ tipo: "atrasado", dias: 1.5 })).toBe("Atrasado 1.5 días");
    expect(textoEstado({ tipo: "adelantado", dias: 1 })).toBe("Adelantado 1 día");
    expect(textoEstado({ tipo: "al-dia", dias: 0 })).toBe("Al día");
    expect([40, 60, 150, 178].map(duracion)).toEqual(["40 min", "1 h", "2 h 30", "3 h"]);
  });

  it("el resumen para el mentor trae el día, el estado y las tareas de hoy con su clave", () => {
    const plan = armarPlan({ tareas, inicio: INICIO, hoy: INICIO });
    const texto = planEnTexto(plan, { repasar: ["Deep clone"], errores: 4 });
    expect(texto).toContain("día 1");
    expect(texto).toContain("Al día");
    expect(texto).toContain(`clave=${tareas[0].clave}`);
    expect(texto).toContain("Deep clone");
    expect(texto).not.toContain("—");
  });
});
