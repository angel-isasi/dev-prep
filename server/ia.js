// Evaluación con IA (función de Vercel api/ia.js): la lógica vive aquí para poder probarla sin internet.
//
// Cómo funciona:
// - La API key NUNCA está en el código ni en el navegador: es una variable secreta de Vercel
//   (ANTHROPIC_API_KEY). Sin ella, la función responde "no configurada" y la app lo avisa.
// - Para que nadie más gaste tu saldo, cada pedido trae una contraseña tuya (variable DEVPREP_IA_CLAVE
//   en Vercel; en la app la escribes una vez y queda en tu navegador).
// - Tres tareas: "entrevista" (evalúa tu respuesta contra lo que quiere escuchar el entrevistador),
//   "informe" (el balance de una entrevista completa: simulacro o entrevista por voz) e "ingles"
//   (corrige tu respuesta en inglés del mapache). La IA responde un JSON con forma fija.
// - Cada tarea usa el modelo más barato que la hace bien (ia-precios.js). La variable IA_MODELO de
//   Vercel, si existe, manda sobre todas.
import { createHash, timingSafeEqual } from "node:crypto";
import { MODELOS } from "./ia-precios.js";

/** Topes de lo que se acepta en cada pedido (en caracteres), para no gastar de más. */
export const LIMITES = { respuesta: 6000, pregunta: 1000, modelo: 4000, clave: 500, claves: 12, contexto: 4000, items: 24, respuestaItem: 1500, notas: 1500 };

const NOTAS = ["sabia", "dude", "no"];
const NIVELES = ["A1", "A2", "B1", "B2", "C1", "C2"];
/** Qué tan cerca estás de pasar una entrevista junior de verdad. */
export const NIVELES_INFORME = ["listo", "casi", "falta"];

export const ESQUEMAS = {
  informe: {
    type: "object",
    additionalProperties: false,
    required: ["puntaje", "nivel", "resumen", "fortalezas", "mejoras", "plan"],
    properties: {
      puntaje: { type: "integer", description: "De 0 a 10" },
      nivel: { type: "string", enum: NIVELES_INFORME },
      resumen: { type: "string" },
      fortalezas: { type: "array", items: { type: "string" } },
      mejoras: { type: "array", items: { type: "string" } },
      plan: { type: "array", items: { type: "string" } },
    },
  },
  entrevista: {
    type: "object",
    additionalProperties: false,
    required: ["puntaje", "veredicto", "resumen", "bien", "falta", "mejor", "repregunta"],
    properties: {
      puntaje: { type: "integer", description: "De 0 a 10" },
      veredicto: { type: "string", enum: NOTAS },
      resumen: { type: "string" },
      bien: { type: "array", items: { type: "string" } },
      falta: { type: "array", items: { type: "string" } },
      mejor: { type: "string" },
      repregunta: { type: "string" },
    },
  },
  ingles: {
    type: "object",
    additionalProperties: false,
    required: ["nivel", "puntaje", "correcciones", "version", "comentario"],
    properties: {
      nivel: { type: "string", enum: NIVELES },
      puntaje: { type: "integer", description: "De 0 a 10" },
      correcciones: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["original", "corregido", "explicacion"],
          properties: { original: { type: "string" }, corregido: { type: "string" }, explicacion: { type: "string" } },
        },
      },
      version: { type: "string" },
      comentario: { type: "string" },
    },
  },
};

const ESTILO =
  "Escribe en español de Perú, con tuteo neutro (sin voseo), directo y concreto, sin relleno ni frases motivacionales vacías. No uses rayas largas; usa dos puntos o comas.";

