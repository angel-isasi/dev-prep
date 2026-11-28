import { describe, expect, it } from "vitest";
import { accionValida, armarAksuVivo, compactarCatalogo, HERRAMIENTAS_AKSU, MODELO_AKSU, responderEnVivo } from "./aksu-vivo.js";
import { manejarPost } from "./ia.js";

/** Un cliente falso: devuelve los eventos dados y el mensaje final. */
function clienteFalso({ trozos = [], final = {}, falla = null } = {}) {
  const llamadas = [];
  return {
    llamadas,
    beta: {
      messages: {
        stream(params) {
          llamadas.push(params);
          if (falla) throw falla;
          return {
            async *[Symbol.asyncIterator]() {
              for (const t of trozos) yield { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: t } };
            },
            finalMessage: async () => ({
              model: MODELO_AKSU,
              stop_reason: "end_turn",
              content: [],
              usage: { input_tokens: 100, output_tokens: 20, cache_creation_input_tokens: 0, cache_read_input_tokens: 1000 },
              ...final,
            }),
          };
        },
      },
    },
  };
}

const leer = async (respuesta) => (await respuesta.text()).trim().split("\n").map((l) => JSON.parse(l));

describe("armarAksuVivo", () => {
  it("pide algo que decir", () => {
    expect(armarAksuVivo({})).toEqual({ error: "Dime algo" });
  });

  it("arma la conversación por turnos, empezando por él, y el mensaje de ahora al final", () => {
    const p = armarAksuVivo({
      pregunta: "¿qué es un closure?",
      datos: "Se llama Ana.",
      historial: [
        { de: "jarvis", texto: "Buenos días." },
        { de: "yo", texto: "hola" },
      ],
    });
    expect(p.messages[0]).toEqual({ role: "user", content: "(Empieza la conversación de hoy.)" });
    expect(p.messages[1]).toEqual({ role: "assistant", content: "Buenos días." });
    expect(p.messages.at(-1).role).toBe("user");
    expect(p.messages.at(-1).content).toContain("Se llama Ana.");
    expect(p.messages.at(-1).content).toContain("Él te dice: ¿qué es un closure?");
    expect(p.esfuerzo).toBe("medium");
  });

  it("lo que te acaba de decir no se manda dos veces", () => {
    const p = armarAksuVivo({ pregunta: "ábreme uno", historial: [{ de: "jarvis", texto: "Hola." }, { de: "yo", texto: "ábreme uno" }] });
    expect(p.messages.map((m) => m.role)).toEqual(["user", "assistant", "user"]);
    expect(p.messages.at(-1).content).toContain("Él te dice: ábreme uno");
  });

  it("si habla por su cuenta piensa menos, y guarda en caché el sistema con el catálogo", () => {
    const p = armarAksuVivo({ momento: "Arranque del día", catalogo: "js-gu-001: Ficha" });
    expect(p.esfuerzo).toBe("low");
    expect(p.system).toHaveLength(2);
    expect(p.system[1].text).toContain("js-gu-001");
    expect(p.system[1].cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
    expect(p.system[0].cache_control).toBeUndefined();
  });
});

describe("compactarCatalogo", () => {
  it("agrupa los ejercicios por tema y deja los temas igual", () => {
    const texto = "Temas de Aprender:\nvariables-y-tipos: Variables y tipos\n\nEjercicios:\njs-1: Sumar (tema arrays, nivel 1)\njs-2: Promedio (tema arrays, nivel 2)\njs-3: Ficha (tema variables, nivel 1)";
    const c = compactarCatalogo(texto);
    expect(c).toContain("variables-y-tipos: Variables y tipos");
    expect(c).toContain("[arrays] js-1 Sumar·1; js-2 Promedio·2");
    expect(c).toContain("[variables] js-3 Ficha·1");
    expect(c.length).toBeLessThan(texto.length + 60);
  });

  it("si no reconoce el formato, lo deja como vino", () => {
    expect(compactarCatalogo("algo raro")).toBe("algo raro");
  });
});

describe("accionValida", () => {
  it("acepta solo herramientas conocidas con datos sanos", () => {
    expect(accionValida("ir_a", { destino: "ingles" })).toEqual({ destino: "ingles" });
    expect(accionValida("ir_a", { destino: "otra-cosa" })).toBeNull();
    expect(accionValida("abrir_ejercicio", { id: "js-gu-001" })).toEqual({ id: "js-gu-001" });
    expect(accionValida("abrir_ejercicio", { id: "../../etc" })).toBeNull();
    expect(accionValida("bloque_concentracion", { minutos: 500 })).toEqual({ minutos: 180 });
    expect(accionValida("silencio", { minutos: 0 })).toBeNull();
    expect(accionValida("borrar_todo", {})).toBeNull();
  });

  it("todas las herramientas son estrictas y sin propiedades extra", () => {
    for (const h of HERRAMIENTAS_AKSU) {
      expect(h.strict).toBe(true);
      expect(h.input_schema.additionalProperties).toBe(false);
    }
  });
});

describe("responderEnVivo", () => {
  it("manda el texto a trozos, luego las acciones y el costo", async () => {
    const cliente = clienteFalso({
      trozos: ["Hola. ", "Te abro uno."],
      final: { stop_reason: "tool_use", content: [{ type: "tool_use", name: "abrir_ejercicio", input: { id: "js-gu-001" } }, { type: "tool_use", name: "inventada", input: {} }] },
    });
    const eventos = await leer(responderEnVivo(cliente, armarAksuVivo({ pregunta: "ábreme uno" })));
    expect(eventos.filter((e) => e.t === "texto").map((e) => e.d).join("")).toBe("Hola. Te abro uno.");
    expect(eventos.filter((e) => e.t === "accion")).toEqual([{ t: "accion", nombre: "abrir_ejercicio", datos: { id: "js-gu-001" } }]);
    const fin = eventos.at(-1);
    expect(fin.t).toBe("fin");
    // La caché leída cuenta como entrada barata: 100 + 1000 × 0,05
    expect(fin.uso).toEqual({ modelo: MODELO_AKSU, entrada: 150, salida: 20 });
    const params = cliente.llamadas[0];
    expect(params.model).toBe(MODELO_AKSU);
    expect(params.tools).toBe(HERRAMIENTAS_AKSU);
    expect(params.output_config).toEqual({ effort: "medium" });
    expect(params.fallbacks).toBe("default");
  });

  it("no ejecuta herramientas cortadas por el límite de tokens", async () => {
    const cliente = clienteFalso({ final: { stop_reason: "max_tokens", content: [{ type: "tool_use", name: "ir_a", input: { destino: "plan" } }] } });
    const eventos = await leer(responderEnVivo(cliente, armarAksuVivo({ pregunta: "x" })));
    expect(eventos.some((e) => e.t === "accion")).toBe(false);
  });

  it("si el modelo declina o falla la conexión, avisa con un error", async () => {
    const declina = await leer(responderEnVivo(clienteFalso({ final: { stop_reason: "refusal" } }), armarAksuVivo({ pregunta: "x" })));
    expect(declina.at(-1).t).toBe("error");
    const cae = await leer(responderEnVivo(clienteFalso({ falla: Object.assign(new Error("rate"), { status: 429 }) }), armarAksuVivo({ pregunta: "x" })));
    expect(cae).toEqual([{ t: "error", error: "Demasiados pedidos seguidos o sin saldo: espera un momento." }]);
  });
});

describe("manejarPost con aksu-vivo", () => {
  const ENV = { ANTHROPIC_API_KEY: "k", DEVPREP_IA_CLAVE: "secreta" };
  const pedido = (cuerpo) => new Request("https://x/api/ia", { method: "POST", headers: { "content-type": "application/json", "x-clave": "secreta" }, body: JSON.stringify(cuerpo) });

  it("responde en vivo (NDJSON) con el cliente de Aksu", async () => {
    let opciones = null;
    const r = await manejarPost(pedido({ tarea: "aksu-vivo", pregunta: "hola" }), {
      env: ENV,
      crearCliente: (_rol, o) => ((opciones = o), clienteFalso({ trozos: ["Hola."] })),
    });
    expect(r.headers.get("content-type")).toContain("ndjson");
    expect(opciones).toEqual({ vivo: true });
    expect((await leer(r)).map((e) => e.t)).toEqual(["texto", "fin"]);
  });

  it("sin nada que decir responde 400 sin llamar a la IA", async () => {
    const r = await manejarPost(pedido({ tarea: "aksu-vivo" }), { env: ENV, crearCliente: () => clienteFalso() });
    expect(r.status).toBe(400);
  });
});
