// Entrevistas, en tres partes según lo que vienes a hacer:
// - Tu preparación: qué tan listo estás, qué te toca hoy y por dónde empezar.
// - Estudiar: las tarjetas (por etapa de la entrevista), tu pitch y tus historias STAR, y la guía.
// - Simular: todas las prácticas en un menú; la elegida se abre al lado con sus opciones.
// Las direcciones viejas (?pestana=tarjetas, voz, ia...) llevan a su lugar nuevo.
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ES_MOVIL } from "../lib/modo.js";
import { usePestanaUrl } from "../hooks/usePestanaUrl.js";
import { api } from "../lib/api.js";
import { ContenidoPestanas, Pestanas } from "../components/Pestanas.jsx";
import { EnunciadoOrganizado } from "../components/EnunciadoOrganizado.jsx";
import { Markdown } from "../components/Markdown.jsx";
import { Tarjeta } from "../components/Tarjeta.jsx";
import { Simulacro } from "../components/Simulacro.jsx";
import { EntrevistaVoz } from "../components/EntrevistaVoz.jsx";
import { PitchStar } from "../components/PitchStar.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { CabeceraPagina } from "../components/CabeceraPagina.jsx";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { DefiendeProyecto, ExamenMensual, Negociacion, PreguntasEntrevistador } from "../components/ia/EntrevistasIa.jsx";
import { EntrevistaIngles } from "../components/ia/InglesIa.jsx";
import {
  IconoChispa,
  IconoEntrevistas,
  IconoFlechaDer,
  IconoIngles,
  IconoMicrofono,
  IconoPracticar,
  IconoReloj,
  IconoTrabajo,
  IconoTrofeo,
} from "../components/Iconos.jsx";
import estilos from "./Entrevistas.module.css";
import nuevo from "./EntrevistasPartes.module.css";

const PESTANAS = ["preparacion", "estudiar", "simular"];
const VISTAS_ESTUDIAR = ["tarjetas", "pitch", "guia"];

/** Direcciones de antes (?pestana=...) → [pestaña nueva, clave de la subvista, valor]. */
const VIEJAS = {
  etapas: ["preparacion"],
  tarjetas: ["estudiar", "ver", "tarjetas"],
  personal: ["estudiar", "ver", "pitch"],
  guia: ["estudiar", "ver", "guia"],
  simulacro: ["simular", "practica", "simulacro"],
  voz: ["simular", "practica", "voz"],
  ia: ["simular", "practica", "examen"],
};

/** Todas las prácticas de Simular, en el orden del menú. */
const PRACTICAS = [
  {
    id: "simulacro",
    grupo: "Entrevista completa",
    titulo: "Simulacro",
    detalle: "Las 4 etapas de un proceso real, o una suelta",
    minutos: "15 a 80 min",
    Icono: IconoEntrevistas,
    consejos: ["Responde en voz alta aunque estés solo: escribir no se parece a una entrevista.", "Al final, el informe con IA te dice qué repasar primero."],
  },
  {
    id: "voz",
    grupo: "Entrevista completa",
    titulo: "Entrevista por voz",
    detalle: "Te pregunta en voz alta y repregunta sobre lo que dices",
    minutos: "10 a 20 min",
    ia: true,
    Icono: IconoMicrofono,
    consejos: ["Usa audífonos para que el micrófono no escuche al entrevistador.", "Empieza con el entrevistador amable y sube a exigente cuando te sientas cómodo."],
  },
  {
    id: "examen",
    grupo: "Entrevista completa",
    titulo: "Examen mensual",
    detalle: "Concepto, código, inglés y comportamiento, comparado con el mes pasado",
    minutos: "15 min",
    ia: true,
    Icono: IconoTrofeo,
    consejos: ["Hazlo una vez al mes, sin preparar nada: mide dónde estás de verdad.", "Cuenta el último intento del mes."],
  },
  {
    id: "proyecto",
    grupo: "Partes clave",
    titulo: "Defiende tu proyecto",
    detalle: "Preguntas sobre dev-prep (o el README que pegues)",
    minutos: "10 min",
    ia: true,
    Icono: IconoTrabajo,
    consejos: ["Explica decisiones con un porqué: \"usé X porque...\".", "Ten a mano un bug que resolviste y lo que aprendiste de él."],
  },
  {
    id: "ingles",
    grupo: "Partes clave",
    titulo: "Entrevista en inglés",
    detalle: "Distinta cada vez, con ayudas que vas quitando",
    minutos: "10 min",
    ia: true,
    Icono: IconoIngles,
    consejos: ["Lee la respuesta modelo en voz alta y cámbiala con tus datos.", "Cuando la ayuda completa te sobre, pasa a solo palabras clave."],
  },
  {
    id: "preguntas",
    grupo: "Partes clave",
    titulo: "Tus preguntas para ellos",
    detalle: "El \"¿tienes alguna pregunta?\" del final",
    minutos: "3 min",
    ia: true,
    Icono: IconoChispa,
    consejos: ["Pregunta por el equipo y el trabajo, no por el sueldo en la primera entrevista.", "Lleva 3 preguntas preparadas: alguna ya te la habrán respondido."],
  },
  {
    id: "sueldo",
    grupo: "Partes clave",
    titulo: "Negocia tu sueldo",
    detalle: "La llamada de la reclutadora cuando ya te quieren",
    minutos: "5 min",
    ia: true,
    Icono: IconoReloj,
    consejos: ["Investiga un rango antes y da una cifra con argumentos.", "Pregunta por el paquete completo: modalidad, horario, beneficios."],
  },
];