const SISTEMA = {
  informe: `Eres un entrevistador senior de desarrollo frontend que contrata practicantes y juniors en Perú. Acabas de terminar una entrevista de práctica con un estudiante de Ingeniería de Sistemas y le das tu balance, como se lo darías a alguien que quieres que mejore.

Qué recibes: cada pregunta con la etapa, la nota (la tuya si evaluaste la respuesta, o la que se puso él), lo que le faltó y, a veces, su respuesta transcrita. Si no hay transcripción, juzga por las notas y no inventes lo que dijo.

Cómo escribir el balance:
- "puntaje" de 0 a 10 para toda la entrevista. "nivel": "listo" si hoy pasaría una entrevista junior real, "casi" si está cerca y le faltan cosas puntuales, "falta" si todavía no.
- "resumen": dos o tres frases con tu impresión general, sin rodeos.
- "fortalezas": hasta 3, concretas y apoyadas en lo que respondió. "mejoras": hasta 3, las que más pesarían en una entrevista real, cada una con el porqué.
- "plan": de 3 a 5 pasos para los próximos días, cada uno una acción que se puede hacer hoy (qué tema repasar, qué respuesta reescribir, qué practicar en voz alta). Ordénalos por impacto.
- Busca patrones entre respuestas (por ejemplo: no da ejemplos, se va por las ramas, define pero no explica cuándo se usa), no repitas pregunta por pregunta.
${ESTILO}`,
  entrevista: `Eres un entrevistador senior de desarrollo frontend que contrata practicantes y juniors en Perú. Evalúas la respuesta de un estudiante de Ingeniería de Sistemas que practica para su primera entrevista.

Cómo evaluar:
- La lista "lo que el entrevistador quiere escuchar" es la vara principal. La respuesta modelo es solo una referencia: otra respuesta distinta puede ser igual de buena.
- La respuesta puede venir dictada por voz: ignora errores de puntuación o de transcripción y juzga el contenido.
- Sé exigente pero justo, como en una entrevista real para un puesto junior. Si dijo algo incorrecto, dilo claramente.
- "puntaje" de 0 a 10. "veredicto": "sabia" si cubrió lo esencial sin errores, "dude" si le faltó algo importante o fue impreciso, "no" si no respondió lo que se pregunta o se equivocó en lo central.
- "resumen": una o dos frases con tu impresión, como se la dirías al candidato.
- "bien": lo que hizo bien (puede estar vacío). "falta": lo que faltó o estuvo mal, cada punto accionable.
- "mejor": su misma respuesta mejorada, en primera persona y lista para decir en voz alta (unos 30 a 90 segundos hablando). Conserva sus ideas y, si hay datos sobre sus proyectos, úsalos en vez de ejemplos inventados.
- "repregunta": la siguiente pregunta que le harías a partir de lo que dijo, como en una entrevista real.
${ESTILO}`,
  ingles: `Eres un profesor de inglés que prepara a un estudiante peruano para trabajar en inglés como desarrollador. El estudiante respondió por escrito o por voz una pregunta de nivel B2 o C1.

Cómo corregir:
- "correcciones": cada error real de gramática, vocabulario o naturalidad, con el fragmento original, el corregido y una explicación breve en español. No corrijas lo que ya es correcto y natural. Si viene dictado por voz, ignora la puntuación.
- "version": su respuesta reescrita como la diría un hablante con nivel C1, conservando sus ideas.
- "nivel": el nivel CEFR que muestra la respuesta. "puntaje" de 0 a 10 para ese nivel objetivo.
- "comentario": una o dos frases en español con lo más importante que debe mejorar.
${ESTILO}`,
};

const recortar = (texto, max) => String(texto ?? "").trim().slice(0, max);

/**
 * Valida el pedido y arma el mensaje para la IA.
 * @returns {{ error: string } | { tarea: string, sistema: string, mensaje: string, esquema: object }}
 */
export function armarPedido(cuerpo) {
  const tarea = cuerpo?.tarea;
  if (!ESQUEMAS[tarea]) return { error: "Tarea desconocida" };
  if (tarea === "informe") return armarInforme(cuerpo);
  const respuesta = recortar(cuerpo.respuesta, LIMITES.respuesta);
  const pregunta = recortar(cuerpo.pregunta, LIMITES.pregunta);
  if (!pregunta) return { error: "Falta la pregunta" };
  if (respuesta.split(/\s+/).filter(Boolean).length < 3) return { error: "Tu respuesta es muy corta para evaluarla" };

  if (tarea === "entrevista") {
    const claves = (Array.isArray(cuerpo.claves) ? cuerpo.claves : []).slice(0, LIMITES.claves).map((c) => recortar(c, LIMITES.clave)).filter(Boolean);
    const modelo = recortar(cuerpo.modelo, LIMITES.modelo);
    const contexto = recortar(cuerpo.contexto, LIMITES.contexto);
    const enIngles = cuerpo.idioma === "en";
    const partes = [
      `Pregunta${cuerpo.categoria ? ` (${recortar(cuerpo.categoria, 120)})` : ""}:\n${pregunta}`,
      claves.length ? `Lo que el entrevistador quiere escuchar:\n${claves.map((c) => `- ${c}`).join("\n")}` : "",
      modelo ? `Respuesta modelo (solo referencia):\n${modelo}` : "",
      contexto ? `Datos reales del candidato (su pitch y sus proyectos, para personalizar "mejor"):\n${contexto}` : "",
      `Respuesta del candidato${enIngles ? " (respondió en inglés: evalúa también si se entiende bien; escribe \"mejor\" y \"repregunta\" en inglés y lo demás en español)" : ""}:\n${respuesta}`,
    ];
    return { tarea, sistema: SISTEMA.entrevista, mensaje: partes.filter(Boolean).join("\n\n"), esquema: ESQUEMAS.entrevista };
  }

  const nivel = NIVELES.includes(cuerpo.nivel) ? cuerpo.nivel : "B2";
  const mensaje = `Pregunta (nivel ${nivel}):\n${pregunta}\n\nRespuesta del estudiante:\n${respuesta}`;
  return { tarea, sistema: SISTEMA.ingles, mensaje, esquema: ESQUEMAS.ingles };
}

