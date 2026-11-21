// Aksu en pantalla: la figura que se mueve por la app, su panel de conversación y el "observador"
// que mira lo que haces (pantalla abierta, tests al guardar, tiempo, programa de la laptop) y decide
// con reglas.js cuándo hablar.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";
import { api } from "../lib/api.js";
import { guardarTopeIa } from "../lib/ia.js";
import { dictar, microDisponible, nombreVozGrave, useHayVoz, vocesEnEspanol } from "../lib/voz.js";
import { useEvento } from "../hooks/useEvento.js";
import { IconoFlechaDer, IconoMicrofono } from "../components/Iconos.jsx";
import {
  actividad, anotarGuardada, anotarResuelto, bloqueActivo, BLOQUE_MIN, encajar, enSilencio, esDePaso, estaTrabado, FIGURA, juntoA, marcar, marcarFrenado, marcarHecho, marcarPausa,
  marcarPregunta, marcarTrabado, masLejana, NIVELES, NOMBRE_NIVEL, paradas, pasoElTiempo, puede, recibimiento, restanteBloque, SEGUNDOS_RESPUESTA, sesionNueva, sigueAhi, siguienteParada,
  TEXTOS, tocaCierre, tocaComentario, tocaDistraccion, tocaEntrevista, tocaInforme, tocaPausa, tocaPregunta, tocaRelampago, tocaSorpresa, vaCorriendo, yaHizo,
} from "./reglas.js";
import {
  abrir, cambiar, cargarVocesLocales, cerrar, cerrarDia, decirle, LOCAL, duracion, escuchar, gasto, hablar, hayIa, iniciarBloque, iniciarEntrevista, instalarVozWeb, NOMBRE, NOMBRE_DESTINO, olvidarPlan, palabraDeIngles, pedirAvisos, pensar, planActual,
  probarVoz, probarVozIngles, puedeSolo, quitarSilencio, rutaDe, silenciar, silencio, suscribir, terminarBloque, verEstado,
} from "./aksu.js";
import { Figura } from "./Figura.jsx";
import { puedeVozWeb, VOCES_WEB } from "./voz-web.js";
import estilos from "./Aksu.module.css";

const useAksu = () => useSyncExternalStore(suscribir, verEstado);
const aVeces = (nivel) => puede(nivel, "ingles") && Math.random() < 0.2;
const TONOS = [
  [1, "Tono normal"],
  [0.7, "Grave"],
  [0.4, "Más grave"],
  [0.1, "Lo más grave"],
];
const FRANJAS = [
  ["", "Inglés: sin franja"],
  ["7-9", "Inglés de 7 a 9"],
  ["15-17", "Inglés de 15 a 17"],
  ["20-22", "Inglés de 20 a 22"],
];

/** El primer test que falla, contado para la IA. */
function fallo(resultado) {
  if (resultado?.error) return `Error al correr: ${String(resultado.error).slice(0, 300)}`;
  const c = (resultado?.casos ?? []).find((x) => !x.ok);
  if (!c) return "";
  const v = (x) => (typeof x === "string" ? x : JSON.stringify(x));
  return [`"${c.nombre}"`, c.esperado != null ? `esperado: ${v(c.esperado)}` : "", c.recibido != null ? `recibido: ${v(c.recibido)}` : "", c.mensaje ? `mensaje: ${String(c.mensaje).slice(0, 200)}` : ""].filter(Boolean).join(" · ");
}