/** Lo que también sirve para entrevistas pero vive en otras secciones. */
const ATAJOS = [
  { a: "/ingles/historias", texto: "Roleplays en inglés", web: true },
  { a: "/ingles/mapache?pestana=jugar", texto: "Entrevista con Map", web: true },
  { a: "/practicar/lista?coleccion=javascript%2Fretos", texto: "Retos con tests" },
  { a: "/practicar/ia", texto: "¿Qué imprime este código?" },
  { a: "/glosario", texto: "Glosario para decirlo bien", web: true },
  { a: "/trabajo?pestana=postulaciones", texto: "Tus preguntas reales", web: true },
  { a: "/trabajo?pestana=perfil&ver=portafolio", texto: "Tu portafolio", web: true },
];

const porciento = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export function Entrevistas() {
  const [resumen, setResumen] = useState(api.entrevistas.guardado);
  const [params, setParams] = useSearchParams();
  const [pestana, setPestana] = usePestanaUrl(PESTANAS);
  const [vista, setVista] = usePestanaUrl(VISTAS_ESTUDIAR, "tarjetas", "ver");
  const [practica, setPractica] = usePestanaUrl(
    PRACTICAS.map((p) => p.id),
    "simulacro",
    "practica",
  );
  const preguntaPedida = params.get("pregunta");
  const [sesion, setSesion] = useState(null); // { titulo, tarjetas, indice, notas }

  const cargar = () => api.entrevistas().then(setResumen);
  useEffect(() => {
    cargar();
  }, []);

  // Direcciones viejas: se reemplazan por la nueva sin dejar una entrada extra en el historial
  useEffect(() => {
    const vieja = VIEJAS[params.get("pestana")];
    if (!vieja) return;
    const [nueva, clave, valor] = vieja;
    setParams(
      (previos) => {
        const p = new URLSearchParams(previos);
        if (nueva === "preparacion") p.delete("pestana");
        else p.set("pestana", nueva);
        if (clave) p.set(clave, valor);
        return p;
      },
      { replace: true },
    );
  }, [params, setParams]);

  // ?pregunta=ent-031 (desde el buscador): abre esa pregunta sola, lista para responder
  useEffect(() => {
    if (!preguntaPedida) return;
    api.tarjetas({}).then((todas) => {
      const una = todas.find((p) => p.id === preguntaPedida);
      if (una) {
        ir("estudiar", { ver: null });
        setSesion({ titulo: una.categoria, tarjetas: [una], indice: 0, notas: [] });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preguntaPedida]);

  /** Cambia la pestaña y sus subvistas en un solo paso (dos cambios seguidos de la dirección se pisan). */
  function ir(destinoPestana, extra = {}) {
    setParams(
      (previos) => {
        const p = new URLSearchParams(previos);
        if (destinoPestana === "preparacion") p.delete("pestana");
        else p.set("pestana", destinoPestana);
        for (const [clave, valor] of Object.entries(extra)) {
          if (valor == null) p.delete(clave);
          else p.set(clave, valor);
        }
        return p;
      },
      { replace: true },
    );
  }

  async function empezar(titulo, filtro) {
    const tarjetas = await api.tarjetas(filtro);
    ir("estudiar", { ver: null });
    setSesion({ titulo, tarjetas: tarjetas.slice(0, filtro.cantidad ?? 15), indice: 0, notas: [] });
  }

  async function calificar(nota) {
    const actual = sesion.tarjetas[sesion.indice];
    await api.calificar(actual.id, nota);
    setSesion((s) => ({ ...s, indice: s.indice + 1, notas: [...s.notas, nota] }));
  }

  function terminar() {
    setSesion(null);
    cargar();
  }

  /** Ir a otra parte de la página (lo usan el simulacro y la portada). */
  function irA(destino) {
    setSesion(null);
    const vieja = VIEJAS[destino];
    if (vieja) return ir(vieja[0], vieja[1] ? { [vieja[1]]: vieja[2] } : {});
    if (PRACTICAS.some((p) => p.id === destino)) return ir("simular", { practica: destino });
    ir(destino);
  }

  if (!resumen) return <Esqueleto variante="tarjetas" />;

  const total = resumen.categorias.reduce((a, c) => a + c.total, 0);
  const dominadas = resumen.categorias.reduce((a, c) => a + c.dominadas, 0);
  const pestanas = [
    { id: "preparacion", texto: "Tu preparación" },
    { id: "estudiar", texto: "Estudiar", extra: resumen.pendientesHoy ? `${resumen.pendientesHoy} hoy` : undefined },
    { id: "simular", texto: "Simular" },
  ];

  return (
    <section className={estilos.pagina}>
      <CabeceraPagina etiqueta={`${dominadas} de ${total} preguntas dominadas`} titulo="Entrevistas">
        Preguntas reales de entrevistas junior, con la respuesta que conviene dar, y prácticas para decirlas en voz alta.
      </CabeceraPagina>

      <Pestanas pestanas={pestanas} activa={pestana} alCambiar={(p) => (setPestana(p), setSesion(null))} />

      <ContenidoPestanas activa={pestana} orden={PESTANAS} className={estilos.contenido}>
        {pestana === "preparacion" && <Preparacion resumen={resumen} alEmpezar={empezar} alIr={irA} />}
        {pestana === "estudiar" &&
          (sesion ? (
            <SesionTarjetas sesion={sesion} alCalificar={calificar} alTerminar={terminar} />
          ) : (
            <Estudiar resumen={resumen} vista={vista} alVista={setVista} alEmpezar={empezar} />
          ))}
        {pestana === "simular" && (
          <Simular
            resumen={resumen}
            practica={practica}
            alPractica={setPractica}
            alIr={irA}
            alRepasar={(categoria) => empezar(categoria, { categoria })}
          />
        )}
      </ContenidoPestanas>
    </section>
  );
}

// =============================================================================================
// Tu preparación
// =============================================================================================

/** Lo siguiente que más te conviene hacer, según lo que ya tienes. */
function siguientePaso({ pitch, simulacros, examenMes }) {
  const semana = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  if (!pitch?.trim()) return { texto: "Escribe tu pitch de un minuto", detalle: "Es lo primero que te van a pedir: \"háblame de ti\".", destino: "personal" };
  if (!simulacros.some((s) => (s.fecha ?? "") >= semana)) return { texto: "Haz un simulacro esta semana", detalle: "Una etapa suelta basta si tienes poco tiempo.", destino: "simulacro" };
  if (!examenMes) return { texto: "Da tu examen mensual", detalle: "15 minutos para medir dónde estás de verdad.", destino: "examen" };
  return { texto: "Practica preguntas nuevas", detalle: "Las que nunca respondiste, de todas las etapas.", nuevas: true };
}

function Preparacion({ resumen, alEmpezar, alIr }) {
  const [extra, setExtra] = useState(null); // { simulacros, examenes, pitch }
  useEffect(() => {
    let vivo = true;
    Promise.all([api.simulacros?.().catch(() => []) ?? [], api.examenesMes?.().catch(() => ({})) ?? {}, api.misRespuestas?.().catch(() => null)]).then(
      ([simulacros, examenes, mis]) => vivo && setExtra({ simulacros: simulacros ?? [], examenes: examenes ?? {}, pitch: mis?.pitch ?? "", historias: mis?.historias ?? [] }),
    );
    return () => {
      vivo = false;
    };
  }, []);

  const etapas = (resumen.proceso?.etapas ?? []).map((e) => {
    const cats = resumen.categorias.filter((c) => c.etapa === e.id);
    return { ...e, total: cats.reduce((s, c) => s + c.total, 0), dominadas: cats.reduce((s, c) => s + c.dominadas, 0), pendientes: cats.reduce((s, c) => s + (c.pendientes ?? 0), 0) };
  });
  const total = resumen.categorias.reduce((a, c) => a + c.total, 0);
  const dominadas = resumen.categorias.reduce((a, c) => a + c.dominadas, 0);
  const vistas = resumen.categorias.reduce((a, c) => a + (c.vistas ?? 0), 0);

  const mes = new Date().toISOString().slice(0, 7);
  const meses = Object.keys(extra?.examenes ?? {}).sort();
  const ultimoExamen = meses.length ? { mes: meses.at(-1), ...extra.examenes[meses.at(-1)] } : null;
  const ultimoSimulacro = extra?.simulacros?.[0] ?? null;
  const paso = extra ? siguientePaso({ pitch: extra.pitch, simulacros: extra.simulacros, examenMes: extra.examenes[mes] }) : null;
  const historiasListas = (extra?.historias ?? []).filter((h) => h.situacion?.trim() && h.accion?.trim() && h.resultado?.trim()).length;

  function hacerPaso() {
    if (paso.nuevas) return alEmpezar("Preguntas nuevas", { modo: "nuevas" });
    alIr(paso.destino);
  }

  return (
    <div className={nuevo.preparacion}>
      {/* Fila 1: cuánto dominas (con las 4 etapas) y lo que toca hoy */}
      <section className={`tarjeta ${nuevo.listo}`}>
        <div className={nuevo.listoCabeza}>
          <AnilloProgreso valor={total ? dominadas / total : 0} tamano={104} grosor={9} completo={total > 0 && dominadas === total}>
            <strong className={nuevo.porcentaje}>{porciento(dominadas, total)}%</strong>
          </AnilloProgreso>
          <div>
            <span className="etiqueta">¿Qué tan listo estás?</span>
            <h2>
              {dominadas} de {total} preguntas dominadas
            </h2>
            <p className={nuevo.suave}>
              Has visto {vistas}. Una pregunta está dominada cuando la respondes bien varias veces, días después.
            </p>
          </div>
        </div>
        <ol className={nuevo.etapas}>
          {etapas.map((e, i) => (
            <li key={e.id}>
              <span className={nuevo.etapaNumero}>{i + 1}</span>
              <span className={nuevo.etapaNombre}>
                <strong>{e.titulo}</strong>
                <small>
                  {e.minutos} min{e.total ? ` · ${e.dominadas}/${e.total}` : " · sin tarjetas"}
                  {e.pendientes > 0 && ` · ${e.pendientes} hoy`}
                </small>
              </span>
              <span className={nuevo.barra} aria-hidden>
                <span style={{ width: `${porciento(e.dominadas, e.total)}%` }} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={`tarjeta ${nuevo.hoy}`}>
        <span className="etiqueta">Lo de hoy</span>
        <button type="button" className={nuevo.repaso} disabled={!resumen.pendientesHoy} onClick={() => alEmpezar("Repaso de hoy", { modo: "repaso" })}>
          <span className={nuevo.numero}>
            <SlidingNumber number={resumen.pendientesHoy} />
          </span>
          <span>
            <strong>{resumen.pendientesHoy ? "Tarjetas para repasar" : "Repaso al día"}</strong>
            <small>{resumen.pendientesHoy ? "Las que estás por olvidar" : "Vuelven cuando estén por olvidarse"}</small>
          </span>
          {resumen.pendientesHoy > 0 && <IconoFlechaDer />}
        </button>
        {paso && (
          <div className={nuevo.paso}>
            <span>
              <span className="etiqueta">Tu siguiente paso</span>
              <strong>{paso.texto}</strong>
              <small>{paso.detalle}</small>
            </span>
            <button type="button" className="boton boton-primario" onClick={hacerPaso}>
              Hacerlo ahora
            </button>
          </div>
        )}
        <dl className={nuevo.cifras}>
          <div>
            <dt>Simulacros</dt>
            <dd>{extra?.simulacros.length ?? "–"}</dd>
            <small>{ultimoSimulacro ? `último: ${ultimoSimulacro.fecha}${ultimoSimulacro.informe ? ` · ${ultimoSimulacro.informe.puntaje}/10` : ""}` : "todavía ninguno"}</small>
          </div>
          <div>
            <dt>Examen mensual</dt>
            <dd>{ultimoExamen ? `${ultimoExamen.puntaje}/10` : "–"}</dd>
            <small>{ultimoExamen ? (ultimoExamen.mes === mes ? "este mes" : `de ${ultimoExamen.mes}`) : "todavía no lo das"}</small>
          </div>
          <div>
            <dt>Pitch</dt>
            <dd>{extra?.pitch?.trim() ? "Listo" : "Falta"}</dd>
            <small>{extra?.pitch?.trim() ? `${extra.pitch.trim().split(/s+/).length} palabras` : "\"háblame de ti\""}</small>
          </div>
          <div>
            <dt>Historias STAR</dt>
            <dd>{historiasListas}/5</dd>
            <small>completas</small>
          </div>
        </dl>
      </section>

      <section className={`tarjeta ${nuevo.empezar}`}>
        <span className="etiqueta">Empieza una práctica</span>
        <div className={nuevo.accesos}>
          {PRACTICAS.filter((p) => ["simulacro", "voz", "proyecto", "ingles"].includes(p.id)).map(({ id, titulo, minutos, Icono, ia }) => (
            <button key={id} type="button" className={nuevo.acceso} onClick={() => alIr(id)}>
              <span className={nuevo.accesoIcono} aria-hidden>
                <Icono />
              </span>
              <strong>{titulo}</strong>
              <small>
                {minutos}
                {ia && " · IA"}
              </small>
            </button>
          ))}
        </div>
        <div className={nuevo.atajos}>
          <span className={nuevo.suave}>También te sirve:</span>
          {ATAJOS.filter((a) => ES_MOVIL || !a.web).map((a) => (
            <Link key={a.a} to={a.a} className="chip">
              {a.texto}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

// =============================================================================================
// Estudiar
// =============================================================================================

function Estudiar({ resumen, vista, alVista, alEmpezar }) {
  return (
    <div className={nuevo.estudiar}>
      <div className={nuevo.segmentos} role="tablist" aria-label="Qué estudiar">
        {[
          ["tarjetas", "Tarjetas por etapa"],
          ["pitch", "Pitch y STAR"],
          ["guia", "Cómo pensar en voz alta"],
        ].map(([id, texto]) => (
          <button key={id} type="button" role="tab" aria-selected={vista === id} data-activo={vista === id} onClick={() => alVista(id)}>
            {texto}
          </button>
        ))}
      </div>
      {vista === "tarjetas" && <TarjetasPorEtapa resumen={resumen} alEmpezar={alEmpezar} />}
      {vista === "pitch" && <PitchStar guias={resumen.guias} />}
      {vista === "guia" && <GuiaVozAlta markdown={resumen.guias.vozAlta} />}
    </div>
  );
}

function TarjetasPorEtapa({ resumen, alEmpezar }) {
  const hoy = resumen.pendientesHoy;
  const etapas = (resumen.proceso?.etapas ?? []).filter((e) => resumen.categorias.some((c) => c.etapa === e.id));
  const sueltas = resumen.categorias.filter((c) => !etapas.some((e) => e.id === c.etapa));
  return (
    <>
      <div className={nuevo.mazos}>
        <button type="button" className={`${nuevo.mazo} ${nuevo.mazoHoy}`} disabled={hoy === 0} onClick={() => alEmpezar("Repaso de hoy", { modo: "repaso" })}>
          <span className={nuevo.numero}>
            <SlidingNumber number={hoy} />
          </span>
          <span>
            <strong>Repaso de hoy</strong>
            <small>{hoy ? "De todas las etapas, lo que estás por olvidar" : "Nada pendiente: elige un mazo nuevo"}</small>
          </span>
        </button>
        <button type="button" className={nuevo.mazo} onClick={() => alEmpezar("Preguntas nuevas", { modo: "nuevas" })}>
          <span className={nuevo.accesoIcono} aria-hidden>
            <IconoChispa />
          </span>
          <span>
            <strong>Preguntas nuevas</strong>
            <small>Las que nunca respondiste</small>
          </span>
        </button>
        <button
          type="button"
          className={nuevo.mazo}
          onClick={() =>
            alEmpezar("Repaso rápido de HTML y CSS", {
              categorias: resumen.categorias.filter((c) => /html|css/i.test(c.nombre)).map((c) => c.nombre),
              cantidad: 10,
            })
          }
        >
          <span className={nuevo.accesoIcono} aria-hidden>
            <IconoPracticar />
          </span>
          <span>
            <strong>Repaso rápido de HTML y CSS</strong>
            <small>10 tarjetas para no olvidarlo</small>
          </span>
        </button>
      </div>

      <div className={nuevo.etapasEstudio}>
        {etapas.map((e, i) => {
          const cats = resumen.categorias.filter((c) => c.etapa === e.id);
          const total = cats.reduce((s, c) => s + c.total, 0);
          const dom = cats.reduce((s, c) => s + c.dominadas, 0);
          return (
            <section key={e.id} className={`tarjeta ${nuevo.etapaEstudio}`} data-ancha={cats.length > 3}>
              <header>
                <span className={nuevo.etapaNumero}>{i + 1}</span>
                <div>
                  <h3>{e.titulo}</h3>
                  <small className={nuevo.suave}>
                    {dom} de {total} dominadas · {e.minutos} min en una entrevista real
                  </small>
                </div>
              </header>
              <div className={nuevo.categorias}>
                {cats.map((c) => (
                  <button key={c.nombre} type="button" className={nuevo.categoria} onClick={() => alEmpezar(c.nombre, { categoria: c.nombre })}>
                    <span className={nuevo.categoriaFila}>
                      <strong>{c.nombre}</strong>
                      <small>
                        {c.pendientes > 0 && <em>{c.pendientes} hoy · </em>}
                        {c.dominadas}/{c.total}
                      </small>
                    </span>
                    <span className={nuevo.barra} aria-hidden>
                      <span style={{ width: `${porciento(c.dominadas, c.total)}%` }} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {sueltas.length > 0 && (
          <section className={`tarjeta ${nuevo.etapaEstudio}`}>
            <header>
              <span className={nuevo.etapaNumero}>+</span>
              <h3>Otras</h3>
            </header>
            <div className={nuevo.categorias}>
              {sueltas.map((c) => (
                <button key={c.nombre} type="button" className={nuevo.categoria} onClick={() => alEmpezar(c.nombre, { categoria: c.nombre })}>
                  <span className={nuevo.categoriaFila}>
                    <strong>{c.nombre}</strong>
                    <small>
                      {c.dominadas}/{c.total}
                    </small>
                  </span>
                  <span className={nuevo.barra} aria-hidden>
                    <span style={{ width: `${porciento(c.dominadas, c.total)}%` }} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

/**
 * La guía sale de un Markdown. "Errores que más restan" se separa aquí y se pliega al final, para
 * que la pantalla muestre primero los 5 pasos y las frases; el resto lo ordena EnunciadoOrganizado.
 */
function GuiaVozAlta({ markdown }) {
  const partes = markdown.split(/^(?=## )/m);
  const esPlegada = (p) => /^## Errores que más restan/i.test(p);
  const visible = partes.filter((p) => !esPlegada(p)).join("");
  const plegadas = partes.filter(esPlegada);
  return (
    <div className={estilos.guia}>
      <EnunciadoOrganizado markdown={visible} primeraDestacada />
      {plegadas.map((p) => {
        const [titulo, ...cuerpo] = p.split("\n");
        return (
          <details key={titulo} className={estilos.guiaPlegada}>
            <summary>{titulo.replace(/^##\s*/, "").trim()}</summary>
            <Markdown>{cuerpo.join("\n")}</Markdown>
          </details>
        );
      })}
    </div>
  );
}

// =============================================================================================
// Simular
// =============================================================================================

function Simular({ resumen, practica, alPractica, alIr, alRepasar }) {
  const elegida = PRACTICAS.find((p) => p.id === practica) ?? PRACTICAS[0];
  const grupos = useMemo(() => [...new Set(PRACTICAS.map((p) => p.grupo))], []);
  // En pantallas angostas el menú es una fila deslizable: la práctica elegida queda a la vista
  const elegir = (id) => alPractica(id);
  return (
    <div className={nuevo.simular}>
      <nav className={nuevo.menu} aria-label="Prácticas">
        {grupos.map((g) => (
          <div key={g} className={nuevo.menuGrupo}>
            <span className="etiqueta">{g}</span>
            {PRACTICAS.filter((p) => p.grupo === g).map(({ id, titulo, detalle, minutos, ia, Icono }) => (
              <button key={id} type="button" className={nuevo.menuItem} data-activo={id === elegida.id} aria-current={id === elegida.id} onClick={() => elegir(id)}>
                <span className={nuevo.accesoIcono} aria-hidden>
                  <Icono />
                </span>
                <span className={nuevo.menuTexto}>
                  <strong>{titulo}</strong>
                  <small>{detalle}</small>
                </span>
                <span className={nuevo.menuMeta}>
                  {minutos}
                  {ia && <em>IA</em>}
                </span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className={nuevo.panelPractica}>
        <aside className={nuevo.consejos}>
          <span className="etiqueta">Para sacarle provecho</span>
          <ul>
            {elegida.consejos.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <small className={nuevo.suave}>
            {elegida.minutos}
            {elegida.ia ? " · con IA" : " · IA solo en el informe"}
          </small>
        </aside>
        <div className={nuevo.practicaPrincipal} key={elegida.id}>
          {elegida.id === "simulacro" && <Simulacro proceso={resumen.proceso} alIr={alIr} alRepasar={alRepasar} />}
          {elegida.id === "voz" && <EntrevistaVoz proceso={resumen.proceso} />}
          {elegida.id === "examen" && <ExamenMensual />}
          {elegida.id === "proyecto" && <DefiendeProyecto />}
          {elegida.id === "ingles" && <EntrevistaIngles />}
          {elegida.id === "preguntas" && <PreguntasEntrevistador />}
          {elegida.id === "sueldo" && <Negociacion />}
        </div>
      </div>
    </div>
  );
}

// =============================================================================================
// Sesión de tarjetas
// =============================================================================================

function SesionTarjetas({ sesion, alCalificar, alTerminar }) {
  const { tarjetas, indice, notas, titulo } = sesion;

  if (tarjetas.length === 0) {
    return (
      <div className={estilos.final}>
        <p>No hay tarjetas en este mazo.</p>
        <button type="button" className="boton" onClick={alTerminar}>
          Volver
        </button>
      </div>
    );
  }

  if (indice >= tarjetas.length) {
    const cuenta = (n) => notas.filter((x) => x === n).length;
    return (
      <div className={estilos.final}>
        <span className={estilos.finalEtiqueta}>Terminaste</span>
        <h2>{titulo}</h2>
        <dl className={estilos.cuentas}>
          <div data-tipo="exito">
            <dt>Lo sabías</dt>
            <dd>{cuenta("sabia")}</dd>
          </div>
          <div data-tipo="aviso">
            <dt>Dudaste</dt>
            <dd>{cuenta("dude")}</dd>
          </div>
          <div data-tipo="error">
            <dt>No lo sabías</dt>
            <dd>{cuenta("no")}</dd>
          </div>
        </dl>
        <p className={estilos.nota}>Las que no sabías vuelven mañana; las que sabías, en unos días.</p>
        <button type="button" className="boton boton-primario" onClick={alTerminar}>
          Volver a los mazos
        </button>
      </div>
    );
  }

  return (
    <div className={estilos.sesion}>
      <div className={estilos.sesionCabecera}>
        <span>{titulo}</span>
        <button type="button" className="boton boton-fantasma" onClick={alTerminar}>
          Salir
        </button>
      </div>
      <Tarjeta key={tarjetas[indice].id} pregunta={tarjetas[indice]} alCalificar={alCalificar} posicion={`${indice + 1}/${tarjetas.length}`} />
    </div>
  );
}
