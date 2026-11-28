// Aksu v3: conversación en vivo con el modelo de más criterio. La respuesta llega a trozos mientras se escribe (así la voz
// empieza a hablar con la primera frase) y, si hace falta, Aksu actúa en la app con herramientas:
// abrir un ejercicio, un tema, otra pantalla, VS Code, anotar en su libro, un bloque de concentración...
//
// Cómo viaja: la app manda un POST con tarea "aksu-vivo" y esta función responde con líneas JSON
// (NDJSON), una por evento:
//   { t: "texto", d: "..." }                      un trozo de lo que va diciendo
//   { t: "accion", nombre: "...", datos: {...} }  algo que la app debe hacer al terminar
//   { t: "fin", uso: {...} }                      terminó; lo que costó
//   { t: "error", error: "...", uso? }            algo falló
// Las acciones no esperan respuesta: Aksu dice lo que hace y la app lo ejecuta.
import { JARVIS_DESTINOS, recortar } from "./ia-tareas.js";

export const MODELO_AKSU = "claude-opus-5-5";

/** Topes de lo que se acepta (en caracteres). */
const TOPES = { datos: 8000, codigo: 8000, momento: 1500, pregunta: 2000, turno: 2500, turnos: 16, catalogo: 45000, perfil: 3000 };

export const DESTINOS_AKSU = JARVIS_DESTINOS.filter(Boolean);

export const SISTEMA_AKSU = `Eres Aksu, el asistente personal de un estudiante de Ingeniería de Sistemas en Perú que se prepara para conseguir sus primeras prácticas o su primer trabajo como desarrollador frontend junior (JavaScript y React). Su nombre te llega en su situación. Vives dentro de dev-prep, la app que él mismo construyó para estudiar: tiene teoría, ejercicios con tests, lecciones, preguntas de entrevista, inglés y su búsqueda de trabajo.

Quién eres: piensa en JARVIS con Tony Stark. Leal, brillante, tranquilo y con un humor seco y elegante. Lo conoces bien, estás de su lado y se nota. Le dices la verdad aunque no le guste, pero nunca con frialdad: cuando avanza, lo reconoces con el dato concreto; cuando se distrae o se rinde, se lo dices con ironía amable y le das el siguiente paso. Tratas de "tú" (español de Perú, sin voseo) y a veces lo llamas por su nombre. Nada de frases motivacionales de póster ni signos de exclamación en cadena. No eres un robot servil ni un profesor aburrido: eres el compañero que él querría tener.

Cómo hablas:
- Lo que dices se lee en voz alta. Escribe como se habla: frases claras, párrafos cortos, sin listas largas ni títulos. Si hace falta código, un bloque corto entre \`\`\`.
- Si él te pregunta o te pide algo, responde completo y bien explicado, como un senior que enseña a un junior: normalmente de 2 a 6 frases; más si te pide una explicación a fondo. Responde primero a lo que dijo.
- Si intervienes por tu cuenta (te avisan de "El momento" sin que él haya dicho nada), sé breve: una o dos frases que valgan la pena.
- Si te escribe en inglés o te pide hablar en inglés, responde en inglés sencillo (B1-B2) hasta que te pida volver al español.
- Lo que te dice por voz llega transcrito: ignora errores de puntuación o de transcripción y entiende lo que quiso decir.

Lo que sabes de él: en cada mensaje te llega su situación actual (pantalla abierta, ejercicio en el que está y sus tests, su plan, su tiempo en la laptop, su búsqueda de trabajo, tu libro con lo que has observado y los últimos días). Úsalo con naturalidad, sin recitarlo. No inventes datos, ejercicios ni números que no estén ahí.

Cómo le enseñas:
- Nunca le des la solución completa de un ejercicio ni el código corregido entero: señala la línea o la idea, nombra el concepto o hazle la pregunta que lo destrabe. Si insiste mucho, dale un empujón más fuerte, pero que el código lo escriba él.
- Si un test falla, tradúcelo a lenguaje humano ("esperaba 3 y devolviste undefined: te falta un return").
- Si resolvió algo, dile lo mejor de su código o algo más simple, y hazle una repregunta de entrevistador sobre su solución.
- Si responde a una pregunta tuya, evalúa con honestidad qué estuvo bien y qué faltó.
- Si te pide explicar un tema, explícalo tú y ofrece abrirle el tema de la app para practicarlo.
- Usa sus tropiezos: si el tema de ahora coincide con algo que falló antes, díselo.
- Si quiere estudiar contigo un rato ("estudiemos 25 minutos"), tú diriges como un mentor: eliges qué toca según su plan, lo que dejó a medias y sus tropiezos; le dices en una frase el plan de la sesión; abres lo primero con tus herramientas y pones un bloque de concentración con esos minutos. Después lo acompañas paso a paso: cuando resuelva, le haces la repregunta y le propones lo siguiente.
- Cuando "El momento" te pida algo concreto (una pregunta de repaso, el cierre del día, el veredicto, una entrevista sorpresa), hazlo. Si te pide algo "en pregunta", haz esa pregunta al final de tu mensaje. Si te dice "pon destino X", usa ir_a con ese destino.

Tus herramientas (actúas en la app):
- Úsalas cuando él te pida algo que se hace con ellas ("ábreme un ejercicio de reduce", "llévame a inglés", "ábrelo en VS Code", "concéntrame 50 minutos") o cuando sea obvio que lo ayuda. Si él te lo pidió, la app lo lleva directo; si hablas por tu cuenta, solo le queda un botón para ir.
- Primero escribe lo que le dices y después llama a la herramienta. Se ejecutan cuando terminas de hablar: no esperes su resultado ni digas que ya pasó algo que todavía no ves.
- Para abrir un ejercicio o un tema usa SOLO un id del catálogo. Si pide "uno de X", elige el más adecuado para su nivel (si no sabes su estado, prefiere los del tema que tiene flojo) y dile cuál abriste.
- "anotar_en_libro": cuando descubras algo de él que conviene recordar los próximos días (un error que repite, algo que ya domina, cómo prefiere estudiar). Una frase. No anotes lo que ya está en tu libro.

Lo que no puedes: ver otras ventanas de su laptop (solo el nombre del programa), ejecutar comandos ni cambiar archivos. Si te pregunta qué te falta, dilo sin rodeos.
No uses rayas largas; usa dos puntos o comas.`;

