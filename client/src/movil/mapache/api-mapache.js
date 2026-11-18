// Datos del mapache para las pantallas: lee tu progreso de inglés (contadores del día, repasos, unidades)
// y guarda lo suyo (nombre, compras, postales, pregunta del día...) como registros "mapache:..." dentro de
// "inglesExtra", que ya se sincroniza entre tus dispositivos. No crea nada nuevo en AWS.
import { sumarDias } from "../../../../server/progreso-reglas.js";
import { avanceConceptos } from "../leccion/variantes.js";
import { COLECCION_EXTRA } from "../ingles/extra.js";
import { hechaPorExamen } from "../ingles/examen.js";
import { cumpleReto, EXPRESIONES, franjaDe, FRASES_NIVEL, lineaDiario, RETOS } from "./contenido-nivel.js";
import { CASAS, clavesRobadas, elegir, estadoMapache, hash, NIVELES, nivelIngles, practico, regalosDeNivel, revisarRespuesta, xpDisponible } from "./reglas.js";
import { ENTREVISTAS, MINIMO_PALABRAS, MUEBLES_GANADOS, POSTALES, PREGUNTAS, ROPA_NIVEL, SUENOS, TIENDA, TROFEO } from "./contenido.js";

const NOMBRE = "Mapi";
const ETAPAS = [
  ["basico", "Básico"],
  ["intermedio", "Intermedio"],
  ["trabajo", "Inglés para el trabajo"],
  ["avanzado", "Avanzado (B2)"],
  ["superior", "Superior (C1)"],
  ["dominio", "Dominio (C2)"],
];

/** Hueco: cambia la palabra por ___ en el ejemplo (si aparece tal cual). */
function conHueco(texto, palabra) {
  const i = texto.toLowerCase().indexOf(palabra.toLowerCase());
  return i < 0 ? null : texto.slice(0, i) + "___" + texto.slice(i + palabra.length);
}

/**
 * Lo que te robó convertido en acertijo: un ejemplo en inglés con un hueco y opciones.
 * Los ítems llegan ya expandidos (con sus variantes); el ejemplo de cada palabra sale de la unidad.
 * @param {object} item  ítem expandido
 * @param {Map<string, object>} palabras  id de palabra -> palabra de la unidad (en, es, pron, ejemplo)
 */
function acertijo(item, palabras) {
  if (!item) return null;
  if (item.concepto === "palabra") {
    const inversa = item.variantes?.find((v) => v.forma === "inversa");
    if (!inversa) return null;
    const w = palabras.get(item.clave.slice(3));
    const pista = w?.ejemplo?.en ? conHueco(w.ejemplo.en, item.en) : null;
    return {
      clave: item.clave,
      tipo: "palabra",
      pista: pista ?? `It means "${item.es}" in Spanish.`,
      ayuda: pista ? w.ejemplo.es : null,
      opciones: inversa.opciones,
      correcta: inversa.correcta,
      en: item.en,
      es: item.es,
    };
  }
  if (item.concepto === "frase") {
    const hueco = item.variantes?.find((v) => v.forma === "hueco");
    if (!hueco) return null;
    const frase = hueco.pregunta.match(/\*\*(.+?)\*\*/)?.[1] ?? hueco.pregunta.split("\n").pop();
    return { clave: item.clave, tipo: "frase", pista: frase, ayuda: hueco.pista ?? item.es, opciones: hueco.opciones, correcta: hueco.correcta, en: item.en, es: item.es };
  }
  return null;
}

