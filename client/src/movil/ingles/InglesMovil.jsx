// Portada de Inglés, en cuatro franjas que usan todo el ancho:
//  1. Hoy: tus minutos, tu racha y la rutina del día; al lado, Map con la práctica de hoy.
//  2. Temario: las etapas (A1 a C2) y sus unidades, con el detalle de la que elijas (Temario.jsx).
//  3. Practica por habilidad: hablar, escuchar, leer, vocabulario y repasar.
//  4. Tu progreso: misiones, tu semana, inglés real (inmersión) y opciones.
// El contenido y su formato: docs/guia-ingles.md.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { cambiarMicro, cambiarVelocidad, hayMicrofono, microApagado, microDisponible, useHayVoz, velocidad } from "../../lib/voz.js";
import { celebrar } from "../../lib/celebrar.js";
import { AnilloProgreso } from "../../components/AnilloProgreso.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Llama } from "../../components/Llama.jsx";
import { SlidingNumber } from "../../components/ui/sliding-number.jsx";
import { avanceConceptos } from "../leccion/variantes.js";
import { TarjetaMap } from "../mapache/TarjetaMapache.jsx";
import { Temario } from "./Temario.jsx";
import { IconoAudifonos, IconoEstrella, IconoLibro, IconoMicrofono, IconoPlay, IconoRegalo, IconoRepetir } from "../../components/Iconos.jsx";
import estilos from "./Inicio.module.css";

/** Inglés real para escuchar fuera de la app, por nivel. Lo que escuches lo anotas en "Inglés real". */
const RECOMENDADOS = [
  {
    nivel: "A1 a A2",
    items: [
      "Series que ya viste en español, ahora en inglés con subtítulos en inglés",
      "Canales de inglés para estudiantes (BBC Learning English, VOA Learning English)",
      "Podcasts de inglés lento (6 Minute English)",
    ],
  },
  {
    nivel: "B1",
    items: [
      "Tutoriales de programación en inglés a velocidad 0.85x (freeCodeCamp, Traversy Media)",
      "Documentación oficial de React y de MDN en inglés",
      "Charlas técnicas cortas con subtítulos",
    ],
  },
  {
    nivel: "B2",
    items: [
      "Conferencias de JavaScript y React sin subtítulos",
      "Podcasts de desarrollo web (Syntax, JS Party)",
      "Entrevistas técnicas de práctica en video",
    ],
  },
];

const MINUTOS_RAPIDOS = [10, 20, 30, 45];
const leccion = (modo) => `/leccion?ambito=ingles${modo ? `&modo=${modo}` : ""}`;

/**
 * Todo lo que se puede practicar, agrupado por la habilidad que entrena.
 * Lo que necesita una voz en inglés no aparece si el dispositivo no la tiene.
 */
export function practicaPorHabilidad({ conVoz = true } = {}) {
  return [
    {
      id: "hablar",
      titulo: "Hablar",
      Icono: IconoMicrofono,
      items: [
        { a: "/ingles/conversa", titulo: "Conversa con IA", sub: "Charla de trabajo y tus errores corregidos" },
        { a: "/ingles/mapache", titulo: "Repite con Map", sub: "Imita frases y responde la pregunta de hoy" },
        { a: "/ingles/historias", titulo: "Roleplays", sub: "Diálogos donde tú eliges qué decir" },
      ],
    },
    {
      id: "escuchar",
      titulo: "Escuchar",
      Icono: IconoAudifonos,
      items: conVoz
        ? [
            { a: leccion("escuchar"), titulo: "Solo escuchar", sub: "Oído y dictado" },
            { a: leccion("oido"), titulo: "Oído fino", sub: "Sonidos que se confunden: ship o sheep" },
          ]
        : [],
      vacio: "Este dispositivo no tiene una voz en inglés. Mira cómo instalarla en Opciones.",
    },
    {
      id: "leer",
      titulo: "Leer",
      Icono: IconoLibro,
      items: [
        { a: "/ingles/historias", titulo: "Historias", sub: "La serie de Ana, capítulo por capítulo" },
        { a: "/ingles/mapache?pestana=leer", titulo: "Lecturas de Map", sub: "Su diario y sus postales" },
      ],
    },
    {
      id: "vocabulario",
      titulo: "Vocabulario",
      Icono: IconoEstrella,
      items: [
        { a: "/ingles/parejas", titulo: "Parejas", sub: "60 segundos contrarreloj" },
        { a: leccion("mispalabras"), titulo: "Mis palabras", sub: "Las que marcaste con estrella" },
      ],
    },
    {
      id: "repasar",
      titulo: "Repasar",
      Icono: IconoRepetir,
      items: [
        { a: leccion("rapida"), titulo: "Inglés rápido", sub: "5 ejercicios, 2 minutos" },
        { a: leccion("errores"), titulo: "Mis errores", sub: "Lo que fallaste" },
        { a: leccion("mezcla"), titulo: "Repaso mezclado", sub: "De todas tus unidades" },
      ],
    },
  ];
}

