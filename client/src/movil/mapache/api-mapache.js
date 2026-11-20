// Datos del mapache para las pantallas: lee tu progreso de inglés (contadores del día, repasos, unidades)
// y guarda lo suyo (nombre, postales, pregunta del día...) como registros "mapache:..." dentro de
// "inglesExtra", que ya se sincroniza entre tus dispositivos. No crea nada nuevo en AWS.
import { sumarDias } from "../../../../server/progreso-reglas.js";
import { avanceConceptos } from "../leccion/variantes.js";
import { COLECCION_EXTRA } from "../ingles/extra.js";
import { hechaPorExamen } from "../ingles/examen.js";
import { CHARLA, cumpleReto, EXPRESIONES, franjaDe, FRASES_NIVEL, lineaDiario, RETOS } from "./contenido-nivel.js";
import { clavesRobadas, elegir, estadoMapache, hash, nivelIngles, practico, regalosDeNivel, revisarRespuesta } from "./reglas.js";
import { ENTREVISTAS, MINIMO_PALABRAS, POSTALES, PREGUNTAS, ROPA_NIVEL, SUENOS } from "./contenido.js";
import { crearMemoriaFrases, idFrase } from "./sin-repetir.js";
import { almacen as almacenDelNavegador } from "../../lib/visita.js";

const NOMBRE = "Map";
// Antes se llamaba "Mapi": si quedó guardado ese nombre viejo por defecto, cuenta como "sin nombre propio"
const nombreDe = (p) => (!p?.nombre || p.nombre === "Mapi" ? NOMBRE : p.nombre);

// Map trabaja en B1 y B2, que es el nivel real de Angel (lo dijo el 2026-11-19; antes iba en B2 y C1):
// habla en la franja B, la pregunta del día alterna B1 y B2 y las palabras salen de las unidades B1 y B2.
const NIVEL_MAPACHE = "B2";
const NIVELES_MAPACHE = ["B1", "B2"];
/** Nivel de la pregunta del día: un día B1, otro B2. */
const nivelPregunta = (hoy) => NIVELES_MAPACHE[hash(hoy + "pregunta") % 2];

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
export function errorReal(item) {
  if (!Array.isArray(item?.opciones) || item.correcta == null) return null;
  const bien = item.opciones[item.correcta];
  const mal = item.opciones.find((_, i) => i !== item.correcta);
  if (item.clave.startsWith("cal:")) return { clave: item.clave, mal, bien, explicacion: item.explicacion ?? "" };
  if (item.pregunta?.includes("___")) {
    const frase = item.pregunta.split("\n").find((l) => l.includes("___")) ?? item.pregunta;
    // Primero se parte por el hueco y recién después se quita el formato (** y _): si se limpiaba antes,
    // el hueco "___" quedaba en "_" y las dos frases salían iguales, sin la palabra
    const partes = frase.split("___").map((parte) => parte.replace(/\*\*|__|[*_]/g, ""));
    const armar = (palabra) => partes.join(palabra).replace(/\s+/g, " ").trim();
    return { clave: item.clave, mal: armar(mal), bien: armar(bien), explicacion: item.explicacion ?? "" };
  }
  return null;
}

/**
 * @param {{ progreso: object, itemsIngles: () => Promise<{unidades: object[], items: object[]}>, json: (ruta: string) => Promise<any>, extraIngles: () => object, limpiar: () => void, almacen?: Storage }} dep
 *   almacen: dónde recuerda qué frases ya dijo (localStorage; en modo visita, memoria)
 */
