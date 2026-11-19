// Tests de la evaluación con IA con un cliente FALSO: no hay internet ni se gasta saldo.
import { describe, expect, it, vi } from "vitest";
import { armarPedido, claveCorrecta, configurada, limpiarResultado, manejarGet, manejarPost } from "./ia.js";

const ENV = { ANTHROPIC_API_KEY: "falsa", DEVPREP_IA_CLAVE: "mi-clave" };
const pedidoEntrevista = {
  tarea: "entrevista",
  pregunta: "¿Prefieres trabajar solo o en equipo?",
  claves: ["Equilibrio", "Un ejemplo concreto"],
  modelo: "Me siento cómodo de las dos formas...",
  respuesta: "Prefiero en equipo porque aprendo de otros y revisan mi código.",
};
const resultadoIa = { puntaje: 7, veredicto: "dude", resumen: "Bien, pero sin ejemplo.", bien: ["Valoras el equipo"], falta: ["Un ejemplo concreto"], mejor: "Me siento cómodo...", repregunta: "¿Un ejemplo?" };

function request(cuerpo, clave = "mi-clave") {
  return new Request("https://x/api/ia", { method: "POST", headers: { "content-type": "application/json", ...(clave ? { "x-clave": clave } : {}) }, body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo) });
}

/** Un cliente de IA falso que devuelve lo que le digamos y guarda con qué lo llamaron. */
function clienteFalso(respuesta) {
  const create = vi.fn(async () => respuesta);
  return { create, crearCliente: () => ({ beta: { messages: { create } } }) };
}
const conTexto = (obj, extra = {}) => ({ stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(obj) }], usage: { input_tokens: 900, output_tokens: 300 }, ...extra });

describe("configuración y contraseña", () => {
  it("sin las dos variables no está configurada y no llama a la IA", async () => {
    expect(configurada({})).toBe(false);
    expect(configurada({ ANTHROPIC_API_KEY: "x" })).toBe(false);
    const falso = clienteFalso(conTexto(resultadoIa));
    const r = await manejarPost(request(pedidoEntrevista), { env: {}, crearCliente: falso.crearCliente });
    expect(r.status).toBe(503);
    expect(falso.create).not.toHaveBeenCalled();
    expect(await manejarGet({}).json()).toEqual({ configurada: false });
  });

  it("con contraseña incorrecta o sin ella no llama a la IA", async () => {
    const falso = clienteFalso(conTexto(resultadoIa));
    expect((await manejarPost(request(pedidoEntrevista, "otra"), { env: ENV, crearCliente: falso.crearCliente })).status).toBe(401);
    expect((await manejarPost(request(pedidoEntrevista, null), { env: ENV, crearCliente: falso.crearCliente })).status).toBe(401);
    expect(falso.create).not.toHaveBeenCalled();
    expect(claveCorrecta("mi-clave", "mi-clave")).toBe(true);
    expect(claveCorrecta("mi-clav", "mi-clave")).toBe(false);
  });
});

describe("armarPedido", () => {
  it("rechaza tareas desconocidas y respuestas vacías", () => {
    expect(armarPedido({ tarea: "otra" }).error).toBeTruthy();
    expect(armarPedido({ ...pedidoEntrevista, respuesta: "no sé" }).error).toMatch(/corta/);
    expect(armarPedido({ ...pedidoEntrevista, pregunta: "" }).error).toBeTruthy();
  });

  it("incluye la lista del entrevistador, el modelo y tus datos", () => {
    const p = armarPedido({ ...pedidoEntrevista, contexto: "Hice dev-prep, una app para practicar." });
    expect(p.mensaje).toContain("- Equilibrio");
    expect(p.mensaje).toContain("Respuesta modelo");
    expect(p.mensaje).toContain("dev-prep");
    expect(p.esquema.required).toContain("repregunta");
  });

  it("recorta textos enormes", () => {
    const p = armarPedido({ ...pedidoEntrevista, respuesta: "palabra ".repeat(5000) });
    expect(p.mensaje.length).toBeLessThan(9000);
  });

  it("inglés: usa el nivel pedido", () => {
    const p = armarPedido({ tarea: "ingles", pregunta: "What would you do?", respuesta: "I will do many things for improve.", nivel: "C1" });
    expect(p.mensaje).toContain("nivel C1");
    expect(p.esquema.required).toContain("correcciones");
  });
});