/** Mira lo que haces y dispara las intervenciones. No dibuja nada. */
function useObservador() {
  const { pathname } = useLocation();
  const ocioDesde = useRef(null);

  // Qué pantalla y qué ejercicio tienes abierto; la marca que dejó ahí y el recibimiento del día
  useEffect(() => {
    const m = pathname.match(/^\/practicar\/([^/]+)$/);
    const id = m && m[1] !== "ia" && m[1] !== "lista" ? m[1] : null;
    cambiar({ pantalla: pathname, marca: null, ir: null, ...(id ? {} : { ejercicio: null, sesion: null }) });
    ocioDesde.current = esDePaso(pathname) ? (ocioDesde.current ?? Date.now()) : null;
    let vivo = true;
    (async () => {
      let texto = await api.marcaDePantalla?.(pathname).catch(() => null);
      const e = verEstado();
      if (!texto && puede(e.nivel, "recibe") && !(e.dia.recibidos ?? []).includes(pathname)) {
        texto = recibimiento(pathname, await planActual());
        if (texto && vivo) cambiar((s) => ({ dia: { ...s.dia, recibidos: [...(s.dia.recibidos ?? []), pathname] } }));
      }
      if (texto && vivo && puedeSolo()) cambiar({ marca: { texto, en: Date.now() } });
    })();
    if (id) {
      api.ejercicio?.(id).then(
        (ej) => {
          if (!vivo) return;
          cambiar((e) => ({
            ejercicio: { id: ej.id, titulo: ej.titulo, nivel: ej.nivel, estado: ej.estado, enunciado: ej.enunciado, pistas: ej.pistas, totalPistas: ej.totalPistas },
            sesion: e.sesion?.id === ej.id ? e.sesion : sesionNueva(ej.id, ej.nivel, Date.now()),
          }));
        },
        () => {},
      );
    }
    return () => {
      vivo = false;
    };
  }, [pathname]);

  // Actividad: un clic o una tecla (como mucho una vez cada 30 segundos)
  useEffect(() => {
    let ultima = 0;
    const alTocar = () => {
      const ahora = Date.now();
      if (ahora - ultima < 30_000) return;
      ultima = ahora;
      cambiar((e) => ({ dia: actividad(e.dia, ahora) }));
    };
    window.addEventListener("pointerdown", alTocar);
    window.addEventListener("keydown", alTocar);
    return () => {
      window.removeEventListener("pointerdown", alTocar);
      window.removeEventListener("keydown", alTocar);
    };
  }, []);

  // Lee contigo: al llegar al final de la teoría de un tema, una pregunta sobre lo que acabas de leer
  useEffect(() => {
    if (!/^\/aprender\/[^/]+$/.test(pathname)) return;
    const alBajar = (ev) => {
      const t = ev.target === document ? document.scrollingElement : ev.target;
      if (!t?.scrollHeight || t.scrollHeight < t.clientHeight * 1.4 || t.scrollTop + t.clientHeight < t.scrollHeight - 120) return;
      const e = verEstado();
      if (!puede(e.nivel, "teoria") || (e.dia.leidos ?? []).includes(pathname)) return;
      cambiar((s) => ({ dia: { ...s.dia, leidos: [...(s.dia.leidos ?? []), pathname] } }));
      const titulo = document.querySelector("h1")?.textContent?.trim() ?? "este tema";
      pensar({ solo: true, tipo: "teoria", frente: true, momento: `Acaba de leer hasta el final la teoría de "${titulo}". En "pregunta" hazle una sola pregunta que solo puede responder si la entendió.` });
    };
    document.addEventListener("scroll", alBajar, true);
    return () => document.removeEventListener("scroll", alBajar, true);
  }, [pathname]);

  // Cada vez que guardas en VS Code y corren los tests (solo con la laptop conectada)
  useEvento("resultado", (d) => {
    const e = verEstado();
    const ahora = Date.now();
    const esElAbierto = e.sesion?.id === d.id;
    let dia = actividad(e.dia, ahora);
    let sesion = esElAbierto ? anotarGuardada(e.sesion, d.resultado, ahora) : e.sesion;
    const titulo = esElAbierto ? e.ejercicio?.titulo : d.id;

    if (d.resueltoAhora) {
      const p = d.progreso ?? {};
      dia = anotarResuelto(dia, { id: d.id, pistas: p.pistasVistas ?? 0, solucion: !!p.vioSolucion }, ahora);
      const corre = puede(e.nivel, "frena") && vaCorriendo(dia);
      if (corre) dia = marcarFrenado(dia);
      const pregunta = puede(e.nivel, "pregunta") && tocaPregunta(dia);
      if (pregunta) dia = marcarPregunta(dia);
      cambiar({ dia, sesion, ejercicio: esElAbierto && e.ejercicio ? { ...e.ejercicio, estado: "resuelto" } : e.ejercicio });
      olvidarPlan();
      if (puede(e.nivel, "resuelto")) {
        pensar({
          solo: true,
          tipo: corre ? "frena" : "resuelto",
          frente: true,
          momento: [
            `Acaba de resolver el ejercicio "${titulo}": pasan todos los tests.`,
            `Intentos: ${p.intentos ?? "?"}. Pistas vistas: ${p.pistasVistas ?? 0}.${p.vioSolucion ? " Vio la solución antes de resolverlo." : ""}`,
            corre ? "Va corriendo: 3 de sus últimos 4 ejercicios salieron con varias pistas o mirando la solución. Díselo." : "",
            pregunta ? "Toca pregunta de entrevista: en \"pregunta\" hazle una del tema de este ejercicio, en vez de la repregunta sobre su código." : "Después de responderte, que lo explique en voz alta en 30 segundos.",
          ]
            .filter(Boolean)
            .join(" "),
        });
      }
      return;
    }

    if (!esElAbierto) return cambiar({ dia });
    const fallan = sesion.guardadas.at(-1).fallan;
    if (puede(e.nivel, "trabado") && estaTrabado(sesion)) {
      sesion = marcarTrabado(sesion);
      cambiar({ dia, sesion });
      pensar({ solo: true, tipo: "trabado", ir: "tests", momento: `Está trabado: lleva 3 guardadas seguidas fallando exactamente los mismos tests (${fallan.slice(0, 5).join("; ")}). Detalle del primero: ${fallo(d.resultado)}` });
      return;
    }
    cambiar({ dia, sesion });
    if (!fallan.length) return;
    if (puede(e.nivel, "guardar") && sesion.guardadas.length % 3 === 0) pensar({ solo: true, ir: "tests", momento: "Acaba de guardar su código y siguen fallando tests. Mira si tiene un error típico y dilo en una frase." });
    else if (puede(e.nivel, "test")) pensar({ solo: true, ir: "tests", momento: `Acaba de guardar y falla este test: ${fallo(d.resultado)}. Tradúcelo a lenguaje humano en una frase.` });
  });

  // El reloj: bloque, distracciones, tiempo en el ejercicio, pausas, entrevista sorpresa, reto y cierre
  useEffect(() => {
    const revisar = async () => {
      const ahora = Date.now();
      // Tu laptop: qué tienes delante y tu día (solo con dev-prep abierto en ella)
      const uso = await api.usoLaptop?.().catch(() => null);
      if (uso) cambiar({ uso, ...(uso.actual?.tipo === "distraccion" ? {} : { distraidoCon: null }) });
      const e = verEstado();

      const enBloque = bloqueActivo(e.bloque, ahora);
      if (e.bloque && !enBloque) return terminarBloque(true);
      if (puede(e.nivel, "distraccion") && !enSilencio(e, ahora) && tocaDistraccion(e.uso?.actual, enBloque, e.distraidoCon)) {
        cambiar({ distraidoCon: e.uso.actual.nombre });
        return pensar({
          tipo: "frena",
          frente: false,
          momento: `Está distraído: lleva ${e.uso.actual.minutos} minutos seguidos en ${e.uso.actual.nombre}${enBloque ? ", en pleno bloque de concentración" : ""}. Hoy lleva ${duracion(e.uso.hoy.estudio)} de estudio y ${duracion(e.uso.hoy.distraccion)} en distracciones.`,
        });
      }
      if (!puedeSolo()) return;

      const pendiente = e.sesion && e.ejercicio && e.ejercicio.estado !== "resuelto";
      if (pendiente && puede(e.nivel, "tiempo") && pasoElTiempo(e.sesion, ahora)) {
        cambiar({ sesion: marcar(e.sesion, "tiempo") });
        return hablar({ texto: TEXTOS.tiempo(e.sesion, ahora), destino: "pistas", tipo: "tiempo" });
      }
      if (pendiente && puede(e.nivel, "inactivo") && sigueAhi(e.sesion, e.dia, ahora)) {
        cambiar({ sesion: marcar(e.sesion, "inactivo") });
        return hablar({ texto: TEXTOS.inactivo(), tipo: "inactivo" });
      }
      if (puede(e.nivel, "pausa") && tocaPausa(e.dia, ahora)) {
        cambiar({ dia: marcarPausa(e.dia, ahora) });
        return hablar({ texto: TEXTOS.pausa(), tipo: "pausa" });
      }
      if (puede(e.nivel, "cierre") && tocaCierre(e.dia, new Date().getHours())) return cerrarDia();

      // Entrevista sorpresa: nunca en medio de un ejercicio, una lección o mientras programas en VS Code
      const ocupado = pendiente || /^\/leccion/.test(e.pantalla) || e.uso?.actual?.nombre === "VS Code" || document.visibilityState !== "visible";
      if (puede(e.nivel, "entrevista") && (await hayIa()) && tocaEntrevista(e.dia, ahora, ocupado)) return iniciarEntrevista();

      if (puede(e.nivel, "relampago") && !e.reto && !e.abierto && tocaRelampago(e.dia, ahora, ocioDesde.current)) {
        const reto = await api.retoRelampago?.().catch(() => null);
        ocioDesde.current = ahora;
        if (reto) return cambiar((s) => ({ reto, dia: { ...s.dia, relampagoEn: ahora } }));
      }
      // De rato en rato, en vez de un comentario: una palabra de inglés con su ejemplo (sin IA, gratis)
      const ultimoDicho = e.mensajes.findLast?.((m) => m.de !== "yo")?.en ?? 0;
      if (puede(e.nivel, "comenta") && !e.abierto && tocaComentario(e.nivel, e.dia, ahora, ultimoDicho)) {
        cambiar((s2) => ({ dia: { ...s2.dia, comentarioEn: ahora } }));
        if (await palabraDeIngles()) return;
      }
      if (puede(e.nivel, "sorpresa") && tocaSorpresa(e.dia, ahora)) {
        cambiar({ dia: marcarHecho(e.dia, "sorpresa") });
        return pensar({ solo: true, tipo: "sorpresa", ingles: aVeces(e.nivel), momento: "Pregunta sorpresa: hazle una pregunta corta sobre un tema que ya terminó o que hizo ayer, para ver si quedó." });
      }
    };
    const reloj = setInterval(() => revisar().catch(() => {}), 30_000);
    const primera = setTimeout(() => revisar().catch(() => {}), 4000);
    return () => {
      clearInterval(reloj);
      clearTimeout(primera);
    };
  }, []);

  // Al abrir la app: arranque del día e informe de la semana
  useEffect(() => {
    let vivo = true;
    cargarVocesLocales();
    const masTarde = setTimeout(cargarVocesLocales, 6000); // la conexión con la laptop tarda un momento
    const empezar = async () => {
      if (!(await hayIa()) || !vivo) return;
      const e = verEstado();
      if (puede(e.nivel, "arranque") && !yaHizo(e.dia, "arranque")) {
        cambiar({ dia: marcarHecho(e.dia, "arranque") });
        await pensar({ solo: true, tipo: "arranque", frente: false, ingles: aVeces(e.nivel), momento: "Arranque del día: acaba de abrir la app. Dile cuántos días faltan para su fecha meta y si va al día, y por dónde empezar, con un dato real de su avance." });
      }
      const semana = puede(e.nivel, "informe") ? tocaInforme(verEstado().dia.fecha, verEstado().informe) : null;
      if (semana && vivo) {
        cambiar({ informe: semana });
        await pensar({ solo: true, tipo: "informe", frente: false, momento: `Informe semanal de la semana del ${semana}: qué mejoró, qué sigue flojo y un solo foco para la semana que viene. Usa tu libro, las notas de sus días, su tiempo en la laptop y su plan.` });
      }
    };
    const espera = setTimeout(empezar, 2500);
    return () => {
      vivo = false;
      clearTimeout(espera);
      clearTimeout(masTarde);
    };
  }, []);
}