export function crearApiMapache({ progreso, itemsIngles, json, extraIngles, limpiar, almacen = almacenDelNavegador }) {
  const memoria = crearMemoriaFrases(almacen);
  const propios = () => {
    const regs = progreso.registros(COLECCION_EXTRA);
    const salida = {};
    for (const [id, r] of Object.entries(regs)) if (id.startsWith("mapache:")) salida[id.slice(8)] = r.v;
    return salida;
  };
  const guardar = (id, v) => progreso.guardarRegistro(COLECCION_EXTRA, `mapache:${id}`, { v });
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
      const estado = estadoMapache({ dias, hoy, hora: new Date().getHours() });
      const nivelMapache = NIVEL_MAPACHE;
      const franja = franjaDe(nivelMapache);
      // Unidades B1 y B2: de ahí salen la palabra del día, Repeat after me y Trash panda
      const altas = new Set(unidades.filter((u) => NIVELES_MAPACHE.includes(u.nivel)).map((u) => u.id));

      // Palabras que ya sabes (para que hable con tu vocabulario)
      const sabidas = items.filter((it) => it.concepto === "palabra" && aprendido(it));
      const unidadActual = progreso.ajuste("ingles", {}).unidad ?? unidades[0]?.id;
      const deActual = items.filter((it) => it.unidad === unidadActual && it.concepto === "palabra");
      const palabra = elegir(sabidas.length ? sabidas : deActual, hoy + estado.estado)?.en ?? "hello";

      // Lo que dice
      // Los repasos pendientes ya no cambian lo que dice ni cómo está: solo se ofrecen en su tarjeta
      const clave = estado.estado;
      const delEstado = FRASES_NIVEL[franja][clave] ?? FRASES_NIVEL[franja].normal;
      // Sin repetir (ver sin-repetir.js): cada frase lleva su grupo y su id; al mostrarla, la pantalla
      // avisa con mapacheVista y no vuelve hasta que salgan las demás de su grupo
      const grupoEstado = `${franja}:${clave}`;
      const frase = memoria.delDia(grupoEstado, hoy, delEstado);
      const rellenar = (t) => t.replaceAll("{w}", palabra).replaceAll("{n}", String(robadas.length));
      const formato = (f) => ({ en: rellenar(f.en), es: rellenar(f.es), expresion: f.expresion ?? null, grupo: f.grupo, id: idFrase(f) });
      const conGrupo = (grupo) => (f) => ({ ...f, grupo });
      // Cada vez que lo tocas dice otra: primero la del día, luego las de su estado alternadas con consejos
      const restoEstado = memoria.ordenar(grupoEstado, delEstado.filter((f) => f !== frase), hoy).map(conGrupo(grupoEstado));
      const charla = ["dormido", "escapado"].includes(clave) ? [] : memoria.ordenar("charla", CHARLA, hoy).map(conGrupo("charla"));
      const frases = frase ? [{ ...frase, grupo: grupoEstado }] : [];
      for (let i = 0; i < Math.max(restoEstado.length, charla.length); i++) {
        if (restoEstado[i]) frases.push(restoEstado[i]);
        if (charla[i]) frases.push(charla[i]);
      }
      const suenos = memoria.ordenar("suenos", SUENOS, hoy).map((s) => ({ ...s, grupo: "suenos", id: idFrase(s) }));
      const sueno = suenos[0] ?? null;

      // Lo que lleva puesto: los regalos de su nivel (mochila, lentes...)
      const equipo = p.equipo ?? Object.fromEntries(regalosDeNivel(nivel).map((id) => [ROPA_NIVEL[id].parte, id]));

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

      // Frases para "Repite conmigo": de las unidades B1 y B2
      const repetir = items
        .filter((it) => it.concepto === "frase" && altas.has(it.unidad))
        .sort((a, b) => (hashSimple(hoy + a.clave) % 997) - (hashSimple(hoy + b.clave) % 997))
        .slice(0, 8)
        .map((f) => ({ en: f.en, es: f.es }));

      // Palabra del día: una de las unidades B1 y B2 (si puede ser, una que todavía no viste)
      const palabrasAltas = items.filter((it) => it.concepto === "palabra" && altas.has(it.unidad));
      const nuevasAltas = palabrasAltas.filter((it) => !registros[it.clave]);
      const nueva = elegir(nuevasAltas.length ? nuevasAltas : palabrasAltas, hoy + "palabra");

      // Trash panda: palabras de las unidades B1 y B2
      const palabrasJuego = datosIngles.unidades.filter((u) => NIVELES_MAPACHE.includes(u.nivel)).flatMap((u) => u.palabras);

      const nivelP = nivelPregunta(hoy);
      const pregunta = elegir(PREGUNTAS[nivelP], hoy);
      const respondida = p[`pregunta:${hoy}`] ?? null;

      return {
        hoy,
        nombre: nombreDe(p),
        nivel,
        ...estado,
        nivelMapache,
        frase: frase ? formato(frase) : null,
        frases: frases.map(formato),
        expresionDelDia: memoria.delDia("expresion", hoy, EXPRESIONES.B),
        sueno,
        suenos,
        robados: robadas.slice(0, 12).map((k) => acertijo(porClave.get(k), palabras)).filter(Boolean),
        totalRobados: robadas.length,
        errores,
        repetir,
        repetidasHoy: p[`repetir:${hoy}`] ?? 0,
        pregunta: { ...pregunta, nivel: nivelP, minimo: MINIMO_PALABRAS[nivelP], respondida, reto: { texto: RETOS[nivelP].texto, ejemplo: RETOS[nivelP].ejemplo } },
        palabraDelDia: nueva ? { en: nueva.en, es: nueva.es, pron: palabras.get(nueva.clave.slice(3))?.pron ?? "", ej: palabras.get(nueva.clave.slice(3))?.ejemplo ?? null } : null,
        diario,
        postales: POSTALES.map((post) => ({ ...post, abierta: true, leida: p[`postal:${post.nivel}`] ?? null })),
        equipo,
        trash: { record: p.trash ?? 0, palabras: palabrasJuego.map((w) => ({ en: w.en, es: w.es, tipo: w.tipo, pasado: w.formas?.pasado ?? null })) },
        entrevistas: ENTREVISTAS,
      };
    },

    /** Lo mínimo para Inicio y Hoy (sin cargar las unidades): cómo está y cuánto te robó. */
    async mapacheResumen() {
      const hoy = progreso.hoy();
      const robadas = clavesRobadas(progreso.datos().items ?? {}, hoy);
      const estado = estadoMapache({ dias: progreso.dias(), hoy, hora: new Date().getHours() });
      return { nombre: nombreDe(propios()), ...estado, robados: robadas.length };
    },

    /** Map ya dijo esta frase: no vuelve hasta que salgan las demás de su grupo (solo en este dispositivo). */
    async mapacheVista(grupo, id) {
      memoria.marcar(grupo, id);
    },

    async mapacheRenombrar(nombre) {
      const limpio = String(nombre ?? "").trim().slice(0, 20);
      guardar("nombre", limpio || NOMBRE);
      limpiar();
    },

    /** La pregunta del día: revisa que sea inglés y del largo de tu nivel; si está bien, lo alimenta. */
    async mapacheResponder(texto) {
      const hoy = progreso.hoy();
      const { items, datosIngles, aprendido } = await contexto();
      const nivel = nivelPregunta(hoy);
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
