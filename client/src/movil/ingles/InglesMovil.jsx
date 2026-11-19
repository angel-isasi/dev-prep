// Sección Inglés: tu meta de minutos de hoy, la racha, las lecciones (rutina, rápida, escuchar,
// errores), la prueba de nivel, el registro de inglés real (inmersión) y el camino por etapas.
// El contenido y su formato: docs/guia-ingles.md.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { cambiarMicro, cambiarVelocidad, hayMicrofono, microApagado, microDisponible, useHayVoz, velocidad } from "../../lib/voz.js";
import { celebrar } from "../../lib/celebrar.js";
import { Bit } from "../../components/Bit.jsx";
import { AnilloProgreso } from "../../components/AnilloProgreso.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Llama } from "../../components/Llama.jsx";
import { SlidingNumber } from "../../components/ui/sliding-number.jsx";
import { CaminoMovil } from "../leccion/CaminoMovil.jsx";
import { avanceConceptos } from "../leccion/variantes.js";
import { TarjetaMapache } from "../mapache/TarjetaMapache.jsx";
import { IconoAudifonos, IconoEstrella, IconoLibro, IconoMezclar, IconoOido, IconoPlay, IconoRayo, IconoRegalo, IconoReloj, IconoRepetir } from "../../components/Iconos.jsx";
import estilos from "./Ingles.module.css";

