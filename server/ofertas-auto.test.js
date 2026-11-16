import { describe, expect, test } from "vitest";
import {
  buscarOfertas,
  normalizarGetOnBoard,
  normalizarRemoteOK,
  normalizarRemotive,
  ordenarOfertas,
  puntuarOferta,
  sinRepetir,
  textoPlano,
} from "./ofertas-auto.js";

const base = {
  id: "x",
  fuente: "Prueba",
  empresa: "Acme",
  url: "https://ejemplo.test",
  remoto: true,
  ubicacion: "LATAM",
  seniority: null,
  fecha: "2026-11-15T10:00:00Z",
  idioma: "es",
};
const perfil = { mapa: [], ingles: { inglesDominadas: 5, inglesTotal: 45 }, hoy: "2026-11-16" };

describe("normalizar", () => {
  test("texto plano sin etiquetas ni entidades", () => {
    expect(textoPlano("<p>Hola&nbsp;<strong>React</strong></p><ul><li>Uno</li><li>Dos</li></ul>")).toBe("Hola React\nUno\nDos");
  });

  test("Get on Board", () => {
    const [o] = normalizarGetOnBoard({
      data: [
        {
          id: "frontend-junior-acme-lima",
          attributes: {
            title: "Frontend Junior",
            description: "<p>React</p>",
            remote: false,
            remote_modality: "hybrid",
            countries: ["Peru"],
            min_salary: 800,
            max_salary: 1200,
            published_at: 1794573989,
            seniority: { data: { attributes: { name: "Junior" } } },
            company: { data: { attributes: { name: "Acme" } } },
          },
          links: { public_url: "https://www.getonbrd.com/jobs/frontend-junior-acme-lima" },
        },
      ],
    });
    expect(o).toMatchObject({
      id: "gob:frontend-junior-acme-lima",
      titulo: "Frontend Junior",
      empresa: "Acme",
      remoto: false,
      ubicacion: "Peru",
      seniority: "Junior",
    });
    expect(o.salario).toEqual({ min: 800, max: 1200, moneda: "USD" });
    expect(o.fecha).toMatch(/^2026-/);
  });

  test("Remotive y RemoteOK (RemoteOK trae un primer elemento legal que se salta)", () => {
    expect(
      normalizarRemotive({ jobs: [{ id: 1, title: "React Dev", company_name: "B", url: "u", publication_date: "2026-11-10T00:00:00" }] })[0]
        .id,
    ).toBe("remotive:1");
    const ok = normalizarRemoteOK([
      { legal: "..." },
      { id: "9", position: "Frontend", company: "C", tags: ["react"], description: "<p>x</p>" },
    ]);
    expect(ok).toHaveLength(1);
    expect(ok[0].texto).toContain("react");
  });

  test("sin repetir: misma oferta en dos fuentes queda una vez", () => {
    const lista = sinRepetir([
      { ...base, id: "a", titulo: "Frontend Dev", empresa: "Acme" },
      { ...base, id: "b", titulo: "Frontend  Dev", empresa: "ACME" },
      { ...base, id: "c", titulo: "Otra", empresa: "Acme" },
    ]);
    expect(lista.map((o) => o.id)).toEqual(["a", "c"]);
  });
});