const TEXTO_NOTA = { sabia: "bien", dude: "regular", no: "mal", hecho: "lo resolvió", "no-llegue": "no llegó a resolverlo" };

/** El pedido del balance final: la lista de preguntas con su nota y, si la hay, la respuesta. */
function armarInforme(cuerpo) {
  const items = (Array.isArray(cuerpo.items) ? cuerpo.items : [])
    .slice(0, LIMITES.items)
    .map((i) => ({
      etapa: recortar(i?.etapa, 60),
      pregunta: recortar(i?.pregunta, LIMITES.pregunta),
      nota: TEXTO_NOTA[i?.nota] ?? "",
      puntaje: Number.isFinite(i?.puntaje) ? entre(i.puntaje, 0, 10) : null,
      falta: textos(i?.falta).slice(0, 4).map((f) => recortar(f, 240)),
      respuesta: recortar(i?.respuesta, LIMITES.respuestaItem),
    }))
    .filter((i) => i.pregunta && (i.nota || i.puntaje !== null || i.respuesta));
  if (items.length < 2) return { error: "Hacen falta al menos 2 preguntas respondidas para el informe" };

  const lineas = items.map((i, n) =>
    [
      `${n + 1}. ${i.etapa ? `[${i.etapa}] ` : ""}${i.pregunta}`,
      `   Nota: ${[i.puntaje !== null ? `${i.puntaje}/10` : "", i.nota].filter(Boolean).join(", ") || "sin nota"}`,
      i.falta.length ? `   Le faltó: ${i.falta.join("; ")}` : "",
      i.respuesta ? `   Respondió: ${i.respuesta}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const notas = recortar(cuerpo.notas, LIMITES.notas);
  const contexto = recortar(cuerpo.contexto, LIMITES.contexto);
  const partes = [
    `Entrevista de práctica${cuerpo.idioma === "en" ? " (respondió en inglés)" : ""}${cuerpo.voz ? ", hablada de principio a fin" : ""}:`,
    lineas.join("\n\n"),
    notas ? `Lo que el candidato anotó sobre cómo le fue:\n${notas}` : "",
    contexto ? `Datos reales del candidato (su pitch y sus proyectos):\n${contexto}` : "",
  ];
  return { tarea: "informe", sistema: SISTEMA.informe, mensaje: partes.filter(Boolean).join("\n\n"), esquema: ESQUEMAS.informe };
}

const entre = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n) || 0)));
const textos = (lista) => (Array.isArray(lista) ? lista.map(String).filter(Boolean).slice(0, 8) : []);

/** Limpia lo que devolvió la IA (por si algo viene fuera de rango). */
export function limpiarResultado(tarea, r) {
  if (tarea === "informe") {
    return {
      puntaje: entre(r.puntaje, 0, 10),
      nivel: NIVELES_INFORME.includes(r.nivel) ? r.nivel : "casi",
      resumen: String(r.resumen ?? ""),
      fortalezas: textos(r.fortalezas).slice(0, 3),
      mejoras: textos(r.mejoras).slice(0, 3),
      plan: textos(r.plan).slice(0, 5),
    };
  }
  if (tarea === "entrevista") {
    return {
      puntaje: entre(r.puntaje, 0, 10),
      veredicto: NOTAS.includes(r.veredicto) ? r.veredicto : "dude",
      resumen: String(r.resumen ?? ""),
      bien: textos(r.bien),
      falta: textos(r.falta),
      mejor: String(r.mejor ?? ""),
      repregunta: String(r.repregunta ?? ""),
    };
  }
  return {
    nivel: NIVELES.includes(r.nivel) ? r.nivel : "B1",
    puntaje: entre(r.puntaje, 0, 10),
    correcciones: (Array.isArray(r.correcciones) ? r.correcciones : [])
      .slice(0, 12)
      .map((c) => ({ original: String(c?.original ?? ""), corregido: String(c?.corregido ?? ""), explicacion: String(c?.explicacion ?? "") })),
    version: String(r.version ?? ""),
    comentario: String(r.comentario ?? ""),
  };
}

/** ¿Están puestas las dos variables secretas en Vercel? */
export const configurada = (env) => !!env.ANTHROPIC_API_KEY && !!env.DEVPREP_IA_CLAVE;

/** Compara la contraseña sin filtrar por el tiempo cuántos caracteres acertaste. */
export function claveCorrecta(recibida, esperada) {
  if (!recibida || !esperada) return false;
  const a = createHash("sha256").update(String(recibida)).digest();
  const b = createHash("sha256").update(String(esperada)).digest();
  return timingSafeEqual(a, b);
}

const json = (cuerpo, status = 200) => Response.json(cuerpo, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Atiende un POST: contraseña, validación, llamada a la IA y respuesta limpia.
 * @param {Request} request
 * @param {{ env: object, crearCliente: () => object }} deps  crearCliente: el cliente de la IA (en tests, uno falso)
 */
export async function manejarPost(request, { env, crearCliente }) {
  if (!configurada(env)) return json({ error: "no-configurada" }, 503);
  if (!claveCorrecta(request.headers.get("x-clave"), env.DEVPREP_IA_CLAVE)) return json({ error: "clave" }, 401);

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "El pedido no es JSON" }, 400);
  }
  const pedido = armarPedido(cuerpo);
  if (pedido.error) return json({ error: pedido.error }, 400);

  const modelo = env.IA_MODELO || MODELOS[pedido.tarea];
  // Si el modelo declina por sus filtros de seguridad, el servidor reintenta con otro modelo.
  // El modelo pequeño (haiku) no tiene ese respaldo: ahí no se pide.
  const conRespaldo = !modelo.includes("haiku");
  try {
    const respuesta = await crearCliente().beta.messages.create({
      model: modelo,
      max_tokens: 8000,
      // structured-outputs: el mismo encabezado que pone la librería para respuestas con formato JSON
      betas: [...(conRespaldo ? ["server-side-fallback-2026-07-01"] : []), "structured-outputs-2025-12-15"],
      ...(conRespaldo ? { fallbacks: "default" } : {}),
      output_config: { effort: "medium", format: { type: "json_schema", schema: pedido.esquema } },
      system: pedido.sistema,
      messages: [{ role: "user", content: pedido.mensaje }],
    });
    // El uso viaja también en los errores: un pedido cortado o rechazado igual se cobró y la app lo cuenta
    const uso = { modelo: respuesta.model ?? modelo, entrada: respuesta.usage?.input_tokens ?? 0, salida: respuesta.usage?.output_tokens ?? 0 };
    if (respuesta.stop_reason === "refusal") return json({ error: "La IA no quiso evaluar esta respuesta. Prueba reformulándola.", uso }, 502);
    if (respuesta.stop_reason === "max_tokens") return json({ error: "La evaluación salió incompleta. Inténtalo otra vez.", uso }, 502);
    const texto = respuesta.content.find((b) => b.type === "text")?.text;
    if (!texto) return json({ error: "La IA no devolvió nada", uso }, 502);
    let crudo;
    try {
      crudo = JSON.parse(texto);
    } catch {
      return json({ error: "La IA respondió con un formato que no se pudo leer. Inténtalo otra vez.", uso }, 502);
    }
    return json({ resultado: limpiarResultado(pedido.tarea, crudo), uso });
  } catch (e) {
    const status = e?.status;
    const mensaje =
      status === 401
        ? "La API key de Vercel no es válida"
        : status === 429
          ? "Demasiados pedidos seguidos o sin saldo: espera un momento"
          : status === 400 && /credit|balance/i.test(e?.message ?? "")
            ? "Tu cuenta de la API no tiene saldo"
            : "No se pudo hablar con la IA. Inténtalo otra vez.";
    return json({ error: mensaje }, 502);
  }
}

/** GET: solo dice si la IA está lista (no revela nada más). */
export const manejarGet = (env) => json({ configurada: configurada(env) });