export function InglesMovil() {
  const [hoy, setHoy] = useState(null);
  const [error, setError] = useState(null);
  const [lento, setLento] = useState(velocidad() === "lento");
  const [inmersion, setInmersion] = useState(null); // minutos elegidos
  const [que, setQue] = useState("");
  const [aviso, setAviso] = useState(null);
  const [motivacion, setMotivacion] = useState(null);
  const [micro, setMicro] = useState(!microApagado());
  const conVoz = useHayVoz();
  // null mientras no se sabe: así el aviso del examen de nivel no parpadea al abrir
  const [hayUnidadesHechas, setHayUnidadesHechas] = useState(null);

  const cargar = () => {
    api.inglesMotivacion?.({ conMicro: hayMicrofono() }).then(setMotivacion);
    return api.inglesHoy().then(setHoy, (e) => setError(e.message));
  };
  useEffect(() => {
    cargar();
    // El examen de nivel solo se ofrece a quien todavía no completó ninguna unidad
    api
      .lecciones("ingles")
      .then((d) => setHayUnidadesHechas(d.unidades.some((u) => avanceConceptos(d.items, d.registros, u.id).completa)))
      .catch(() => setHayUnidadesHechas(false));
  }, []);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!hoy) return <Esqueleto variante="lista" />;

  const avanceHoy = hoy.meta ? Math.min(1, hoy.minutosHoy / hoy.meta) : 0;
  const minutos = Math.floor(hoy.minutosHoy);
  const faltan = Math.max(0, Math.ceil(hoy.meta - hoy.minutosHoy));

  async function cobrarCofre() {
    const r = await api.cobrarCofreDiario({ conMicro: hayMicrofono() });
    if (r) {
      celebrar("logro");
      setAviso(`Cofre del día: +${r.xp} XP`);
    }
    cargar();
  }

  async function guardarInmersion() {
    if (!inmersion) return;
    await api.registrarInmersion(inmersion, que);
    setAviso(`+${inmersion} min de inglés real anotados.`);
    setInmersion(null);
    setQue("");
    cargar();
  }

  return (
    <section className={estilos.pagina} data-area="ingles">
      <CabeceraPagina etiqueta="Para trabajar en inglés" titulo="Inglés" resaltado="todos los días">
        15 minutos al día valen más que 2 horas el domingo. Haz la rutina de hoy y, si te queda tiempo, elige una unidad del temario o una práctica por habilidad.
      </CabeceraPagina>

      {/* 1. Hoy */}
      <div className={estilos.franja}>
        <div className={`textura ${estilos.hoy}`}>
          <div
            className={estilos.hoyDatos}
            title={`Hoy: ${hoy.leccionesHoy} ${hoy.leccionesHoy === 1 ? "lección" : "lecciones"} · ${hoy.inmersionHoy} min de inglés real`}
          >
            <AnilloProgreso valor={avanceHoy} tamano={68} grosor={7} completo={avanceHoy >= 1}>
              <strong className={estilos.minutos}>
                <SlidingNumber number={minutos} />
              </strong>
            </AnilloProgreso>
            <div className={estilos.hoyTexto}>
              <strong>{faltan > 0 ? `Te faltan ${faltan} min` : "Meta de hoy cumplida"}</strong>
              <small>
                {minutos} de {hoy.meta} min hoy
              </small>
              <span className={estilos.racha}>
                <Llama encendida={hoy.racha > 0} tamano={18} />
                {hoy.racha} {hoy.racha === 1 ? "día seguido" : "días seguidos"}
              </span>
            </div>
          </div>
          <Link to={leccion()} className={`boton boton-primario ${estilos.rutina}`}>
            <span className={estilos.play} aria-hidden>
              <IconoPlay tamano={20} />
            </span>
            <span>
              <strong>Rutina de hoy</strong>
              <small>12 ejercicios: tu repaso y hasta 6 nuevos</small>
            </span>
          </Link>
        </div>

        <TarjetaMap />
      </div>

      {/* 2. Temario */}
      <Temario examenPendiente={!hoy.nivelHecho && hayUnidadesHechas === false} alCambiar={cargar} />

      {/* 3. Practica por habilidad */}
      <section className={estilos.bloque} aria-labelledby="practica-titulo">
        <header className={estilos.cabeceraBloque}>
          <h2 id="practica-titulo">Practica por habilidad</h2>
          <small>Elige qué quieres entrenar hoy</small>
        </header>
        <div className={estilos.habilidades}>
          {practicaPorHabilidad({ conVoz }).map(({ id, titulo, Icono, items, vacio }) => (
            <div key={id} className={`textura ${estilos.habilidad}`}>
              <h3>
                <Icono tamano={18} /> {titulo}
              </h3>
              {items.length ? (
                <ul>
                  {items.map((it) => (
                    <li key={it.titulo}>
                      <Link to={it.a}>
                        <strong>{it.titulo}</strong>
                        <small>{it.sub}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.ayuda}>{vacio}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Tu progreso */}
      <section className={estilos.bloque} aria-labelledby="progreso-titulo">
        <header className={estilos.cabeceraBloque}>
          <h2 id="progreso-titulo">Tu progreso</h2>
          {aviso && <small className={estilos.exito}>{aviso}</small>}
        </header>
        <div className={estilos.progreso}>
          {motivacion && <Misiones datos={motivacion} alCobrar={cobrarCofre} />}

          <div className={`textura ${estilos.tarjeta}`}>
            <div className={estilos.tarjetaCabecera}>
              <h3>Tu semana</h3>
              <small>minutos por día</small>
            </div>
            <div className={estilos.semana} aria-label="Minutos de inglés en los últimos 7 días">
              {hoy.semana.map((d) => (
                <div key={d.fecha} title={`${d.fecha}: ${d.minutos} min`}>
                  <span style={{ height: `${Math.min(100, (d.minutos / Math.max(hoy.meta, 1)) * 100)}%` }} data-cumplio={d.minutos >= hoy.meta} />
                  <small>{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
                </div>
              ))}
            </div>
            {motivacion && <Liga liga={motivacion.liga} />}
          </div>

          <div className={`textura ${estilos.tarjeta}`}>
            <div className={estilos.tarjetaCabecera}>
              <h3>Inglés real</h3>
              <small>fuera de la app</small>
            </div>
            <p className={estilos.ayuda}>¿Viste una serie o un video en inglés? Anótalo: cuenta para tu meta.</p>
            <div className={estilos.chips}>
              {MINUTOS_RAPIDOS.map((m) => (
                <button key={m} type="button" className={estilos.chip} data-elegido={inmersion === m} onClick={() => setInmersion(inmersion === m ? null : m)}>
                  {m} min
                </button>
              ))}
            </div>
            {inmersion && (
              <div className={estilos.inmersion}>
                <input value={que} onChange={(e) => setQue(e.target.value)} maxLength={80} placeholder="¿Qué fue? (opcional)" aria-label="Qué viste o escuchaste" />
                <button type="button" className="boton boton-primario" onClick={guardarInmersion}>
                  Anotar {inmersion} min
                </button>
              </div>
            )}
            <details className={estilos.plegado}>
              <summary>Qué escuchar según tu nivel</summary>
              {RECOMENDADOS.map((r) => (
                <div key={r.nivel}>
                  <strong>{r.nivel}</strong>
                  <ul>
                    {r.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </details>
          </div>

          <div className={`textura ${estilos.tarjeta}`}>
            <div className={estilos.tarjetaCabecera}>
              <h3>Opciones</h3>
            </div>
            {motivacion && (
              <label className={estilos.opcion}>
                <input
                  type="checkbox"
                  checked={motivacion.vidas}
                  onChange={async (e) => {
                    await api.cambiarVidasIngles(e.target.checked);
                    cargar();
                  }}
                />
                Jugar con vidas (5 por lección)
              </label>
            )}
            {microDisponible() && (
              <label className={estilos.opcion}>
                <input
                  type="checkbox"
                  checked={micro}
                  onChange={(e) => {
                    setMicro(e.target.checked);
                    cambiarMicro(e.target.checked);
                  }}
                />
                Ejercicios de hablar (micrófono e internet)
              </label>
            )}
            {conVoz ? (
              <label className={estilos.opcion}>
                <input
                  type="checkbox"
                  checked={lento}
                  onChange={(e) => {
                    setLento(e.target.checked);
                    cambiarVelocidad(e.target.checked ? "lento" : "normal");
                  }}
                />
                Audio más lento
              </label>
            ) : (
              <details className={estilos.plegado}>
                <summary>Falta una voz en inglés</summary>
                <p>
                  Sin ella no aparecen los ejercicios de escuchar. En Windows: Configuración, Hora e idioma, Voz, agrega una voz en inglés (Estados
                  Unidos). En Android viene con Google.
                </p>
              </details>
            )}
            <Link to="/ingles/examen" className={estilos.enlace}>
              {hoy.nivelHecho ? "Repetir el examen de nivel" : "Hacer el examen de nivel"}
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}

/** Misiones de hoy (3) y el cofre del día. */
function Misiones({ datos, alCobrar }) {
  const hechas = datos.misiones.filter((m) => m.hecha).length;
  return (
    <div className={`textura ${estilos.tarjeta}`}>
      <div className={estilos.tarjetaCabecera}>
        <h3>Misiones de hoy</h3>
        <small>
          {hechas}/{datos.misiones.length}
        </small>
      </div>
      <ul className={estilos.misiones}>
        {datos.misiones.map((m) => (
          <li key={m.id} data-hecha={m.hecha}>
            <span aria-hidden>{m.hecha ? "✓" : "○"}</span>
            <div>
              <p>{m.texto}</p>
              <div className={estilos.barraMision}>
                <i style={{ width: `${Math.min(100, (m.valor / m.meta) * 100)}%` }} />
              </div>
            </div>
            <small>
              {m.valor}/{m.meta}
            </small>
          </li>
        ))}
      </ul>
      {datos.cobrado ? (
        <p className={estilos.ayuda}>Cofre de hoy abierto. Mañana hay misiones nuevas.</p>
      ) : datos.completas ? (
        <button type="button" className="boton boton-primario" onClick={alCobrar}>
          <IconoRegalo /> Abrir el cofre del día (+{datos.xpCofre} XP)
        </button>
      ) : (
        <p className={estilos.ayuda}>Completa las 3 y abres el cofre del día (+{datos.xpCofre} XP).</p>
      )}
    </div>
  );
}

/** Tú contra ti, en una línea: tu XP de esta semana frente a la pasada a esta misma altura. */
function Liga({ liga }) {
  if (liga.estaSemana === 0 && liga.pasadaHastaHoy === 0) return <p className={estilos.liga}>Esta semana todavía no sumas XP.</p>;
  return (
    <p className={estilos.liga} data-ganando={liga.ganando}>
      <strong>{liga.estaSemana} XP</strong> esta semana, contra {liga.pasadaHastaHoy} de la pasada a esta altura.
      {!liga.ganando && ` Te faltan ${liga.pasadaHastaHoy - liga.estaSemana + 1} para pasarte.`}
    </p>
  );
}
