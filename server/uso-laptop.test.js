import { describe, expect, it } from "vitest";
import { clasificar, crearUsoLaptop, diaVacio, mejoresHoras, resumen, sumar } from "./uso-laptop.js";

describe("uso de la laptop", () => {
  it("clasifica programas y páginas", () => {
    expect(clasificar("Code", "index.js - dev-prep")).toEqual({ nombre: "VS Code", tipo: "estudio" });
    expect(clasificar("chrome", "Lofi para estudiar - YouTube - Google Chrome")).toEqual({ nombre: "YouTube", tipo: "distraccion" });
    expect(clasificar("chrome", "Hoy · dev-prep - Google Chrome").nombre).toBe("dev-prep");
    expect(clasificar("chrome", "Array.prototype.map() - MDN").tipo).toBe("estudio");
    expect(clasificar("chrome", "Mi banco").tipo).toBe("neutral");
    expect(clasificar("dota2", "Dota 2")).toEqual({ nombre: "Dota 2", tipo: "distraccion" });
    expect(clasificar("LockApp", "")).toBeNull();
    expect(clasificar("", "")).toBeNull();
  });

  it("suma por programa y por hora de estudio", () => {
    let dia = diaVacio("2026-11-20");
    for (let i = 0; i < 8; i++) dia = sumar(dia, { nombre: "VS Code", tipo: "estudio" }, 15, 20);
    for (let i = 0; i < 4; i++) dia = sumar(dia, { nombre: "YouTube", tipo: "distraccion" }, 15, 20);
    dia = sumar(dia, { nombre: "Chat", tipo: "distraccion" }, 15, 21); // menos de un minuto: no sale en la lista
    const r = resumen(dia);
    expect(r.lista.map((x) => x.nombre)).toEqual(["VS Code", "YouTube"]);
    expect(r.estudio).toBe(120);
    expect(r.distraccion).toBe(60);
    expect(dia.horas).toEqual({ 20: 120 });
  });

  it("mejores horas: hacen falta 3 días y 20 minutos por hora", () => {
    const dia = (horas) => ({ fecha: "x", apps: {}, horas });
    expect(mejoresHoras([dia({ 20: 3000 }), dia({ 20: 3000 })])).toEqual([]);
    expect(mejoresHoras([dia({ 20: 3000, 9: 100 }), dia({ 20: 3000, 22: 900 }), dia({ 21: 2000, 22: 900 })])).toEqual([20, 21, 22]);
  });

  it("no cuenta el tiempo ausente, salvo videos y juegos, y nunca expone títulos", () => {
    const uso = crearUsoLaptop({ datosDir: ".", ahora: () => new Date(2026, 10, 20, 20, 0, 0) });
    for (let i = 0; i < 4; i++) uso._muestra({ app: "Code", titulo: "secreto.js", quieto: 3 });
    uso._muestra({ app: "Code", titulo: "secreto.js", quieto: 900 });
    expect(uso.estado().actual).toBeNull();
    for (let i = 0; i < 4; i++) uso._muestra({ app: "chrome", titulo: "Video - YouTube", quieto: 900 });
    const e = uso.estado();
    expect(e.actual.nombre).toBe("YouTube");
    expect(e.hoy.lista).toEqual([
      { nombre: "VS Code", tipo: "estudio", segundos: 60 },
      { nombre: "YouTube", tipo: "distraccion", segundos: 60 },
    ]);
    expect(JSON.stringify(e)).not.toContain("secreto");
  });
});
