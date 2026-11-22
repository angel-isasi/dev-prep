import { describe, expect, it } from "vitest";
import { CV_BASE_INICIAL, encabezadoDe, idOfertaPegada, ofertasParaCvAuto, resumenBusqueda, tocaResumenBusqueda } from "./cv-oferta.js";
import { armarPedido } from "./ia.js";
import { TAREAS } from "./ia-tareas.js";

const oferta = (id, puntaje, extra = {}) => ({ id, titulo: `Puesto ${id}`, empresa: "Acme", fuente: "LinkedIn", puntaje, ...extra });

describe("CV para cada oferta", () => {
  it("el CV base no lleva teléfono ni correo (el repositorio es público)", () => {
    expect(CV_BASE_INICIAL).not.toMatch(/@gmail|\d{3} \d{3} \d{3}/);
    expect(CV_BASE_INICIAL).toContain("Rimay");
  });

  it("una oferta pegada tiene siempre el mismo id", () => {
    expect(idOfertaPegada("Buscamos frontend")).toBe(idOfertaPegada("  Buscamos frontend "));
    expect(idOfertaPegada("Buscamos frontend")).not.toBe(idOfertaPegada("Buscamos backend"));
  });

  it("solo las de puntaje alto, sin CV, sin ocultar ni alertas, y con el tope del día", () => {
    const ofertas = [oferta("a", 90), oferta("b", 85), oferta("c", 95, { marca: "oculta" }), oferta("d", 99, { alertas: ["Pide pago"] }), oferta("e", 70), oferta("f", 88)];
    expect(ofertasParaCvAuto(ofertas, { conCv: ["b"] }).map((o) => o.id)).toEqual(["a", "f"]);
    expect(ofertasParaCvAuto(ofertas, { conCv: [], hechosHoy: 1 }).map((o) => o.id)).toEqual(["a"]);
    expect(ofertasParaCvAuto(ofertas, { conCv: [], hechosHoy: 2 })).toEqual([]);
    expect(ofertasParaCvAuto(ofertas, { conCv: [], umbral: 60, max: 5 }).map((o) => o.id)).toEqual(["a", "f", "b", "e"]);
  });

  it("el resumen para Aksu cuenta ofertas, CV y postulaciones", () => {
    const texto = resumenBusqueda({
      hoy: "2026-11-22",
      ofertas: [oferta("a", 70, { nueva: true }), oferta("b", 40)],
      cvs: [{ id: "a", fecha: "2026-11-21", url: "x" }],
      postulaciones: [{ etapa: "enviada", enviadaEl: "2026-11-10", enlace: "y" }],
    });
    expect(texto).toContain("Ofertas que le convienen (65/100 o más): 1, 1 nuevas");
    expect(texto).toContain("CV hechos para ofertas: 1 en total, 1 esta semana; 1 todavía sin postular");
    expect(texto).toContain("1 enviadas hace 7 días o más");
  });

  it("el resumen de la búsqueda toca cada 3 días", () => {
    expect(tocaResumenBusqueda("2026-11-22", null)).toBe(true);
    expect(tocaResumenBusqueda("2026-11-22", "2026-11-20")).toBe(false);
    expect(tocaResumenBusqueda("2026-11-22", "2026-11-19")).toBe(true);
  });

  it("la tarea de IA exige la oferta y el CV base, y usa Sonnet", () => {
    expect(TAREAS["cv-oferta"].modelo).toBe("claude-sonnet-5-5");
    expect(armarPedido({ tarea: "cv-oferta", base: CV_BASE_INICIAL, oferta: "corta" }).error).toBeTruthy();
    expect(armarPedido({ tarea: "cv-oferta", base: "poco", oferta: "x".repeat(100) }).error).toBeTruthy();
    const p = armarPedido({ tarea: "cv-oferta", base: CV_BASE_INICIAL, nombre: "Angel", oferta: "Practicante Full Stack: SQL, TypeScript, Git" });
    expect(p.error).toBeUndefined();
    expect(p.mensaje).toContain("Su CV base");
    expect(p.mensaje).toContain("Practicante Full Stack");
    expect(p.sistema).toContain("NO INVENTES NADA");
  });
});

describe("encabezado del CV base", () => {
  it("separa nombre, titular y contacto del cuerpo", () => {
    const e = encabezadoDe("Ana Pérez\nFrontend Jr\nLima • 999\nGitHub: x\n\n# PERFIL\nHola");
    expect(e.nombre).toBe("Ana Pérez");
    expect(e.titular).toBe("Frontend Jr");
    expect(e.contacto).toEqual(["Lima • 999", "GitHub: x"]);
    expect(e.cuerpo).toBe("# PERFIL\nHola");
  });

  it("sin encabezado, todo es cuerpo", () => {
    expect(encabezadoDe("# PERFIL\nHola")).toMatchObject({ nombre: "", contacto: [], cuerpo: "# PERFIL\nHola" });
    expect(encabezadoDe(CV_BASE_INICIAL).nombre).toBe("Angel Fernando Isasi Oyolo");
  });
});