describe("manejarPost con la IA falsa", () => {
  it("devuelve la evaluación limpia y pide formato JSON", async () => {
    const falso = clienteFalso(conTexto({ ...resultadoIa, puntaje: 14 }));
    const r = await manejarPost(request(pedidoEntrevista), { env: ENV, crearCliente: falso.crearCliente });
    expect(r.status).toBe(200);
    const { resultado, uso } = await r.json();
    expect(resultado.puntaje).toBe(10); // fuera de rango: se recorta
    expect(resultado.veredicto).toBe("dude");
    expect(uso).toEqual({ modelo: "claude-sonnet-5-5", entrada: 900, salida: 300 });
    const params = falso.create.mock.calls[0][0];
    expect(params.output_config.format.type).toBe("json_schema");
    expect(params.output_config.effort).toBe("medium");
    expect(params.max_tokens).toBeGreaterThan(1000);
  });

  it("cada tarea usa su modelo: entrevista e informe el mediano, inglés el pequeño (sin respaldo)", async () => {
    const entrevista = clienteFalso(conTexto(resultadoIa));
    await manejarPost(request(pedidoEntrevista), { env: ENV, crearCliente: entrevista.crearCliente });
    expect(entrevista.create.mock.calls[0][0].model).toBe("claude-sonnet-5-5");
    expect(entrevista.create.mock.calls[0][0].fallbacks).toBe("default");

    const ingles = clienteFalso(conTexto({ nivel: "B2", puntaje: 7, correcciones: [], version: "v", comentario: "c" }));
    await manejarPost(request({ tarea: "ingles", pregunta: "What would you do?", respuesta: "I will do many things for improve." }), { env: ENV, crearCliente: ingles.crearCliente });
    const params = ingles.create.mock.calls[0][0];
    expect(params.model).toBe("claude-haiku-5-5");
    expect(params.fallbacks).toBeUndefined();
    expect(params.betas).toEqual(["structured-outputs-2025-12-15"]);
  });

  it("informe: arma el balance con las preguntas, sus notas y lo que respondiste", async () => {
    const items = [
      { etapa: "Recursos humanos", pregunta: "Cuéntame sobre ti.", nota: "sabia", puntaje: 8, respuesta: "Soy estudiante de sistemas y construí una app." },
      { etapa: "Entrevista técnica", pregunta: "¿Qué es un closure?", nota: "no", falta: ["Dar un ejemplo"] },
      { pregunta: "", nota: "sabia" }, // sin pregunta: se descarta
    ];
    const p = armarPedido({ tarea: "informe", items, notas: "Me puse nervioso.", voz: true });
    expect(p.mensaje).toContain("1. [Recursos humanos] Cuéntame sobre ti.");
    expect(p.mensaje).toContain("8/10, bien");
    expect(p.mensaje).toContain("Le faltó: Dar un ejemplo");
    expect(p.mensaje).toContain("Me puse nervioso");
    expect(p.mensaje).not.toContain("3. ");
    expect(armarPedido({ tarea: "informe", items: items.slice(0, 1) }).error).toMatch(/al menos 2/);

    const falso = clienteFalso(conTexto({ puntaje: 6, nivel: "otro", resumen: "Vas bien.", fortalezas: ["a", "b", "c", "d"], mejoras: ["x"], plan: ["1", "2", "3", "4", "5", "6"] }));
    const r = await manejarPost(request({ tarea: "informe", items }), { env: ENV, crearCliente: falso.crearCliente });
    const { resultado } = await r.json();
    expect(resultado.nivel).toBe("casi"); // un nivel desconocido cae al del medio
    expect(resultado.fortalezas).toHaveLength(3);
    expect(resultado.plan).toHaveLength(5);
  });

  it("usa el modelo de la variable IA_MODELO si existe", async () => {
    const falso = clienteFalso(conTexto(resultadoIa));
    await manejarPost(request(pedidoEntrevista), { env: { ...ENV, IA_MODELO: "otro-modelo" }, crearCliente: falso.crearCliente });
    expect(falso.create.mock.calls[0][0].model).toBe("otro-modelo");
  });

  it("si la IA declina o se corta, avisa sin romperse", async () => {
    const declina = clienteFalso({ stop_reason: "refusal", content: [] });
    expect((await manejarPost(request(pedidoEntrevista), { env: ENV, crearCliente: declina.crearCliente })).status).toBe(502);
    const cortada = clienteFalso({ stop_reason: "max_tokens", content: [] });
    expect((await (await manejarPost(request(pedidoEntrevista), { env: ENV, crearCliente: cortada.crearCliente })).json()).error).toMatch(/incompleta/);
  });

  it("errores de la API (sin saldo, key inválida) se traducen", async () => {
    const sinSaldo = { crearCliente: () => ({ beta: { messages: { create: async () => Promise.reject(Object.assign(new Error("credit balance too low"), { status: 400 })) } } }) };
    expect((await (await manejarPost(request(pedidoEntrevista), { env: ENV, ...sinSaldo })).json()).error).toMatch(/saldo/);
    const keyMala = { crearCliente: () => ({ beta: { messages: { create: async () => Promise.reject(Object.assign(new Error("x"), { status: 401 })) } } }) };
    expect((await (await manejarPost(request(pedidoEntrevista), { env: ENV, ...keyMala })).json()).error).toMatch(/API key/);
  });

  it("un cuerpo que no es JSON es un 400", async () => {
    const falso = clienteFalso(conTexto(resultadoIa));
    expect((await manejarPost(request("{malo"), { env: ENV, crearCliente: falso.crearCliente })).status).toBe(400);
  });
});

