import { describe, expect, test } from "vitest";
import {
  urlSegura,
  buscarOfertas,
  confianzaDe,
  normalizarArbeitnow,
  normalizarGetOnBoard,
  normalizarHimalayas,
  normalizarRemoteOK,
  normalizarRemotive,
  normalizarWeWorkRemotely,
  nuevasDesde,
  ordenarOfertas,
  puntuarOferta,
  senalesDeAlerta,
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

  test("sin repetir: no cuenta guiones ni 'Inc', 'S.A.C.'...", () => {
    const lista = sinRepetir([
      { ...base, id: "wwr", titulo: "Front-End Developer", empresa: "Cambridge Information Group Inc" },
      { ...base, id: "rok", titulo: "Front End Developer", empresa: "Cambridge Information Group" },
      { ...base, id: "gob", titulo: "Frontend Jr", empresa: "Acme S.A.C." },
      { ...base, id: "gob2", titulo: "Frontend Jr", empresa: "ACME" },
      { ...base, id: "otra", titulo: "Frontend Jr", empresa: "Acme Labs" },
    ]);
    expect(lista.map((o) => o.id)).toEqual(["wwr", "gob", "otra"]);
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

describe("fuentes nuevas", () => {
  test("Arbeitnow: solo las remotas", () => {
    const lista = normalizarArbeitnow({
      data: [
        { slug: "a", title: "Frontend", remote: true, url: "https://www.arbeitnow.com/a" },
        { slug: "b", title: "Frontend Berlin", remote: false, url: "https://www.arbeitnow.com/b" },
      ],
    });
    expect(lista.map((o) => o.id)).toEqual(["arbeitnow:a"]);
  });

  test("Himalayas: países, Latinoamérica y su enlace para postular", () => {
    const [mundo, peru, lejos] = normalizarHimalayas({
      jobs: [
        {
          title: "Junior Frontend Developer",
          companyName: "Acme",
          applicationLink: "https://himalayas.app/companies/acme/jobs/junior-frontend?utm_source=api",
          guid: "https://himalayas.app/companies/acme/jobs/junior-frontend",
          locationRestrictions: [],
          seniority: ["Entry-level"],
          pubDate: 1794573989,
          description: "<p>React</p>",
          categories: ["Frontend-Developer"],
        },
        { title: "Frontend Intern", guid: "https://himalayas.app/companies/b/jobs/intern", locationRestrictions: ["Mexico", "Peru"] },
        { title: "Frontend Intern", guid: "https://himalayas.app/companies/c/jobs/intern", locationRestrictions: ["United States", "Canada"] },
      ],
    });
    expect(mundo).toMatchObject({
      id: "himalayas:jobs/junior-frontend",
      fuente: "Himalayas",
      empresa: "Acme",
      ubicacion: "Worldwide",
      soloOtrosPaises: false,
      seniority: "Entry-level",
    });
    expect(mundo.url).toContain("utm_source=api");
    expect(mundo.texto).toContain("Frontend Developer");
    expect(peru).toMatchObject({ ubicacion: "Peru", soloOtrosPaises: false });
    expect(lejos).toMatchObject({ ubicacion: "United States, Canada", soloOtrosPaises: true });
    // Junior pero solo para Estados Unidos y Canadá: no es para ti
    const r = puntuarOferta(lejos, perfil);
    expect(r.razones.map((x) => x.texto)).toContain("Solo para personas en otro país");
    expect(r.lugarOk).toBe(false);
  });

  test("We Work Remotely: lee el RSS (empresa y puesto del título, HTML escapado)", () => {
    const xml = `<?xml version="1.0"?><rss><channel>
      <item>
        <title>Acme &amp; Co: Junior Frontend Developer</title>
        <region>Anywhere in the World</region>
        <country></country>
        <skills>React</skills>
        <description>&lt;p&gt;We use &lt;strong&gt;React&lt;/strong&gt; &amp;amp; TypeScript&lt;/p&gt;</description>
        <pubDate>Sun, 15 Nov 2026 07:31:04 +0000</pubDate>
        <link>https://weworkremotely.com/remote-jobs/acme-junior-frontend-developer</link>
      </item>
      <item><title>Sin dos puntos</title><link>javascript:alert(1)</link></item>
    </channel></rss>`;
    const [o, otra] = normalizarWeWorkRemotely(xml);
    expect(o).toMatchObject({
      id: "wwr:acme-junior-frontend-developer",
      fuente: "We Work Remotely",
      empresa: "Acme & Co",
      titulo: "Junior Frontend Developer",
      remoto: true,
      ubicacion: "Anywhere in the World",
      url: "https://weworkremotely.com/remote-jobs/acme-junior-frontend-developer",
    });
    expect(o.fecha).toBe("2026-11-15T07:31:04.000Z");
    expect(o.texto).toContain("We use React & TypeScript");
    expect(otra).toMatchObject({ empresa: "", titulo: "Sin dos puntos", url: "https://weworkremotely.com" });
  });

  test("buscarOfertas lee como texto las fuentes en XML", async () => {
    const pedir = async (url) => {
      if (url.includes("weworkremotely"))
        return { ok: true, text: async () => "<item><title>B: Frontend Dev</title><link>https://weworkremotely.com/remote-jobs/b</link></item>" };
      return { ok: false };
    };
    const r = await buscarOfertas(pedir, { soloNavegador: true });
    expect(r.ofertas.map((o) => o.id)).toEqual(["wwr:b"]);
    expect(r.fuentes.some((f) => f.id === "himalayas")).toBe(false); // Himalayas no deja leerlo desde el navegador
  });

  test("si la misma oferta está en dos bolsas, se queda la de la más confiable", async () => {
    const pedir = async (url) => {
      if (url.includes("remoteok"))
        return { ok: true, json: async () => [{ legal: "" }, { id: "1", position: "Front End Developer", company: "Acme" }] };
      if (url.includes("weworkremotely"))
        return { ok: true, text: async () => "<item><title>Acme Inc: Front-End Developer</title><link>https://weworkremotely.com/remote-jobs/a</link></item>" };
      return { ok: false };
    };
    const r = await buscarOfertas(pedir, { soloNavegador: true });
    expect(r.ofertas.map((o) => o.fuente)).toEqual(["We Work Remotely"]);
  });
});

describe("seguridad", () => {
  test("señales de estafa típicas", () => {
    const alertas = (texto, extra = {}) => senalesDeAlerta({ titulo: "Frontend Developer", texto, ...extra });
    expect(alertas("Send your CV and contact us on WhatsApp +51 999 888 777")[0]).toMatch(/WhatsApp/);
    expect(alertas("Purchase equipment from our vendor, we reimburse you later")[0]).toMatch(/pagues/);
    expect(alertas("Deberás pagar el curso de capacitación antes de empezar")[0]).toMatch(/pagues/);
    expect(alertas("Postula a reclutamiento.acme@gmail.com")[0]).toMatch(/correo personal/);
    expect(alertas("Guaranteed returns with our forex platform")[0]).toMatch(/trading/);
    expect(alertas("Simple tasks: like and follow accounts, earn $300 per day")[0]).toMatch(/tareas simples/);
    expect(alertas("Contratación inmediata, sin entrevista")[0]).toMatch(/sin entrevista/);
    expect(alertas("Antes de empezar, envía tu DNI y cuenta bancaria")[0]).toMatch(/bancarios/);
    expect(senalesDeAlerta({ titulo: "Junior Crypto Trading Analyst", texto: "" })[0]).toMatch(/cripto/);
    expect(senalesDeAlerta({ titulo: "Junior Frontend", texto: "", salario: { min: 9000, max: 12000, moneda: "USD" } })[0]).toMatch(
      /Sueldo/,
    );
    // Sueldo anual normal (incluso uno alto de EE. UU.): no es alerta
    expect(senalesDeAlerta({ titulo: "Junior Frontend", texto: "", salario: { min: 90000, moneda: "USD" } })).toEqual([]);
    expect(senalesDeAlerta({ titulo: "Junior Frontend", texto: "", salario: { min: 250000, moneda: "USD" } })[0]).toMatch(/Sueldo/);
  });

  test("los reembolsos de beneficios reales no son alerta; que te pidan comprar sí", () => {
    const alertas = (texto) => senalesDeAlerta({ titulo: "Frontend Developer", texto });
    expect(alertas("Benefits: health insurance reimbursement and a home office stipend reimbursable up to 500 USD.")).toEqual([]);
    expect(alertas("We help providers in a complex reimbursement landscape.")).toEqual([]);
    expect(alertas("You will need to purchase our starter kit before training")[0]).toMatch(/pagues/);
    expect(alertas("Buy the equipment from our vendor and we will pay you back")[0]).toMatch(/pagues/);
  });

  test("una oferta normal no tiene alertas, aunque mencione WhatsApp como producto", () => {
    expect(
      senalesDeAlerta({
        titulo: "Frontend Developer Junior",
        texto: "Construimos integraciones con la API de WhatsApp Business usando React y TypeScript. Postula en nuestra web.",
      }),
    ).toEqual([]);
  });

  test("con alertas baja el puntaje, lo dice primero y no se avisa ni entra en 'Solo para mí'", () => {
    const oferta = { ...base, titulo: "Frontend Junior", ubicacion: "Lima, Perú", remoto: false, fecha: "2026-11-14T00:00:00Z" };
    const limpia = puntuarOferta({ ...oferta, texto: "React" }, perfil);
    const rara = puntuarOferta({ ...oferta, texto: "React. Escríbenos por WhatsApp al +51 999 888 777" }, perfil);
    expect(limpia.puntaje - rara.puntaje).toBeGreaterThanOrEqual(20); // -25 (la limpia toca el tope de 100)
    expect(rara.razones[0].texto).toMatch(/^Posible estafa/);
    expect([limpia.paraAvisar, limpia.paraMi]).toEqual([true, true]);
    expect([rara.paraAvisar, rara.paraMi]).toEqual([false, false]);
  });

  test("confianza por fuente y desempate: Get on Board primero, RemoteOK al final", () => {
    expect(confianzaDe("Get on Board").nivel).toBe("alta");
    expect(confianzaDe("RemoteOK").nivel).toBe("baja");
    expect(confianzaDe("Una fuente nueva").nivel).toBe("media");
    const igual = { ...base, titulo: "Frontend Trainee", texto: "" };
    const lista = ordenarOfertas(
      [
        { ...igual, id: "rok", fuente: "RemoteOK", empresa: "A" },
        { ...igual, id: "rem", fuente: "Remotive", empresa: "B" },
        { ...igual, id: "gob", fuente: "Get on Board", empresa: "C" },
      ],
      perfil,
    );
    expect(lista.map((o) => o.id)).toEqual(["gob", "rem", "rok"]);
    expect(lista[0].confianza.texto).toBe("Revisada");
  });

  test("'Solo para mí': junior, en Perú o Latinoamérica y de frontend", () => {
    const junior = puntuarOferta({ ...base, titulo: "Frontend Trainee", texto: "" }, perfil);
    const senior = puntuarOferta({ ...base, titulo: "Senior Frontend", texto: "" }, perfil);
    const lejos = puntuarOferta({ ...base, titulo: "Frontend Trainee", ubicacion: "USA", texto: "" }, perfil);
    expect([junior.paraMi, senior.paraMi, lejos.paraMi]).toEqual([true, false, false]);
    expect([junior.junior, junior.lugarOk]).toEqual([true, true]);
  });
});

test("nuevas desde tu última visita (la primera vez no marca ninguna)", () => {
  expect(nuevasDesde(["a", "b", "c"], null)).toEqual([]);
  expect(nuevasDesde(["a", "b", "c"], ["a", "x"])).toEqual(["b", "c"]);
});

test("los enlaces de las ofertas solo pueden ser http o https", () => {
  expect(urlSegura("https://remotive.com/job/1", "x")).toBe("https://remotive.com/job/1");
  expect(urlSegura("javascript:alert(1)", "https://remotive.com")).toBe("https://remotive.com");
  expect(urlSegura("data:text/html,hola", "r")).toBe("r");
  expect(urlSegura(undefined, "r")).toBe("r");
  expect(normalizarRemotive({ jobs: [{ id: 1, title: "Frontend", url: "javascript:alert(1)" }] })[0].url).toBe("https://remotive.com/remote-jobs");
});