/** Inglés real para escuchar fuera de la app, por nivel. Lo que escuches lo anotas en "Inmersión". */
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
  const leccion = (modo) => `/leccion?ambito=ingles${modo ? `&modo=${modo}` : ""}`;

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
    setAviso(`+${inmersion} min de inglés real. ¡Así se aprende!`);
    setInmersion(null);
    setQue("");
    cargar();
  }

  return (
    <section className={estilos.pagina} data-area="ingles">
      <CabeceraPagina etiqueta="Para trabajar en inglés" titulo="Inglés" resaltado="todos los días">
        15 minutos al día valen más que 2 horas el domingo.
      </CabeceraPagina>

      <div className={estilos.tablero}>
        <div className={estilos.columnaPrincipal}>
          <div className={`${estilos.resumen} ${estilos.resumenCompacto}`}>
            {/* Hoy: el anillo y debajo "7/15 min" en una sola línea; el detalle queda en el title */}
            <div
              className={estilos.metaHoy}
              title={`Hoy: ${hoy.leccionesHoy} ${hoy.leccionesHoy === 1 ? "lección" : "lecciones"} · ${hoy.inmersionHoy} min de inglés real`}
            >
              <AnilloProgreso valor={avanceHoy} tamano={60} grosor={6} completo={avanceHoy >= 1}>
                <strong className={estilos.minutos}>
                  <SlidingNumber number={Math.floor(hoy.minutosHoy)} />
                </strong>
              </AnilloProgreso>
              <small>
                {Math.floor(hoy.minutosHoy)}/{hoy.meta} min
              </small>
            </div>
            <div className={estilos.racha}>
              <Llama encendida={hoy.racha > 0} tamano={28} />
              <div>
                <strong>
                  <SlidingNumber number={hoy.racha} />
                </strong>
                <small>{hoy.racha === 1 ? "día seguido" : "días seguidos"}</small>
              </div>
            </div>
            {/* La rutina de hoy va arriba, junto al resumen: así el camino se ve sin bajar */}
            <Link to={leccion()} className={`boton boton-primario ${estilos.continuar}`}>
              <span className={estilos.play} aria-hidden>
                <IconoPlay tamano={20} />
              </span>
              <span>
                <strong>Rutina de hoy</strong>
                <small>12 ejercicios: lo que toca repasar y hasta 6 nuevos</small>
              </span>
            </Link>
          </div>

          <TarjetaMapache />

          {!hoy.nivelHecho && hayUnidadesHechas === false && (
            <div className={estilos.nivelLinea} title="El examen se adapta a ti (de A1 a C2) y marca como hechas las unidades que ya dominas.">
              <strong>¿Ya sabes algo de inglés?</strong>
              <Link to="/ingles/examen" className="boton boton-primario">
                Hacer el examen
              </Link>
            </div>
          )}

          <h2 className={estilos.tituloCamino}>Tu camino</h2>
          <CaminoMovil ambito="ingles" sinCabecera />
        </div>

        <aside className={estilos.columnaLateral}>
          {motivacion && <Motivacion datos={motivacion} alCobrar={cobrarCofre} />}

          <div className={`textura ${estilos.tarjetaLateral}`}>
            <div className={estilos.cabeceraBloque}>
              <h2>Tu semana</h2>
              <small>minutos por día</small>
            </div>
            <div className={estilos.semana} aria-label="Minutos de inglés en los últimos 7 días">
              {hoy.semana.map((d) => (
                <div key={d.fecha} title={`${d.fecha}: ${d.minutos} min`}>
                  <span
                    style={{ height: `${Math.min(100, (d.minutos / Math.max(hoy.meta, 1)) * 100)}%` }}
                    data-cumplio={d.minutos >= hoy.meta}
                  />
                  <small>{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
                </div>
              ))}
            </div>
          </div>

          <div className={`textura ${estilos.tarjetaLateral}`}>
            <h2>Más práctica</h2>
            {/* Rejilla de accesos: icono y título; el subtítulo queda como title */}
            <ul className={estilos.modosRejilla}>
              {[
                { a: leccion("rapida"), Icono: IconoRayo, titulo: "Inglés rápido", sub: "5 ejercicios" },
                conVoz && { a: leccion("escuchar"), Icono: IconoAudifonos, titulo: "Solo escuchar", sub: "oído y dictado" },
                { a: "/ingles/historias", Icono: IconoLibro, titulo: "Historias", sub: "la serie de Ana y roleplays" },
                { a: "/ingles/parejas", Icono: IconoReloj, titulo: "Parejas", sub: "60 segundos contrarreloj" },
                { a: leccion("mezcla"), Icono: IconoMezclar, titulo: "Repaso mezclado", sub: "de todas tus unidades" },
                conVoz && { a: leccion("oido"), Icono: IconoOido, titulo: "Oído fino", sub: "ship o sheep" },
                { a: leccion("errores"), Icono: IconoRepetir, titulo: "Mis errores", sub: "lo que fallaste" },
                { a: leccion("mispalabras"), Icono: IconoEstrella, titulo: "Mis palabras", sub: "las que marcaste con estrella" },
              ]
                .filter(Boolean)
                .map(({ a, Icono, titulo, sub }) => (
                  <li key={titulo}>
                    <Link to={a} className={estilos.modoChip} title={sub}>
                      <Icono tamano={20} />
                      <strong>{titulo}</strong>
                    </Link>
                  </li>
                ))}
            </ul>
            <details className={estilos.opcionesPlegadas}>
              <summary>Opciones</summary>
              {motivacion && (
                <label className={estilos.velocidad}>
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
                <label className={estilos.velocidad}>
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
              <label className={estilos.velocidad}>
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
              <p className={estilos.ayuda}>
                Este dispositivo no tiene una voz en inglés instalada, así que los ejercicios de escuchar no aparecen. En Windows:
                Configuración, Hora e idioma, Voz, agrega una voz en inglés (Estados Unidos). En Android viene con Google.
              </p>
            )}
            </details>
          </div>

          <div className={`textura ${estilos.tarjetaLateral}`}>
            <div className={estilos.cabeceraBloque}>
              <h2>Inmersión</h2>
              <small>Anota tu inglés real de hoy</small>
            </div>
          <div className={estilos.chips}>
            {MINUTOS_RAPIDOS.map((m) => (
              <button key={m} type="button" className={estilos.chip} data-elegido={inmersion === m} onClick={() => setInmersion(m)}>
                {m} min
              </button>
            ))}
          </div>
          {inmersion && (
            <div className={estilos.inmersion}>
              <input
                value={que}
                onChange={(e) => setQue(e.target.value)}
                maxLength={80}
                placeholder="¿Qué fue? (opcional): una serie, un video, un podcast"
              />
              <button type="button" className="boton boton-primario" onClick={guardarInmersion}>
                Anotar {inmersion} min
              </button>
            </div>
          )}
          {aviso && <p className={estilos.exito}>{aviso}</p>}
          <details className={estilos.recomendados}>
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

            {hoy.nivelHecho && (
              <Link to="/ingles/examen" className={`boton boton-fantasma ${estilos.repetirExamen}`}>
                Repetir el examen de nivel
              </Link>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

/** Misiones de hoy (3), cofre del día y la liga contra ti mismo. */
function Motivacion({ datos, alCobrar }) {
  const hechas = datos.misiones.filter((m) => m.hecha).length;
  const { liga } = datos;
  const maximo = Math.max(1, ...liga.porDia.map((d) => Math.max(d.xp, d.pasada)));
  return (
    <div className={estilos.motivacion}>
      <div className={`textura ${estilos.bloque} ${estilos.misiones}`}>
        <div className={estilos.cabeceraBloque}>
          <h2>Misiones de hoy</h2>
          <small>
            {hechas}/{datos.misiones.length}
          </small>
        </div>
        <ul>
          {datos.misiones.map((m) => (
            <li key={m.id} data-hecha={m.hecha}>
              <span>{m.hecha ? "✓" : "○"}</span>
              <div>
                <p>{m.texto}</p>
                <div className={estilos.barraMision}>
                  <i style={{ width: `${(m.valor / m.meta) * 100}%` }} />
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

      <div className={`textura ${estilos.bloque} ${estilos.liga}`}>
        <div className={estilos.cabeceraBloque}>
          <h2>Tú contra ti</h2>
          <small>XP de inglés</small>
        </div>
        <Bit
          animo={liga.ganando ? "feliz" : liga.estaSemana === 0 ? "pensando" : "sorpresa"}
          tamano={44}
          dice={
            liga.pasadaHastaHoy === 0 && liga.estaSemana === 0
              ? "Esta semana todavía no sumas XP. ¿Una lección rápida?"
              : liga.ganando
                ? `Vas ${liga.estaSemana} XP contra ${liga.pasadaHastaHoy} de la semana pasada a esta altura${liga.diferencia !== null ? ` (+${liga.diferencia}%)` : ""}.`
                : `La semana pasada a esta altura llevabas ${liga.pasadaHastaHoy} XP; ahora ${liga.estaSemana}. Te faltan ${liga.pasadaHastaHoy - liga.estaSemana + 1} para pasarte.`
          }
        />
        {(liga.estaSemana > 0 || liga.pasada > 0) && (
        <div className={estilos.ligaDias} aria-label="XP por día: esta semana contra la pasada">
          {liga.porDia.map((d) => (
            <div key={d.fecha} title={`${d.fecha}: ${d.xp} XP (semana pasada: ${d.pasada})`}>
              <span data-tipo="pasada" style={{ height: `${(d.pasada / maximo) * 100}%` }} />
              <span style={{ height: `${(d.xp / maximo) * 100}%` }} />
              <small>{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