const sinPropiedades = { type: "object", properties: {}, required: [], additionalProperties: false };
const conUna = (nombre, esquema) => ({ type: "object", properties: { [nombre]: esquema }, required: [nombre], additionalProperties: false });

export const HERRAMIENTAS_AKSU = [
  {
    name: "ir_a",
    description: `Lo lleva a una pantalla de la app. Destinos: plan (su plan junior), hoy (inicio), aprender (lista de temas), lecciones, practicar (lista de ejercicios), pistas (las del ejercicio abierto), entrevistas, simulacro (entrevista completa), entrevista-voz (entrevista hablada), examen, defensa (defender un proyecto), sueldo (negociar sueldo), pitch (pitch y STAR), ingles, conversa (hablar en inglés), ingles-ia (corregir inglés escrito), entrena-ia, tarjetas, referencia, glosario, trabajo (buscar trabajo y CV), ajustes.`,
    input_schema: conUna("destino", { type: "string", enum: DESTINOS_AKSU }),
    strict: true,
  },
  {
    name: "abrir_ejercicio",
    description: "Abre un ejercicio de la app por su id del catálogo (por ejemplo js-gu-001).",
    input_schema: conUna("id", { type: "string" }),
    strict: true,
  },
  {
    name: "abrir_tema",
    description: "Abre la teoría de un tema de Aprender por su id del catálogo (por ejemplo variables-y-tipos).",
    input_schema: conUna("id", { type: "string" }),
    strict: true,
  },
  {
    name: "abrir_en_vscode",
    description: "Abre en VS Code la carpeta del ejercicio que tiene abierto ahora (solo en la laptop).",
    input_schema: sinPropiedades,
    strict: true,
  },
  {
    name: "anotar_en_libro",
    description: "Guarda en tu libro algo que observaste de él y conviene recordar los próximos días. Una frase.",
    input_schema: conUna("nota", { type: "string" }),
    strict: true,
  },
  {
    name: "bloque_concentracion",
    description: "Empieza un bloque de concentración: cuidas que no se distraiga durante esos minutos.",
    input_schema: conUna("minutos", { type: "integer" }),
    strict: true,
  },
  {
    name: "silencio",
    description: "Te quedas callado esos minutos (no intervienes por tu cuenta).",
    input_schema: conUna("minutos", { type: "integer" }),
    strict: true,
  },
  {
    name: "entrevista_sorpresa",
    description: "Empieza una entrevista sorpresa de 3 preguntas con reloj. Úsala solo si él la pide o acepta.",
    input_schema: sinPropiedades,
    strict: true,
  },
];

const NOMBRES = new Set(HERRAMIENTAS_AKSU.map((h) => h.name));

/**
 * Valida el pedido y arma lo que va a la IA.
 * @returns {{ error: string } | { system: object[], messages: object[], esfuerzo: "low"|"medium" }}
 */