/** Un error real tuyo (calco o gramática que fallaste la última vez): lo que no y lo que sí. */
function errorReal(item) {
  if (!Array.isArray(item?.opciones) || item.correcta == null) return null;
  const bien = item.opciones[item.correcta];
  const mal = item.opciones.find((_, i) => i !== item.correcta);
  if (item.clave.startsWith("cal:")) return { clave: item.clave, mal, bien, explicacion: item.explicacion ?? "" };
  if (item.pregunta?.includes("___")) {
    const frase = item.pregunta.split("\n").find((l) => l.includes("___")) ?? item.pregunta;
    const limpia = frase.replace(/[*_]{1,2}(?!_)/g, "").trim();
    return { clave: item.clave, mal: limpia.replace("___", mal), bien: limpia.replace("___", bien), explicacion: item.explicacion ?? "" };
  }
  return null;
}

/**
 * @param {{ progreso: object, itemsIngles: () => Promise<{unidades: object[], items: object[]}>, json: (ruta: string) => Promise<any>, extraIngles: () => object, limpiar: () => void }} dep
 */
export function crearApiMapache({ progreso, itemsIngles, json, extraIngles, limpiar }) {
  const propios = () => {
    const regs = progreso.registros(COLECCION_EXTRA);
    const salida = {};
    for (const [id, r] of Object.entries(regs)) if (id.startsWith("mapache:")) salida[id.slice(8)] = r.v;
    return salida;
  };
  const guardar = (id, v) => progreso.guardarRegistro(COLECCION_EXTRA, `mapache:${id}`, { v });
  const compras = (p) =>
    Object.keys(p)
      .filter((k) => k.startsWith("compra:"))
      .map((k) => k.slice(7));

  /** Cálculos comunes: unidades completas, nivel, palabras que sabes. */
  async function contexto() {
    const [{ unidades, items }, datosIngles] = await Promise.all([itemsIngles(), json("ingles.json")]);
    const registros = progreso.datos().items ?? {};
    const extra = extraIngles();
    const orden = unidades.map((u) => u.id);
    const avance = new Map(unidades.map((u) => [u.id, avanceConceptos(items, registros, u.id)]));
    const completa = (id) => !!avance.get(id)?.completa || hechaPorExamen(extra.examen, orden, id);
    const nivel = nivelIngles({ examen: extra.examen, unidades, completa });
    const aprendido = (it) => {
      const r = registros[it.clave];
      return !!r && ((r.caja ?? 0) >= 2 || ((r.caja ?? 0) === 1 && r.ultima !== "no"));
    };
    return { unidades, items, datosIngles, registros, extra, avance, completa, nivel, aprendido };
  }

  return {
    /** Todo lo de la casa del mapache. */
    async mapache() {
      const hoy = progreso.hoy();
      const dias = progreso.dias();
      const p = propios();
      const { unidades, items, datosIngles, registros, avance, completa, nivel, aprendido } = await contexto();
      const porClave = new Map(items.map((it) => [it.clave, it]));
      const palabras = new Map(datosIngles.unidades.flatMap((u) => u.palabras.map((w) => [w.id, w])));
      const robadas = clavesRobadas(registros, hoy);
      const estado = estadoMapache({ dias, hoy, hora: new Date().getHours(), robados: robadas.length });
      // Te habla un nivel por encima del tuyo (si eres C2, en C2)
      const nivelMapache = NIVELES[Math.min(NIVELES.length - 1, NIVELES.indexOf(nivel) + 1)];
      const franja = franjaDe(nivelMapache);

      // Palabras que ya sabes (para que hable con tu vocabulario)
      const sabidas = items.filter((it) => it.concepto === "palabra" && aprendido(it));
      const unidadActual = progreso.ajuste("ingles", {}).unidad ?? unidades[0]?.id;
      const deActual = items.filter((it) => it.unidad === unidadActual && it.concepto === "palabra");
      const palabra = elegir(sabidas.length ? sabidas : deActual, hoy + estado.estado)?.en ?? "hello";

      // Lo que dice
      const clave = robadas.length >= 3 && estado.estado !== "escapado" && estado.estado !== "dormido" && estado.estado !== "feliz" ? "robos" : estado.estado;
      const frase = elegir(FRASES_NIVEL[franja][clave] ?? FRASES_NIVEL[franja].normal, hoy + clave + palabra);
      const rellenar = (t) => t.replaceAll("{w}", palabra).replaceAll("{n}", String(robadas.length));

      // Ropa: lo comprado y los regalos de nivel; lo que tiene puesto
      const compradas = compras(p);
      const ropa = [
        ...regalosDeNivel(nivel).map((id) => ({ ...ROPA_NIVEL[id], regalo: true })),
        ...TIENDA.filter((t) => t.tipo === "ropa" && compradas.includes(t.id)),
      ];
      const equipo = p.equipo ?? Object.fromEntries(regalosDeNivel(nivel).map((id) => [ROPA_NIVEL[id].parte, id]));

      // Casa: un mueble por unidad completa, lo comprado y un trofeo por etapa terminada
      const completas = unidades.filter((u) => completa(u.id));
      const album = ETAPAS.map(([id, titulo]) => {
        const deEtapa = unidades.filter((u) => u.etapa === id);
        const stickers = deEtapa.map((u) => ({ id: u.id, titulo: u.titulo, nivel: u.nivel, orden: u.orden, tiene: completa(u.id), porcentaje: Math.round((avance.get(u.id)?.porcentaje ?? 0) * 100) }));
        return { id, titulo, stickers, completa: stickers.length > 0 && stickers.every((s) => s.tiene) };
      }).filter((pagina) => pagina.stickers.length);
      const trofeos = album.filter((a) => a.completa).length;
      const muebles = [
        ...MUEBLES_GANADOS.slice(0, Math.min(MUEBLES_GANADOS.length, completas.length)).map((m) => ({ ...m, ganado: true })),
        ...TIENDA.filter((t) => t.tipo === "mueble" && compradas.includes(t.id)),
        ...(trofeos ? [{ ...TROFEO, cantidad: trofeos }] : []),
      ];

      // Diario: los días con inglés de las últimas 2 semanas (si no hubo ninguno, solo hoy)
      const conIngles = Array.from({ length: 14 }, (_, i) => sumarDias(hoy, -i)).filter((fecha, i) => i === 0 || practico(dias[fecha]));
      const diario = conIngles.slice(0, 7).map((fecha) => {
        const d = dias[fecha] ?? {};
        return {
          fecha,
          ...lineaDiario({
            minutos: Math.round((d.inglesSegundos ?? 0) / 60 + (d.inmersion ?? 0)),
            palabras: d.inglesNuevos ?? 0,
            lecciones: d.ingles ?? 0,
            historias: d.inglesHistorias ?? 0,
            franja,
            semilla: hash(fecha),
          }),
        };
      });

      // Tus errores reales: calcos y gramática que fallaste la última vez
      const errores = Object.entries(registros)
        .filter(([k, r]) => /^(cal|gra):/.test(k) && r?.ultima === "no")
        .sort((a, b) => String(b[1].en ?? "").localeCompare(String(a[1].en ?? "")))
        .map(([k]) => errorReal(porClave.get(k)))
        .filter(Boolean)
        .slice(0, 5);

      // Frases para "Repeat after me": las que ya aprendiste o, si no, las de tu unidad
      const frasesSabidas = items.filter((it) => it.concepto === "frase" && aprendido(it));
      const fuente = frasesSabidas.length >= 5 ? frasesSabidas : items.filter((it) => it.concepto === "frase" && (it.unidad === unidadActual || aprendido(it)));
      const repetir = [...fuente]
        .sort((a, b) => (hashSimple(hoy + a.clave) % 997) - (hashSimple(hoy + b.clave) % 997))
        .slice(0, 8)
        .map((f) => ({ en: f.en, es: f.es }));

      // Palabra del día: una de tu unidad actual que todavía no viste
      const nueva = deActual.find((it) => !registros[it.clave]) ?? elegir(deActual, hoy);

      // Trash panda: palabras de las unidades que empezaste (o de las primeras)
      const empezadas = new Set(Object.keys(registros).map((k) => porClave.get(k)?.unidad).filter(Boolean));
      const fuenteJuego = datosIngles.unidades.filter((u) => empezadas.has(u.id));
      const palabrasJuego = (fuenteJuego.length >= 2 ? fuenteJuego : datosIngles.unidades.slice(0, 6)).flatMap((u) => u.palabras);

      const nivelI = NIVELES.indexOf(nivel);
      const entrevista = [...Object.entries(ENTREVISTAS)].reverse().find(([n]) => NIVELES.indexOf(n) <= nivelI)?.[1] ?? null;
      const pregunta = elegir(PREGUNTAS[nivel], hoy);
      const respondida = p[`pregunta:${hoy}`] ?? null;

      return {
        hoy,
        nombre: p.nombre || NOMBRE,
        nivel,
        ...estado,
        nivelMapache,
        frase: frase ? { en: rellenar(frase.en), es: rellenar(frase.es), expresion: frase.expresion ?? null } : null,
        expresionDelDia: elegir(EXPRESIONES[franja], hoy + "expresion"),
        sueno: elegir(SUENOS, hoy + "sueno"),
        casa: CASAS[nivel],
        robados: robadas.slice(0, 12).map((k) => acertijo(porClave.get(k), palabras)).filter(Boolean),
        totalRobados: robadas.length,
        errores,
        repetir,
        repetidasHoy: p[`repetir:${hoy}`] ?? 0,
        pregunta: { ...pregunta, minimo: MINIMO_PALABRAS[nivel], respondida, reto: { texto: RETOS[nivel].texto, ejemplo: RETOS[nivel].ejemplo } },
        palabraDelDia: nueva ? { en: nueva.en, es: nueva.es, pron: palabras.get(nueva.clave.slice(3))?.pron ?? "", ej: palabras.get(nueva.clave.slice(3))?.ejemplo ?? null } : null,
        diario,
        postales: POSTALES.map((post) => ({ ...post, abierta: NIVELES.indexOf(post.nivel) <= nivelI, leida: p[`postal:${post.nivel}`] ?? null })),
        album,
        muebles,
        ropa,
        equipo,
        tienda: TIENDA.map((t) => ({ ...t, comprado: compradas.includes(t.id) })),
        xp: xpDisponible(dias, compradas, TIENDA),
        trash: { record: p.trash ?? 0, palabras: palabrasJuego.map((w) => ({ en: w.en, es: w.es, tipo: w.tipo, pasado: w.formas?.pasado ?? null })) },
        entrevista,
        unidadesCompletas: completas.length,
      };
    },

    /** Lo mínimo para Inicio y Hoy (sin cargar las unidades): cómo está y cuánto te robó. */
    async mapacheResumen() {
      const hoy = progreso.hoy();
      const robadas = clavesRobadas(progreso.datos().items ?? {}, hoy);
      const estado = estadoMapache({ dias: progreso.dias(), hoy, hora: new Date().getHours(), robados: robadas.length });
      return { nombre: propios().nombre || NOMBRE, ...estado, robados: robadas.length };
    },

    async mapacheRenombrar(nombre) {
      const limpio = String(nombre ?? "").trim().slice(0, 20);
      guardar("nombre", limpio || NOMBRE);
      limpiar();
    },

    /** La pregunta del día: revisa que sea inglés y del largo de tu nivel; si está bien, lo alimenta. */
    async mapacheResponder(texto) {
      const hoy = progreso.hoy();
      const { items, datosIngles, nivel, aprendido } = await contexto();
      const palabrasDe = (t) => String(t ?? "").toLowerCase().match(/[a-z']+/g) ?? [];
      const vocabulario = new Set([
        ...datosIngles.unidades.flatMap((u) => u.palabras.flatMap((w) => palabrasDe(w.en))),
        ...items.filter((it) => it.concepto === "frase").flatMap((it) => palabrasDe(it.en)),
      ]);
      const tuyas = new Set(items.filter((it) => it.concepto === "palabra" && aprendido(it)).flatMap((it) => palabrasDe(it.en)).filter((w) => w.length > 3));
      const r = revisarRespuesta(texto, { minimo: MINIMO_PALABRAS[nivel], vocabulario, tuyas });
      const ya = propios()[`pregunta:${hoy}`];
      // Reto de gramática del nivel: si lo usaste, XP extra (es un extra, no obliga)
      const reto = r.ok && cumpleReto(nivel, texto);
      const xp = r.ok && !ya ? 10 + (reto ? 5 : 0) : 0;
      if (r.ok && !ya) {
        guardar(`pregunta:${hoy}`, { texto: String(texto).slice(0, 600), reto });
        progreso.sumarContadores({ mapache: reto ? 8 : 6, inglesSegundos: 90 });
        progreso.sumarXp(xp);
        limpiar();
      }
      return { ...r, reto, xp };
    },

    /** "Repeat after me": cada frase bien dicha lo alimenta y cuenta para la misión de hablar. */
    async mapacheRepetido(bien) {
      if (!bien) return;
      const hoy = progreso.hoy();
      guardar(`repetir:${hoy}`, (propios()[`repetir:${hoy}`] ?? 0) + 1);
      progreso.sumarContadores({ mapache: 2, inglesHablar: 1, inglesAciertos: 1, inglesSegundos: 15 });
      limpiar();
    },

    /** Recuperar algo robado es un repaso de verdad: agenda la palabra como en una lección. */
    async mapacheRecuperar(clave, acierto) {
      progreso.calificarItem(clave, acierto ? "sabia" : "no");
      progreso.sumarContadores(acierto ? { mapache: 2, inglesAciertos: 1, inglesSegundos: 10 } : { inglesSegundos: 10 });
      limpiar();
    },

    async mapacheComprar(id) {
      const item = TIENDA.find((t) => t.id === id);
      const p = propios();
      const compradas = compras(p);
      if (!item || compradas.includes(id)) return { ok: false };
      if (xpDisponible(progreso.dias(), compradas, TIENDA) < item.precio) return { ok: false, falta: true };
      guardar(`compra:${id}`, progreso.hoy());
      if (item.tipo === "ropa") guardar("equipo", { ...(p.equipo ?? {}), [item.parte]: id });
      limpiar();
      return { ok: true };
    },

    /** Ponerle o quitarle una prenda (null la quita). */
    async mapacheEquipar(parte, id) {
      const p = propios();
      const actual = p.equipo ?? {};
      guardar("equipo", { ...actual, [parte]: id });
      limpiar();
    },

    async mapacheLeerPostal(nivel, aciertos) {
      const p = propios();
      const primera = !p[`postal:${nivel}`];
      guardar(`postal:${nivel}`, { fecha: progreso.hoy(), aciertos });
      if (primera) {
        progreso.sumarContadores({ mapache: 4, inglesAciertos: aciertos, inglesSegundos: 120 });
        progreso.sumarXp(15);
      }
      limpiar();
      return { xp: primera ? 15 : 0 };
    },

    /** Trash panda terminado: récord, XP (hasta 20) y comida. */
    async mapacheTrash(puntos, segundos = 60) {
      const p = propios();
      const record = Math.max(p.trash ?? 0, puntos);
      guardar("trash", record);
      const xp = Math.min(20, puntos);
      progreso.sumarContadores({ mapache: Math.min(10, Math.floor(puntos / 2)), inglesAciertos: puntos, inglesSegundos: Math.round(Math.max(0, Math.min(segundos, 90))) });
      if (xp) progreso.sumarXp(xp);
      limpiar();
      return { record, nuevoRecord: puntos > (p.trash ?? 0), xp };
    },
  };
}

function hashSimple(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}
