import { describe, expect, test } from "vitest";
import { crearMemoriaFrases, idFrase, MAX_POR_GRUPO, ordenSinRepetir } from "./sin-repetir.js";
import { CHARLA, EXPRESIONES, FRASES_NIVEL } from "./contenido-nivel.js";
import { SUENOS } from "./contenido.js";
import { crearApiMapache } from "./api-mapache.js";

/** Un localStorage de mentira (en memoria) para los tests. */
function almacenFalso() {
  const datos = new Map();
  return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, String(v)), datos };
}

const lista = Array.from({ length: 6 }, (_, i) => ({ en: `frase ${i}`, es: `frase ${i}` }));

describe("Map no repite lo que dice", () => {
  test("las no vistas van primero y las vistas al final, de la más antigua a la más reciente", () => {
    const vistas = [idFrase(lista[2]), idFrase(lista[0])]; // la 0 es la más reciente
    const orden = ordenSinRepetir(lista, vistas, "2026-11-20");
    expect(orden).toHaveLength(6);
    expect(orden.slice(0, 4).map((f) => f.en).sort()).toEqual(["frase 1", "frase 3", "frase 4", "frase 5"]);
    expect(orden.slice(4).map((f) => f.en)).toEqual(["frase 2", "frase 0"]);
  });

  test("mostrando siempre la primera del orden, no se repite ninguna hasta pasar por todas", () => {
    const memoria = crearMemoriaFrases(almacenFalso());
    const vistas = [];
    for (let i = 0; i < lista.length; i++) {
      const f = memoria.ordenar("g", lista, "dia")[0];
      vistas.push(f.en);
      memoria.marcar("g", idFrase(f));
    }
    expect(new Set(vistas).size).toBe(lista.length);
    // Se vieron todas: vuelve la que salió hace más tiempo, no la última
    expect(memoria.ordenar("g", lista, "dia")[0].en).toBe(vistas[0]);
  });

  test("la frase del día no cambia en el día y al día siguiente sale una que no viste", () => {
    const almacen = almacenFalso();
    const memoria = crearMemoriaFrases(almacen);
    const hoy = memoria.delDia("B:normal", "2026-11-20", lista);
    expect(memoria.delDia("B:normal", "2026-11-20", lista)).toBe(hoy);
    // Otra pantalla (u otra recarga) lee lo mismo del almacén
    expect(crearMemoriaFrases(almacen).delDia("B:normal", "2026-11-20", lista)).toBe(hoy);
    const manana = memoria.delDia("B:normal", "2026-11-21", lista);
    expect(manana).not.toBe(hoy);
    // Los grupos no se mezclan
    expect(memoria.vistas("charla")).toEqual([]);
  });

  test("recuerda como mucho MAX_POR_GRUPO por grupo y aguanta un almacén roto", () => {
    const memoria = crearMemoriaFrases(almacenFalso());
    for (let i = 0; i < MAX_POR_GRUPO + 20; i++) memoria.marcar("g", `id${i}`);
    expect(memoria.vistas("g")).toHaveLength(MAX_POR_GRUPO);
    expect(memoria.vistas("g").at(-1)).toBe(`id${MAX_POR_GRUPO + 19}`);
    const roto = { getItem: () => "{no es json", setItem: () => { throw new Error("lleno"); } };
    expect(() => crearMemoriaFrases(roto).delDia("g", "2026-11-20", lista)).not.toThrow();
    expect(crearMemoriaFrases(null).delDia("g", "2026-11-20", lista)).toBeTruthy();
  });

  test("en la app: al volver a abrir a Map, la del día sigue y lo que ya dijo pasa al final", async () => {
    const progreso = {
      hoy: () => "2026-11-20",
      dias: () => ({}),
      datos: () => ({ items: {} }),
      registros: () => ({}),
      guardarRegistro: () => {},
      ajuste: (_, def) => def,
    };
    const api = crearApiMapache({
      progreso,
      itemsIngles: async () => ({ unidades: [], items: [] }),
      json: async () => ({ unidades: [] }),
      extraIngles: () => ({}),
      limpiar: () => {},
      almacen: almacenFalso(),
    });
    const primera = await api.mapache(); // sin práctica: Map es "nuevo" (no depende de la hora)
    expect(primera.estado).toBe("nuevo");
    expect(primera.frases.every((f) => f.grupo && f.id)).toBe(true);
    expect(new Set(primera.frases.map((f) => f.en)).size).toBe(primera.frases.length);
    // Lo tocaste 4 veces: viste la del día y las 4 siguientes
    const dichas = primera.frases.slice(0, 5);
    for (const f of dichas) await api.mapacheVista(f.grupo, f.id);
    const segunda = await api.mapache();
    expect(segunda.frase.en).toBe(primera.frase.en);
    // De la charla (grupo grande) salen otras; las que ya dijo quedan al final
    const charla = (r) => r.frases.filter((f) => f.grupo === "charla").map((f) => f.en);
    const dichasCharla = dichas.filter((f) => f.grupo === "charla").map((f) => f.en);
    expect(dichasCharla.length).toBeGreaterThan(0);
    const nuevaCharla = charla(segunda);
    for (const en of dichasCharla) expect(nuevaCharla.slice(0, -dichasCharla.length)).not.toContain(en);
    expect(nuevaCharla.slice(-dichasCharla.length)).toEqual(dichasCharla);
    // Los sueños también llevan su grupo para no repetirse
    expect(segunda.suenos[0]).toMatchObject({ grupo: "suenos" });
  });
});

describe("las frases de Map", () => {
  const todas = [...Object.values(FRASES_NIVEL).flatMap((f) => Object.values(f).flat()), ...CHARLA, ...SUENOS];

  test("no hay frases repetidas ni rayas largas", () => {
    const vistas = new Set();
    for (const f of todas) {
      const clave = f.en.trim().toLowerCase();
      expect(vistas.has(clave), f.en).toBe(false);
      vistas.add(clave);
      expect(f.en + f.es + (f.expresion?.en ?? "") + (f.expresion?.es ?? ""), f.en).not.toContain("—");
    }
    for (const e of Object.values(EXPRESIONES).flat()) expect(e.en + e.es + e.ej.en + e.ej.es).not.toContain("—");
  });

  test("los marcadores están bien: {n} solo cuando habla de lo que escondió, y igual en inglés y en español", () => {
    for (const [franja, estados] of Object.entries(FRASES_NIVEL))
      for (const [estado, frases] of Object.entries(estados))
        for (const f of frases) {
          const marcas = (t) => (t.match(/\{\w+\}/g) ?? []).sort();
          expect(marcas(f.en), franja + estado + f.en).toEqual(marcas(f.es));
          for (const m of marcas(f.en)) expect(estado === "robos" ? ["{w}", "{n}"] : ["{w}"], f.en).toContain(m);
        }
    for (const f of [...CHARLA, ...SUENOS]) expect(f.en + f.es, f.en).not.toMatch(/\{\w+\}/);
  });

  test("hay variedad donde más se ve: franja B, la charla y los sueños", () => {
    expect(FRASES_NIVEL.B.normal.length).toBeGreaterThanOrEqual(40);
    expect(FRASES_NIVEL.B.feliz.length).toBeGreaterThanOrEqual(40);
    expect(CHARLA.length).toBeGreaterThanOrEqual(40);
    expect(SUENOS.length).toBeGreaterThanOrEqual(40);
    for (const f of CHARLA) expect(f.expresion?.en, f.en).toBeTruthy();
  });
});