/** Quita las marcas de Markdown que no se dibujan en un globo (comillas invertidas, negritas, citas). */
const limpio = (t) => String(t ?? "").replace(/[`*]/g, "").replace(/^>\s?/gm, "").trim();

/** Texto con bloques de código (```): el código va en <pre>, lo demás en párrafos. */
function Texto({ children }) {
  return String(children ?? "")
    .split("```")
    .map((trozo, i) => (i % 2 ? <pre key={i}>{trozo.replace(/^[a-z]*\n/, "").trimEnd()}</pre> : trozo.trim() && <p key={i}>{limpio(trozo)}</p>));
}

/** El reto relámpago: una pregunta de opción, 30 segundos, sin IA. */
function Reto({ reto }) {
  const [elegida, setElegida] = useState(null);
  const [resta, setResta] = useState(30);
  const listo = elegida !== null || resta <= 0;
  useEffect(() => {
    if (listo) return;
    const t = setInterval(() => setResta((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [listo]);
  const elegir = (i) => {
    if (listo) return;
    setElegida(i);
    api.calificarItem?.(reto.clave, i === reto.correcta ? "sabia" : "no").catch(() => {});
  };
  return (
    <div className={estilos.reto}>
      <header>
        <span>Reto relámpago{reto.tema ? ` · ${reto.tema}` : ""}</span>
        {!listo && <b>{resta} s</b>}
        <button type="button" aria-label="Cerrar" onClick={() => cambiar({ reto: null })}>
          ×
        </button>
      </header>
      <Texto>{reto.pregunta}</Texto>
      <ul>
        {reto.opciones.map((o, i) => (
          <li key={i}>
            <button type="button" disabled={listo} data-estado={listo ? (i === reto.correcta ? "bien" : i === elegida ? "mal" : "") : ""} onClick={() => elegir(i)}>
              {limpio(o)}
            </button>
          </li>
        ))}
      </ul>
      {listo && <p className={estilos.retoFin}>{elegida === reto.correcta ? "Correcto." : resta <= 0 && elegida === null ? "Se acabó el tiempo." : "No."} {limpio(reto.explicacion.split(". ")[0])}.</p>}
    </div>
  );
}

/** Cuenta atrás de una pregunta de la entrevista sorpresa. Al llegar a cero, cuenta como no respondida. */
function RelojEntrevista({ entrevista }) {
  const [, tic] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tic((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const resta = Math.max(0, SEGUNDOS_RESPUESTA - Math.floor((Date.now() - entrevista.turno) / 1000));
  useEffect(() => {
    if (entrevista.lista && resta === 0) decirle("(Se acabó el tiempo y no respondí.)");
  }, [resta, entrevista.lista]);
  return (
    <div className={estilos.reloj} data-poco={resta <= 20}>
      <span>Entrevista sorpresa · pregunta {entrevista.n} de 3</span>
      <b>{entrevista.lista ? `${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, "0")}` : "..."}</b>
      <i style={{ width: `${entrevista.lista ? (resta / SEGUNDOS_RESPUESTA) * 100 : 100}%` }} />
    </div>
  );
}

/** Un mensaje de la conversación. */
function Mensaje({ m, alIr }) {
  const ruta = m.destino ? rutaDe(m.destino) : null;
  return (
    <li className={estilos.mensaje} data-de={m.de === "yo" ? "yo" : "aksu"}>
      <p>{m.texto}</p>
      {m.pregunta && <p className={estilos.suPregunta}>{m.pregunta}</p>}
      {ruta && (
        <button type="button" className={estilos.ir} onClick={() => alIr(ruta)}>
          {NOMBRE_DESTINO[m.destino] ?? "Abrir"} <IconoFlechaDer tamano={14} />
        </button>
      )}
    </li>
  );
}

const medidas = () => ({ ancho: window.innerWidth, alto: window.innerHeight, izquierda: window.innerWidth >= 900 ? 80 : 0 });
const quieto = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ---------- No tapar lo que lees ----------
const ETIQUETAS_CONTENIDO = /^(P|H[1-6]|LI|TD|TH|TABLE|PRE|CODE|BUTTON|A|INPUT|TEXTAREA|SELECT|IMG|SVG|CANVAS|LABEL|SPAN|STRONG|B|EM|SMALL)$/i;
/** ¿Ese elemento (o algo que lo contiene) es contenido: texto, un control o una tarjeta con fondo o borde? */
function esContenido(el) {
  for (let e = el; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    if (ETIQUETAS_CONTENIDO.test(e.tagName)) return true;
    if ([...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) return true;
    const r = e.getBoundingClientRect();
    if (r.width < window.innerWidth * 0.9) {
      const s = getComputedStyle(e);
      if (parseFloat(s.borderTopWidth) > 0 || !/^(transparent|rgba(0, 0, 0, 0))$/.test(s.backgroundColor)) return true;
    }
  }
  return false;
}
/** Cuánto taparía la figura puesta en ese punto: mira qué hay debajo en 9 puntos de su caja (0 = nada). */
function tapa(p) {
  let n = 0;
  for (const fx of [0.05, 0.5, 0.95]) {
    for (const fy of [0.05, 0.5, 0.95]) {
      const x = p.x + FIGURA.ancho * fx;
      const y = p.y + FIGURA.alto * fy;
      if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) continue; // fuera de la ventana no tapa nada
      const debajo = document.elementsFromPoint(x, y).find((el) => !el.closest("[data-aksu-raiz]"));
      if (debajo && esContenido(debajo)) n++;
    }
  }
  return n;
}
/** Los sitios donde menos estorba ahora mismo: las paradas de siempre más puntos repartidos por los bordes. */
function sitiosLibres() {
  const { ancho, alto, izquierda } = medidas();
  const x0 = izquierda + FIGURA.margen;
  const todos = [...paradas(ancho, alto, izquierda)];
  for (let i = 0; i <= 8; i++) {
    todos.push(encajar({ x: ancho, y: (alto * i) / 8 }, ancho, alto));
    todos.push(encajar({ x: x0 + ((ancho - x0) * i) / 8, y: alto }, ancho, alto));
    todos.push(encajar({ x: x0 + ((ancho - x0) * i) / 8, y: 0 }, ancho, alto));
  }
  // Siempre entero y dentro de la ventana: si no hay hueco limpio, donde menos tape
  const medidos = todos.map((p) => ({ p, n: tapa(p) }));
  const menos = Math.min(...medidos.map((m) => m.n));
  return medidos.filter((m) => m.n === menos).map((m) => m.p);
}

/**
 * Por dónde anda la figura. Se desliza despacio entre paradas de los bordes; se acerca a lo que
 * importa, se pone delante cuando te pregunta, se aparta de donde escribes y se queda donde la sueltes.
 */
function useMovimiento(e, enBloque) {
  const [pos, setPos] = useState(() => paradas(...Object.values(medidas()))[0]);
  const [prisa, setPrisa] = useState(false); // viajes cortos (acercarse, apartarse) van más rápido que el paseo
  const [fase, setFase] = useState(""); // "yendose" y "llegando": se deshace en humo y aparece en otro sitio
  const [rumbo, setRumbo] = useState(""); // hacia dónde se inclina mientras se desliza
  const sueltaHasta = useRef(0);
  const posRef = useRef(pos);
  posRef.current = pos;
  const relojes = useRef([]);
  const luego = (f, ms) => relojes.current.push(setTimeout(f, ms));
  const limpiar = () => {
    relojes.current.forEach(clearTimeout);
    relojes.current = [];
  };
  useEffect(() => limpiar, []);

  /** Se desliza hasta un punto, inclinada hacia donde va. */
  const deslizar = (p, rapido = false) => {
    limpiar();
    setFase("");
    setPrisa(rapido);
    const dx = p.x - posRef.current.x;
    setRumbo(Math.abs(dx) > 60 ? (dx > 0 ? "der" : "izq") : "");
    setPos(p);
    luego(() => setRumbo(""), rapido ? 900 : 2600);
  };
  /** Se deshace en humo y aparece de golpe en otro punto. */
  const desvanecer = (p) => {
    limpiar();
    setRumbo("");
    setFase("yendose");
    luego(() => {
      setPrisa(null); // el salto no se anima
      setPos(p);
      setFase("llegando");
      luego(() => setFase(""), 700);
    }, 520);
  };
  /** Ir a un punto: los tramos largos, desapareciendo; los cortos, deslizándose. */
  const ir = (p, rapido = false) => {
    const lejos = Math.hypot(p.x - posRef.current.x, p.y - posRef.current.y) > 420;
    if (!quieto() && window.innerWidth >= 900 && (rapido ? lejos : Math.random() < 0.45)) desvanecer(p);
    else deslizar(p, rapido);
  };

  // El paseo: cada tanto (nunca con el mismo ritmo) cambia de sitio
  useEffect(() => {
    let t;
    const paso = () => {
      t = setTimeout(paso, 7000 + Math.random() * 9000);
      const s = verEstado();
      if (s.abierto || s.frente || s.ir || s.reto || bloqueActivo(s.bloque, Date.now()) || Date.now() < sueltaHasta.current || quieto() || document.visibilityState !== "visible") return;
      const libres = sitiosLibres();
      const otro = siguienteParada(libres, posRef.current, Math.random());
      // Si el único sitio libre es donde ya está, se queda
      if (Math.hypot(otro.x - posRef.current.x, otro.y - posRef.current.y) > 40 || tapa(posRef.current) > 0) ir(otro);
    };
    t = setTimeout(paso, 8000);
    return () => clearTimeout(t);
  }, []);

  // Si al cambiar de pantalla o al bajar quedó encima de algo, se va al sitio libre más cercano
  useEffect(() => {
    let t;
    const reubicar = () => {
      const s = verEstado();
      if (window.innerWidth < 900 || s.abierto || s.frente || s.ir || s.reto || arrastre.current || Date.now() < sueltaHasta.current || tapa(posRef.current) === 0) return;
      const libres = sitiosLibres();
      const p = posRef.current;
      const cerca = libres.reduce((mejor, l) => (Math.hypot(l.x - p.x, l.y - p.y) < Math.hypot(mejor.x - p.x, mejor.y - p.y) ? l : mejor), libres[0]);
      if (cerca && tapa(cerca) < tapa(p)) ir(cerca, true);
    };
    const pronto = () => {
      clearTimeout(t);
      t = setTimeout(reubicar, 700);
    };
    pronto();
    document.addEventListener("scroll", pronto, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener("scroll", pronto, true);
    };
  }, [e.pantalla]);

  // Te sigue con la mirada: la luz de los ojos apunta hacia el cursor (sin volver a dibujar nada)
  const raiz = useRef(null);
  useEffect(() => {
    if (quieto()) return;
    let cuadro = 0;
    const alMover = (ev) => {
      if (cuadro) return;
      cuadro = requestAnimationFrame(() => {
        cuadro = 0;
        const el = raiz.current;
        if (!el) return;
        const dx = ev.clientX - (posRef.current.x + FIGURA.ancho / 2);
        const dy = ev.clientY - (posRef.current.y + FIGURA.alto * 0.3);
        const d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.min(1, d / 160);
        el.style.setProperty("--mx", ((dx / d) * 1.3 * fuerza).toFixed(2));
        el.style.setProperty("--my", ((dy / d) * 0.8 * fuerza).toFixed(2));
        el.toggleAttribute("data-cerca", d < 150);
      });
    };
    window.addEventListener("pointermove", alMover, { passive: true });
    return () => {
      window.removeEventListener("pointermove", alMover);
      cancelAnimationFrame(cuadro);
    };
  }, []);

  // Delante cuando te pregunta; junto a lo que importa; en su esquina durante un bloque
  useEffect(() => {
    const { ancho, alto, izquierda } = medidas();
    if (enBloque) return ir(paradas(ancho, alto, izquierda)[0], true);
    if (e.reto || e.frente) return ir(encajar({ x: izquierda + (ancho - izquierda) * 0.5 + 150, y: alto - FIGURA.alto - 40 }, ancho, alto), true);
    const cerca = e.ir && document.querySelector(`[data-aksu="${e.ir}"]`);
    if (cerca) ir(juntoA(cerca.getBoundingClientRect(), ancho, alto), true);
  }, [e.frente, e.ir, !!e.reto, enBloque]);

  // Se aparta de donde escribes y se reacomoda si cambia la ventana
  useEffect(() => {
    const alEscribir = (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLElement) || !t.matches("input, textarea, [contenteditable='true']") || t.closest("[data-aksu-raiz]")) return;
      const r = t.getBoundingClientRect();
      const p = posRef.current;
      const choca = p.x < r.right + 140 && p.x + FIGURA.ancho > r.left - 140 && p.y < r.bottom + 120 && p.y + FIGURA.alto > r.top - 120;
      if (!choca) return;
      const { ancho, alto, izquierda } = medidas();
      sueltaHasta.current = 0;
      ir(masLejana(paradas(ancho, alto, izquierda), { x: r.left, y: r.top }), true);
    };
    const alCambiar = () => setPos((p) => encajar(p, window.innerWidth, window.innerHeight));
    document.addEventListener("focusin", alEscribir);
    window.addEventListener("resize", alCambiar);
    return () => {
      document.removeEventListener("focusin", alEscribir);
      window.removeEventListener("resize", alCambiar);
    };
  }, []);

  /** La agarras y la sueltas donde quieras: se queda ahí 10 minutos. Devuelve si hubo arrastre. */
  const arrastre = useRef(null);
  const agarrar = (ev) => {
    if (ev.button !== 0) return;
    arrastre.current = { x: ev.clientX, y: ev.clientY, px: pos.x, py: pos.y, movio: false };
    try {
      ev.currentTarget.setPointerCapture?.(ev.pointerId);
    } catch {
      // sin puntero activo (eventos de prueba): se arrastra igual mientras el cursor siga encima
    }
  };
  const mover = (ev) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = ev.clientX - a.x;
    const dy = ev.clientY - a.y;
    if (!a.movio && Math.hypot(dx, dy) < 6) return;
    a.movio = true;
    limpiar();
    setFase("");
    setRumbo("");
    setPrisa(null); // sin transición mientras la llevas
    setPos(encajar({ x: a.px + dx, y: a.py + dy }, window.innerWidth, window.innerHeight));
  };
  const soltar = () => {
    const a = arrastre.current;
    arrastre.current = null;
    if (a?.movio) sueltaHasta.current = Date.now() + 10 * 60_000;
    return !!a?.movio;
  };
  return { pos, prisa, fase, rumbo, raiz, agarrar, mover, soltar };
}

/** La figura suelta por la pantalla, con lo que dice al lado. */
function Suelta({ e }) {
  const ahora = Date.now();
  const enBloque = bloqueActivo(e.bloque, ahora);
  const { pos, prisa, fase, rumbo, raiz, agarrar, mover, soltar } = useMovimiento(e, enBloque);
  const [globo, setGlobo] = useState(null);
  const [, tic] = useState(0);
  const ultimo = e.mensajes.findLast?.((m) => m.de !== "yo");

  // Lo último que dijo se asoma unos segundos (o se queda si te hizo una pregunta)
  useEffect(() => {
    if (!ultimo || Date.now() - ultimo.en > 4000) return;
    setGlobo(ultimo);
    if (ultimo.pregunta && ultimo.tipo !== "palabra") return;
    const t = setTimeout(() => setGlobo(null), ultimo.tipo === "palabra" ? 25_000 : 14_000);
    return () => clearTimeout(t);
  }, [ultimo?.en]);
  // La marca de la pantalla se va sola
  useEffect(() => {
    if (!e.marca) return;
    const t = setTimeout(() => cambiar({ marca: null }), 12_000);
    return () => clearTimeout(t);
  }, [e.marca?.en]);
  // El reloj del bloque
  useEffect(() => {
    if (!enBloque) return;
    const t = setInterval(() => tic((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [enBloque]);

  const g = gasto();
  const estado = e.oyendo !== null ? "escuchando" : e.pensando ? "pensando" : enBloque ? "guardia" : enSilencio(e, ahora) ? "silencio" : globo?.tipo === "frena" ? "frena" : globo || e.reto ? "hablando" : "atento";
  const resta = enBloque ? Math.ceil(restanteBloque(e.bloque, ahora) / 1000) : 0;
  // Se abre con el clic, no al levantar el dedo: en el celular, si el panel aparece al levantar el dedo,
  // el clic que llega justo después cae sobre el botón del panel que quedó debajo ("Cierra mi día")
  const arrastrada = useRef(false);
  const alSoltar = () => {
    arrastrada.current = soltar();
  };
  const alTocar = (ev) => {
    if (arrastrada.current) return (arrastrada.current = false);
    setGlobo(null);
    abrir(ev.target.closest?.("[data-libro]") ? "libro" : "charla");
  };
  const lado = pos.x > window.innerWidth / 2 ? "izquierda" : "derecha";
  const alto = pos.y > window.innerHeight / 2 ? "arriba" : "abajo";

  return (
    <div
      ref={raiz}
      className={estilos.suelta}
      data-aksu-raiz
      data-fase={fase || undefined}
      data-rumbo={rumbo || undefined}
      data-prisa={prisa === null ? "llevada" : prisa ? "si" : "no"}
      data-estado={estado}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
    >
      <button
        type="button"
        className={estilos.cuerpo2}
        onPointerDown={agarrar}
        onPointerMove={mover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onClick={alTocar}
        aria-label={`Abrir a ${NOMBRE} (Alt + A). Para hablarle por voz: Ctrl + Espacio. Su libro abre lo que ha anotado de ti.`}
        title={`${NOMBRE} · Ctrl + Espacio para hablarle · ${g.usd.toFixed(2)} de ${g.tope} USD este mes${g.modelo ? ` · respondió ${g.modelo}` : ""}`}
      >
        <Figura estado={estado} />
        {e.sinLeer > 0 && <b className={estilos.sinLeer}>{e.sinLeer}</b>}
        {enBloque && <span className={estilos.cuenta}>{`${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, "0")}`}</span>}
      </button>
      <div className={estilos.junto} data-lado={lado} data-alto={alto}>
        {e.oyendo !== null ? (
          <button type="button" className={estilos.globo} onClick={escuchar}>
            <small className={estilos.oyendo}>Te escucho. Ctrl + Espacio para enviar</small>
            {e.oyendo || "..."}
          </button>
        ) : e.reto ? (
          <Reto key={e.reto.clave} reto={e.reto} />
        ) : globo && !enBloque ? (
          <button type="button" className={estilos.globo} onClick={() => (setGlobo(null), abrir())}>
            {globo.texto}
            {globo.pregunta && <strong>{globo.pregunta}</strong>}
          </button>
        ) : e.marca && !enBloque ? (
          <button type="button" className={estilos.marca} onClick={() => cambiar({ marca: null })}>
            {e.marca.texto}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Aksu y su panel. Se monta una sola vez, en el marco de la app. */
export function Aksu() {
  const e = useAksu();
  useObservador();
  const navegar = useNavigate();
  const [texto, setTexto] = useState("");
  const [oyendo, setOyendo] = useState(null);
  const fin = useRef(null);
  const ahora = Date.now();
  const enBloque = bloqueActivo(e.bloque, ahora);
  const callado = enSilencio(e, ahora);
  useHayVoz(); // vuelve a dibujar cuando el navegador termina de cargar sus voces
  const vocesEs = vocesEnEspanol();

  useEffect(() => {
    if (e.abierto) fin.current?.scrollIntoView({ block: "end" });
  }, [e.abierto, e.mensajes.length, e.pensando, e.vista]);

  // Alt + A (y el Alt + J de antes) abre y cierra
  useEffect(() => {
    const alTeclear = (ev) => {
      if (ev.altKey && ["a", "j"].includes(ev.key.toLowerCase())) {
        ev.preventDefault();
        verEstado().abierto ? cerrar() : abrir();
      }
      // Ctrl + Espacio: hablarle por voz, con el chat abierto o cerrado
      if (ev.ctrlKey && ev.code === "Space" && !ev.repeat) {
        ev.preventDefault();
        escuchar();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  const enviar = (ev) => {
    ev?.preventDefault();
    const t = texto.trim();
    if (!t || e.pensando) return;
    setTexto("");
    decirle(t);
  };
  /** Un atajo: queda como algo que dijiste tú. */
  const atajo = (frase, momento = "") => {
    if (e.pensando) return;
    cambiar((s) => ({ mensajes: [...s.mensajes, { de: "yo", texto: frase, en: Date.now() }] }));
    pensar({ pregunta: frase, momento });
  };
  const ir = (ruta) => {
    navegar(ruta);
    if (window.innerWidth < 900) cerrar();
  };
  const microfono = () => {
    if (oyendo) {
      oyendo.detener();
      return setOyendo(null);
    }
    silencio();
    let dicho = "";
    const sesion = dictar({
      lang: "es-PE",
      alTexto: (t) => {
        dicho = `${dicho} ${t}`.trim();
        setTexto(dicho);
      },
      alTerminar: () => {
        setOyendo(null);
        if (dicho) {
          setTexto("");
          decirle(dicho);
        }
      },
    });
    setOyendo(sesion);
  };
  const cambiarAvisos = async () => {
    if (e.avisos) return cambiar({ avisos: false });
    const ok = await pedirAvisos();
    cambiar({ avisos: ok });
    if (ok) return hablar({ texto: "Avisos encendidos. Te escribo aquí aunque estés en otra ventana." });
    const permiso = globalThis.Notification?.permission;
    hablar({
      texto: !("Notification" in globalThis)
        ? "Este navegador no permite avisos. Usa la voz para oírme cuando no mires la app."
        : permiso === "denied"
          ? "El navegador tiene bloqueados los avisos de esta página. Haz clic en el candado o en el ícono a la izquierda de la dirección, busca Notificaciones, ponlo en Permitir y vuelve a pulsar Avisos."
          : "No aceptaste el permiso. Pulsa Avisos otra vez y elige Permitir cuando el navegador pregunte.",
    });
  };

  if (!e.abierto) return <Suelta e={e} />;

  const g = gasto();
  const franja = e.franjaIngles ? `${e.franjaIngles.desde}-${e.franjaIngles.hasta}` : "";
  return (
    <aside className={estilos.panel} aria-label={NOMBRE} data-aksu-raiz>
      <header className={estilos.cabeza}>
        <span className={estilos.avatar} aria-hidden>
          <Figura tamano={30} fondo={false} estado={e.pensando ? "pensando" : "atento"} />
        </span>
        <div>
          <strong>{NOMBRE}</strong>
          <small>{e.pensando ? "pensando..." : oyendo || e.oyendo !== null ? "te escucho..." : enBloque ? "cuidando tu bloque" : callado ? "en silencio" : NOMBRE_NIVEL[e.nivel]}</small>
        </div>
        <button type="button" className={estilos.enlace} onClick={() => cambiar({ vista: e.vista === "charla" ? "libro" : "charla" })}>
          {e.vista === "charla" ? "Su libro" : "Conversación"}
        </button>
        <button type="button" className={estilos.cerrar} onClick={cerrar} aria-label="Cerrar">
          ×
        </button>
      </header>

      <div className={estilos.ajustes}>
        <div className={estilos.niveles} role="radiogroup" aria-label="Cuánto interviene">
          {NIVELES.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={e.nivel === n} data-activo={e.nivel === n} onClick={() => cambiar({ nivel: n })}>
              {NOMBRE_NIVEL[n]}
            </button>
          ))}
        </div>
        <button type="button" className={estilos.interruptor} data-activo={e.voz} onClick={() => (e.voz ? (silencio(), cambiar({ voz: false })) : cambiar({ voz: true }))} title="Que hable en voz alta">
          Voz
        </button>
        <button type="button" className={estilos.interruptor} data-activo={e.avisos} onClick={cambiarAvisos} title="Avisos del sistema cuando la app está en otra pestaña">
          Avisos
        </button>
      </div>
      <div className={estilos.ajustes}>
        <button type="button" className={estilos.interruptor} data-activo={enBloque} onClick={() => (enBloque ? terminarBloque() : iniciarBloque())} title="Se queda en su esquina y no te interrumpe; si te vas a otra cosa, te lo dice">
          {enBloque ? `Bloque: quedan ${Math.ceil(restanteBloque(e.bloque, ahora) / 60_000)} min` : `Bloque de ${BLOQUE_MIN} min`}
        </button>
        <button type="button" className={estilos.interruptor} data-activo={callado} onClick={() => (callado ? quitarSilencio() : silenciar(30))} title="No interviene por su cuenta; si le hablas, responde">
          {callado ? `Silencio: ${Math.ceil((e.silencioHasta - ahora) / 60_000)} min` : "Silencio 30 min"}
        </button>
        <select
          className={estilos.franja}
          value={franja}
          aria-label="Franja en la que habla solo en inglés"
          onChange={(ev) => {
            const [desde, hasta] = ev.target.value.split("-").map(Number);
            cambiar({ franjaIngles: ev.target.value ? { desde, hasta } : null });
          }}
        >
          {FRANJAS.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
        <small className={estilos.gasto} title="Lo gastado en IA este mes en este navegador y tu tope mensual (puedes cambiarlo aquí), y el modelo que respondió lo último">
          {g.usd.toFixed(2)} /{" "}
          <input
            type="number"
            min="1"
            max="500"
            className={estilos.tope}
            aria-label="Tope mensual de IA en dólares"
            defaultValue={g.tope}
            onChange={(ev) => Number(ev.target.value) >= 1 && (guardarTopeIa(Number(ev.target.value)), cambiar({}))}
          />{" "}
          USD{g.modelo ? ` · ${g.modelo}` : ""}
        </small>
      </div>

      {e.voz && (
        <div className={estilos.ajustes}>
          <select className={estilos.franja} value={e.vozNombre} aria-label="Voz de Aksu" onChange={(ev) => cambiar({ vozNombre: ev.target.value })}>
            <option value="">Voz automática{[...e.vocesLocales, ...e.vocesWeb].some((v) => v.startsWith("es_")) ? " (neuronal)" : nombreVozGrave() ? ` (${nombreVozGrave().replace(/^Microsoft | - .*$/g, "")})` : ""}</option>
            {e.vocesLocales.filter((v) => v.startsWith("es_")).map((v) => (
              <option key={v} value={LOCAL + v}>
                Neuronal: {v.split("-")[1]} ({v.slice(3, 5)}) · hombre
              </option>
            ))}
            {vocesEs.map((v) => (
              <option key={v.nombre} value={v.nombre}>
                {v.nombre.replace(/^Microsoft /, "")}
                {v.hombre ? " · hombre" : ""}
              </option>
            ))}
          </select>
          <select className={estilos.franja} value={e.vozTono} aria-label="Tono de la voz" onChange={(ev) => cambiar({ vozTono: Number(ev.target.value) })}>
            {TONOS.map(([v, t]) => (
              <option key={v} value={v}>
                {t}
              </option>
            ))}
          </select>
          <button type="button" className={estilos.interruptor} onClick={probarVoz}>
            Probar
          </button>
          {/* La voz en inglés no se elige: si la laptop tiene una neuronal en inglés, usa esa */}
          <button type="button" className={estilos.interruptor} onClick={probarVozIngles} title="Con esta voz dice las palabras de inglés y responde cuando le hablas en inglés">
            Probar inglés{[...e.vocesLocales, ...e.vocesWeb].some((v) => v.startsWith("en_")) ? ` (neuronal: ${[...e.vocesLocales, ...e.vocesWeb].find((v) => v.startsWith("en_")).split("-")[1]})` : " (voz del navegador)"}
          </button>
          {/* Sin la laptop (en el celular): la misma voz neuronal se descarga una vez y corre en el propio dispositivo */}
          {puedeVozWeb() &&
            Object.entries(VOCES_WEB)
              .filter(([, d]) => !e.vocesLocales.some((l) => l.startsWith(`${d.idioma}_`)))
              .map(([v, d]) =>
                e.vocesWeb.includes(v) ? (
                  <small key={v} className={estilos.vozInstalada}>
                    Voz neuronal {d.nombre}: guardada en este dispositivo
                  </small>
                ) : (
                  <button key={v} type="button" className={estilos.interruptor} disabled={!!e.descargaVoz} onClick={() => instalarVozWeb(v)}>
                    {e.descargaVoz?.voz === v ? (e.descargaVoz.error ?? `Descargando ${d.nombre}: ${e.descargaVoz.pct} %`) : `Descargar voz neuronal ${d.nombre} · ${d.mb} MB`}
                  </button>
                ),
              )}
        </div>
      )}

      {e.entrevista && <RelojEntrevista entrevista={e.entrevista} />}

      {e.vista === "libro" ? (
        <div className={estilos.cuerpo}>
          <h3 className={estilos.seccion}>Las notas de tus días</h3>
          {e.veredictos.length === 0 ? (
            <p className={estilos.vacio}>Al cerrar cada día te pongo una nota de A a F, con tus datos.</p>
          ) : (
            <ol className={estilos.veredictos}>
              {e.veredictos.slice(-14).map((v) => (
                <li key={v.fecha} data-nota={v.nota} title={`${v.fecha}: ${v.puntos} de 100`}>
                  <b>{v.nota}</b>
                  <small>{v.fecha.slice(8)}/{v.fecha.slice(5, 7)}</small>
                </li>
              ))}
            </ol>
          )}
          <h3 className={estilos.seccion}>Tu día en la laptop</h3>
          {!e.uso?.activo ? (
            <p className={estilos.vacio}>Solo con dev-prep abierto en tu laptop. Veo el nombre del programa, nunca tu pantalla.</p>
          ) : e.uso.hoy.lista.length === 0 ? (
            <p className={estilos.vacio}>Todavía no hay un minuto completo registrado hoy.</p>
          ) : (
            <ul className={estilos.uso}>
              {e.uso.hoy.lista.slice(0, 7).map((x) => (
                <li key={x.nombre} data-tipo={x.tipo}>
                  <span>{x.nombre}</span>
                  <i style={{ width: `${Math.max(4, (x.segundos / e.uso.hoy.lista[0].segundos) * 100)}%` }} />
                  <b>{duracion(x.segundos)}</b>
                </li>
              ))}
            </ul>
          )}
          <h3 className={estilos.seccion}>Lo que he observado de ti</h3>
          {e.cuaderno.length === 0 && <p className={estilos.vacio}>Todavía no hay notas. Se llena mientras estudias.</p>}
          <ul className={estilos.notas}>
            {e.cuaderno
              .slice()
              .reverse()
              .map((n, i) => (
                <li key={i}>
                  <small>{n.fecha}</small>
                  {n.texto}
                  <button type="button" aria-label="Borrar nota" onClick={() => cambiar((s) => ({ cuaderno: s.cuaderno.filter((x) => x !== n) }))}>
                    ×
                  </button>
                </li>
              ))}
          </ul>
          <div ref={fin} />
        </div>
      ) : (
        <div className={estilos.cuerpo}>
          {e.mensajes.length === 0 && <p className={estilos.vacio}>Te acompaño mientras estudias. Pregúntame lo que sea, o sigue con lo tuyo: si te trabas, te aviso.</p>}
          <ul className={estilos.mensajes}>
            {e.mensajes.map((m, i) => (
              <Mensaje key={i} m={m} alIr={ir} />
            ))}
            {e.pensando && (
              <li className={estilos.mensaje} data-de="aksu" data-pensando>
                <p>...</p>
              </li>
            )}
          </ul>
          <div ref={fin} />
        </div>
      )}

      {e.vista === "charla" && (
        <>
          {!e.entrevista && (
            <div className={estilos.atajos}>
              <button type="button" onClick={() => atajo("¿Qué sigue?")}>¿Qué sigue?</button>
              {e.ejercicio && e.ejercicio.estado !== "resuelto" && (
                <button type="button" onClick={() => atajo("Estoy trabado", "Dice que está trabado: mira su código y los tests que fallan, y dale un empujón sin la solución.")}>
                  Estoy trabado
                </button>
              )}
              {e.ejercicio && (
                <button type="button" onClick={() => atajo("Revisa mi código", "Te pide revisar su código como un senior: dos frases y una repregunta de entrevistador.")}>
                  Revisa mi código
                </button>
              )}
              <button type="button" onClick={() => !e.pensando && iniciarEntrevista()}>Entrevista sorpresa</button>
              <button type="button" onClick={() => !e.pensando && (cambiar((s) => ({ mensajes: [...s.mensajes, { de: "yo", texto: "Cierra mi día", en: Date.now() }] })), cerrarDia())}>Cierra mi día</button>
            </div>
          )}
          <form className={estilos.escribir} onSubmit={enviar}>
            <input value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder={e.oyendo !== null ? e.oyendo || "Te escucho..." : e.entrevista ? "Tu respuesta" : "Escríbele o háblale (Ctrl + Espacio)"} aria-label={`Mensaje para ${NOMBRE}`} maxLength={800} autoFocus />
            {microDisponible() && (
              <button type="button" className={estilos.micro} data-activo={!!oyendo} onClick={microfono} aria-label={oyendo ? "Dejar de escuchar" : "Hablarle"}>
                <IconoMicrofono tamano={16} />
              </button>
            )}
            <button type="submit" className="boton boton-primario" disabled={!texto.trim() || e.pensando}>
              Enviar
            </button>
          </form>
        </>
      )}
    </aside>
  );
}

/** Lo último que dijo Aksu, como una terminal (va en Hoy y en el plan). */
export function FichaAksu({ nombre }) {
  const e = useAksu();
  const ultimo = e.mensajes.findLast?.((m) => m.de !== "yo");
  const tu = (nombre || "tú").split(" ")[0].toLowerCase();
  return (
    <section className={estilos.terminal}>
      <header>
        <i />
        <i />
        <i data-encendido />
        <span>
          {NOMBRE.toLowerCase()} · {e.pensando ? "pensando" : NOMBRE_NIVEL[e.nivel].toLowerCase()}
        </span>
      </header>
      <p>
        <b>{NOMBRE.toLowerCase()} &gt;</b>{" "}
        {ultimo ? [ultimo.texto, ultimo.pregunta].filter(Boolean).join(" ") : e.pensando ? "Mirando tu plan..." : "Te acompaño mientras estudias: te digo qué sigue, te destrabo y te pregunto como en una entrevista."}
        <br />
        <b>{tu} &gt;</b>
        <span className={estilos.cursorTerminal} aria-hidden />
      </p>
      <button type="button" onClick={() => abrir()}>
        Responder ↵
      </button>
    </section>
  );
}