describe("puntaje", () => {
  test("un puesto que no es de desarrollo web no entra", () => {
    const r = puntuarOferta({ ...base, titulo: "Content Creator - YouTube", texto: "videos" }, perfil);
    expect(r.relevante).toBe(false);
  });

  test("frontend junior en Perú puntúa mucho más que frontend senior en Estados Unidos", () => {
    const junior = puntuarOferta(
      { ...base, titulo: "Desarrollador Frontend Junior", ubicacion: "Lima, Perú", remoto: false, texto: "React y JavaScript" },
      perfil,
    );
    const senior = puntuarOferta(
      { ...base, titulo: "Senior Frontend Engineer", ubicacion: "USA only", texto: "React, 6+ years of experience" },
      perfil,
    );
    expect(junior.puntaje).toBeGreaterThan(senior.puntaje + 40);
    expect(junior.razones.map((r) => r.texto)).toContain("Busca junior, practicante o trainee");
    expect(senior.razones.some((r) => r.texto.includes("6 o más años"))).toBe(true);
  });

  test("las tecnologías que dominas suben el puntaje", () => {
    const mapa = [{ id: "react-jsx-y-componentes", valor: 0.9 }];
    const con = puntuarOferta({ ...base, titulo: "React Developer", texto: "React" }, { ...perfil, mapa });
    const sin = puntuarOferta({ ...base, titulo: "React Developer", texto: "React" }, perfil);
    expect(con.puntaje).toBeGreaterThanOrEqual(sin.puntaje);
    expect(con.tecnologias.length).toBeGreaterThan(0);
  });

  test("una oferta vieja baja y una nueva sube", () => {
    const nueva = puntuarOferta({ ...base, titulo: "Frontend Developer", texto: "", fecha: "2026-11-15T00:00:00Z" }, perfil);
    const vieja = puntuarOferta({ ...base, titulo: "Frontend Developer", texto: "", fecha: "2026-09-01T00:00:00Z" }, perfil);
    expect(nueva.puntaje - vieja.puntaje).toBe(33); // +8 por nueva, -25 por tener más de mes y medio
  });

  test("ordenar deja solo las relevantes, de mayor a menor puntaje", () => {
    const lista = ordenarOfertas(
      [
        { ...base, id: "1", titulo: "Senior Frontend", texto: "" },
        { ...base, id: "2", titulo: "Marketing Manager", texto: "" },
        { ...base, id: "3", titulo: "Frontend Trainee", texto: "" },
      ],
      perfil,
    );
    expect(lista.map((o) => o.id)).toEqual(["3", "1"]);
  });
});

describe("buscarOfertas", () => {
  test("junta las fuentes que responden y salta las que fallan", async () => {
    const pedir = async (url) => {
      if (url.includes("remotive"))
        return { ok: true, json: async () => ({ jobs: [{ id: 1, title: "React Dev", company_name: "B", url: "u" }] }) };
      if (url.includes("remoteok")) throw new Error("sin red");
      return { ok: false, json: async () => ({}) };
    };
    const r = await buscarOfertas(pedir, { soloNavegador: true });
    expect(r.ofertas).toHaveLength(1);
    expect(r.fuentes.find((f) => f.id === "remotive")).toMatchObject({ ok: true, cantidad: 1 });
    expect(r.fuentes.find((f) => f.id === "remoteok").ok).toBe(false);
    expect(r.fuentes.some((f) => f.id === "getonbrd")).toBe(false);
  });
});

describe("ofertas para avisar", () => {
  test("una oferta junior, en Perú y de esta semana sí; una senior o vieja, no", () => {
    const buena = puntuarOferta(
      { ...base, titulo: "Frontend Junior", ubicacion: "Lima, Perú", remoto: false, texto: "", fecha: "2026-11-14T00:00:00Z" },
      perfil,
    );
    const senior = puntuarOferta({ ...base, titulo: "Senior Frontend", texto: "", fecha: "2026-11-14T00:00:00Z" }, perfil);
    const vieja = puntuarOferta({ ...base, titulo: "Frontend Junior", texto: "", fecha: "2026-10-01T00:00:00Z" }, perfil);
    expect([buena.paraAvisar, senior.paraAvisar, vieja.paraAvisar]).toEqual([true, false, false]);
  });

  test("solo las marcadas para avisar que no se avisaron antes", async () => {
    const { ofertasParaAvisar } = await import("./ofertas-auto.js");
    const lista = [
      { id: "a", paraAvisar: true },
      { id: "b", paraAvisar: false },
      { id: "c", paraAvisar: true },
    ];
    expect(ofertasParaAvisar(lista, ["c"]).map((o) => o.id)).toEqual(["a"]);
  });
});