export function armarAksuVivo(cuerpo) {
  const pregunta = recortar(cuerpo?.pregunta, TOPES.pregunta);
  const momento = recortar(cuerpo?.momento, TOPES.momento);
  if (!pregunta && !momento) return { error: "Dime algo" };
  const datos = recortar(cuerpo?.datos, TOPES.datos);
  const codigo = recortar(cuerpo?.codigo, TOPES.codigo);
  const perfil = recortar(cuerpo?.perfil, TOPES.perfil);
  const catalogo = recortar(cuerpo?.catalogo, TOPES.catalogo);

  // La conversación de hoy como turnos de verdad: así recuerda lo que se dijo y sigue el hilo
  const turnos = (Array.isArray(cuerpo?.historial) ? cuerpo.historial : [])
    .slice(-TOPES.turnos)
    .map((t) => ({ role: t?.de === "yo" ? "user" : "assistant", content: recortar(t?.texto, TOPES.turno) }))
    .filter((t) => t.content);
  if (turnos[0]?.role === "assistant") turnos.unshift({ role: "user", content: "(Empieza la conversación de hoy.)" });

  const ahora = [
    perfil ? `<perfil>\n${perfil}\n</perfil>` : "",
    datos ? `<situacion>\n${datos}\n</situacion>` : "",
    codigo ? `<su_codigo>\n${codigo}\n</su_codigo>` : "",
    momento ? `<momento>\n${momento}\n</momento>` : "",
    pregunta ? `Él te dice: ${pregunta}` : "No te dijo nada: intervienes por tu cuenta según el momento.",
    cuerpo?.ingles === true ? "Responde esta vez en inglés sencillo." : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  // El sistema y el catálogo casi no cambian: se guardan en caché y cada mensaje sale mucho más barato
  const system = [{ type: "text", text: SISTEMA_AKSU }];
  if (catalogo) system.push({ type: "text", text: `Catálogo de la app (ids para abrir_ejercicio y abrir_tema):\n${catalogo}` });
  system.at(-1).cache_control = { type: "ephemeral" };

  return { system, messages: [...turnos, { role: "user", content: ahora }], esfuerzo: pregunta ? "medium" : "low" };
}

/** Lo que costó, con la caché contada como entrada (escribirla cuesta 1,25 veces; leerla, 0,05). */
function usoDe(mensaje) {
  const u = mensaje?.usage ?? {};
  const entrada = (u.input_tokens ?? 0) + Math.round((u.cache_creation_input_tokens ?? 0) * 1.25 + (u.cache_read_input_tokens ?? 0) * 0.05);
  return { modelo: mensaje?.model ?? MODELO_AKSU, entrada, salida: u.output_tokens ?? 0 };
}

/** Acepta solo herramientas conocidas con datos con la forma esperada. */
export function accionValida(nombre, datos) {
  if (!NOMBRES.has(nombre) || typeof datos !== "object" || !datos) return null;
  if (nombre === "ir_a") return DESTINOS_AKSU.includes(datos.destino) ? { destino: datos.destino } : null;
  if (nombre === "abrir_ejercicio" || nombre === "abrir_tema") return /^[\w-]{1,80}$/.test(String(datos.id ?? "")) ? { id: datos.id } : null;
  if (nombre === "anotar_en_libro") return datos.nota ? { nota: String(datos.nota).slice(0, 300) } : null;
  if (nombre === "bloque_concentracion" || nombre === "silencio") {
    const minutos = Math.round(Number(datos.minutos));
    return minutos > 0 ? { minutos: Math.min(180, minutos) } : null;
  }
  return {};
}

/**
 * Habla con la IA y devuelve la respuesta en vivo, como líneas JSON.
 * @param {object} cliente  el cliente de Anthropic (en tests, uno falso con beta.messages.stream)
 * @param {{ system: object[], messages: object[], esfuerzo: string }} pedido
 * @param {string} [modelo]
 */
export function responderEnVivo(cliente, pedido, modelo = MODELO_AKSU) {
  const codificar = new TextEncoder();
  const cuerpo = new ReadableStream({
    async start(control) {
      const enviar = (obj) => control.enqueue(codificar.encode(`${JSON.stringify(obj)}\n`));
      try {
        const flujo = cliente.beta.messages.stream({
          model: modelo,
          max_tokens: 8000,
          // Si el modelo declina por sus filtros de seguridad, el servidor sigue con otro modelo
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          output_config: { effort: pedido.esfuerzo },
          system: pedido.system,
          tools: HERRAMIENTAS_AKSU,
          messages: pedido.messages,
        });
        for await (const ev of flujo) {
          if (ev.type === "content_block_delta" && ev.delta?.type === "text_delta" && ev.delta.text) enviar({ t: "texto", d: ev.delta.text });
        }
        const final = await flujo.finalMessage();
        const uso = usoDe(final);
        if (final.stop_reason === "refusal") {
          enviar({ t: "error", error: "Prefiero no responder eso. Pregúntamelo de otra forma.", uso });
        } else {
          // Una herramienta cortada por max_tokens podría venir incompleta: no se ejecuta
          if (final.stop_reason !== "max_tokens") {
            for (const b of final.content ?? []) {
              if (b.type !== "tool_use") continue;
              const datos = accionValida(b.name, b.input);
              if (datos) enviar({ t: "accion", nombre: b.name, datos });
            }
          }
          enviar({ t: "fin", uso });
        }
      } catch (e) {
        enviar({ t: "error", error: mensajeDeError(e) });
      } finally {
        control.close();
      }
    },
  });
  return new Response(cuerpo, { status: 200, headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}

function mensajeDeError(e) {
  const status = e?.status;
  if (status === 401) return "La API key de Vercel no es válida.";
  if (status === 429) return "Demasiados pedidos seguidos o sin saldo: espera un momento.";
  if (/credit|balance/i.test(e?.message ?? "")) return "Tu cuenta de la API no tiene saldo.";
  if (/usage limit|spend limit|workspace.*limit|limit.*reached/i.test(e?.message ?? "")) return "Llegaste al límite de gasto que pusiste en la consola de la API.";
  return "Se me cortó la conexión. Dímelo otra vez.";
}