describe("limpiarResultado", () => {
  it("inglés: normaliza nivel, puntaje y correcciones", () => {
    const r = limpiarResultado("ingles", { nivel: "Z9", puntaje: -3, correcciones: [{ original: "for improve", corregido: "to improve" }], version: "v", comentario: "c" });
    expect(r.nivel).toBe("B1");
    expect(r.puntaje).toBe(0);
    expect(r.correcciones[0]).toEqual({ original: "for improve", corregido: "to improve", explicacion: "" });
  });
});

it("omitir: la entrevista por voz pide que no se escriba lo que no va a usar", () => {
  const base = { tarea: "entrevista", pregunta: "¿Qué es un closure?", respuesta: "Una función que recuerda su entorno" };
  expect(armarPedido({ ...base, omitir: ["mejor", "otra-cosa"] }).mensaje).toContain('No escribas "mejor"');
  expect(armarPedido(base).mensaje).not.toContain("No escribas");
});

describe("código de invitado", () => {
  const ENV_INV = { ...ENV, DEVPREP_IA_INVITADO: "codigo-invitado", ANTHROPIC_API_KEY_INVITADO: "key-invitado" };

  it("el invitado entra con su código y la IA se crea con su rol (su propia key)", async () => {
    const falso = clienteFalso(conTexto(resultadoIa));
    const crearCliente = vi.fn(falso.crearCliente);
    const r = await manejarPost(request(pedidoEntrevista, "codigo-invitado"), { env: ENV_INV, crearCliente });
    expect(r.status).toBe(200);
    expect(crearCliente).toHaveBeenCalledWith("invitado");
    await manejarPost(request(pedidoEntrevista), { env: ENV_INV, crearCliente });
    expect(crearCliente).toHaveBeenLastCalledWith("dueno");
  });

  it("sin su API key propia, el código de invitado no sirve (nunca gasta de la tuya)", async () => {
    const falso = clienteFalso(conTexto(resultadoIa));
    const env = { ...ENV, DEVPREP_IA_INVITADO: "codigo-invitado" };
    expect((await manejarPost(request(pedidoEntrevista, "codigo-invitado"), { env, crearCliente: falso.crearCliente })).status).toBe(401);
    expect(falso.create).not.toHaveBeenCalled();
  });

  it("GET: solo el dueño ve el código de invitado", async () => {
    const get = (clave) => manejarGet(ENV_INV, new Request("https://x/api/ia", { headers: clave ? { "x-clave": clave } : {} })).json();
    expect(await get()).toEqual({ configurada: true });
    expect(await get("mi-clave")).toEqual({ configurada: true, rol: "dueno", invitado: { codigo: "codigo-invitado" } });
    expect(await get("codigo-invitado")).toEqual({ configurada: true, rol: "invitado" });
    expect(await get("otra")).toEqual({ configurada: true, rol: null });
  });

  it("al llegar al límite del espacio de trabajo, el invitado ve un mensaje claro", async () => {
    const error = Object.assign(new Error("You have reached your specified workspace API usage limits"), { status: 400 });
    const crearCliente = () => ({ beta: { messages: { create: async () => { throw error; } } } });
    const r = await manejarPost(request(pedidoEntrevista, "codigo-invitado"), { env: ENV_INV, crearCliente });
    expect((await r.json()).error).toMatch(/invitado.*tope/);
  });
});
