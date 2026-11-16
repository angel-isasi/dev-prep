// Sección Inglés: tu meta de minutos de hoy, la racha, las lecciones (rutina, rápida, escuchar,
// errores), la prueba de nivel, el registro de inglés real (inmersión) y el camino por etapas.
// El contenido y su formato: docs/guia-ingles.md.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api.js";
import { cambiarVelocidad, hayVoz, velocidad } from "../../lib/voz.js";
import { AnilloProgreso } from "../../components/AnilloProgreso.jsx";
import { CabeceraPagina } from "../../components/CabeceraPagina.jsx";
import { Esqueleto } from "../../components/Esqueleto.jsx";
import { Llama } from "../../components/Llama.jsx";
import { SlidingNumber } from "../../components/ui/sliding-number.jsx";
import { CaminoMovil } from "../leccion/CaminoMovil.jsx";
import estilos from "./Ingles.module.css";

/** Inglés real para escuchar fuera de la app, por nivel. Lo que escuches lo anotas en "Inmersión". */
const RECOMENDADOS = [
  { nivel: "A1 a A2", items: ["Series que ya viste en español, ahora en inglés con subtítulos en inglés", "Canales de inglés para estudiantes (BBC Learning English, VOA Learning English)", "Podcasts de inglés lento (6 Minute English)"] },
  { nivel: "B1", items: ["Tutoriales de programación en inglés a velocidad 0.85x (freeCodeCamp, Traversy Media)", "Documentación oficial de React y de MDN en inglés", "Charlas técnicas cortas con subtítulos"] },
  { nivel: "B2", items: ["Conferencias de JavaScript y React sin subtítulos", "Podcasts de desarrollo web (Syntax, JS Party)", "Entrevistas técnicas de práctica en video"] },
];

const MINUTOS_RAPIDOS = [10, 20, 30, 45];

export function InglesMovil() {
  const [hoy, setHoy] = useState(null);
  const [error, setError] = useState(null);
  const [lento, setLento] = useState(velocidad() === "lento");
  const [inmersion, setInmersion] = useState(null); // minutos elegidos
  const [que, setQue] = useState("");
  const [aviso, setAviso] = useState(null);

  const cargar = () => api.inglesHoy().then(setHoy, (e) => setError(e.message));
  useEffect(() => {
    cargar();
  }, []);

  if (error) return <p className={estilos.mensaje}>{error}</p>;
  if (!hoy) return <Esqueleto variante="lista" />;

  const avanceHoy = hoy.meta ? Math.min(1, hoy.minutosHoy / hoy.meta) : 0;
  const leccion = (modo) => `/leccion?ambito=ingles${modo ? `&modo=${modo}` : ""}`;

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
        Repaso espaciado, escuchar, armar frases y hablar. 15 minutos al día valen más que 2 horas el domingo.
      </CabeceraPagina>

      <div className={estilos.resumen}>
        <div className={estilos.meta}>
          <AnilloProgreso valor={avanceHoy} tamano={96} grosor={8} completo={avanceHoy >= 1}>
            <strong className={estilos.minutos}>
              <SlidingNumber number={Math.floor(hoy.minutosHoy)} />
            </strong>
          </AnilloProgreso>
          <div>
            <span className={estilos.etiqueta}>Hoy</span>
            <strong>
              {Math.floor(hoy.minutosHoy)} de {hoy.meta} min
            </strong>
            <small>
              {hoy.leccionesHoy} {hoy.leccionesHoy === 1 ? "lección" : "lecciones"} · {hoy.inmersionHoy} min de inglés real
            </small>
          </div>
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
      </div>

      <div className={estilos.semana} aria-label="Minutos de inglés en los últimos 7 días">
        {hoy.semana.map((d) => (
          <div key={d.fecha} title={`${d.fecha}: ${d.minutos} min`}>
            <span style={{ height: `${Math.min(100, (d.minutos / Math.max(hoy.meta, 1)) * 100)}%` }} data-cumplio={d.minutos >= hoy.meta} />
            <small>{new Date(`${d.fecha}T12:00:00`).toLocaleDateString("es-PE", { weekday: "narrow" })}</small>
          </div>
        ))}
      </div>

      {!hoy.nivelHecho && (
        <div className={estilos.nivel}>
          <div>
            <strong>¿Ya sabes algo de inglés?</strong>
            <p>Haz la prueba de nivel (unos 8 minutos) y empieza donde de verdad te toca.</p>
          </div>
          <Link to={leccion("nivel")} className="boton boton-primario">
            Hacer la prueba
          </Link>
        </div>
      )}

      <div className={estilos.acciones}>
        <Link to={leccion()} className={`boton boton-primario ${estilos.principal}`}>
          Rutina de hoy
          <small>10 ejercicios: palabras, frases, escuchar y gramática</small>
        </Link>
        <Link to={leccion("rapida")} className="boton">
          Inglés rápido
          <small>5 ejercicios</small>
        </Link>
        {hayVoz() && (
          <Link to={leccion("escuchar")} className="boton">
            Solo escuchar
            <small>oído y dictado</small>
          </Link>
        )}
        <Link to={leccion("errores")} className="boton">
          Mis errores
          <small>lo que fallaste</small>
        </Link>
      </div>

      {hayVoz() ? (
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
          Este dispositivo no tiene una voz en inglés instalada, así que los ejercicios de escuchar no aparecen. En Windows: Configuración, Hora e idioma, Voz, agrega
          una voz en inglés (Estados Unidos). En Android viene con Google.
        </p>
      )}

      <section className={estilos.bloque}>
        <h2>Inmersión: inglés real</h2>
        <p className={estilos.ayuda}>
          La app te da la base; el oído se entrena escuchando mucho inglés de verdad. Anota lo que viste o escuchaste hoy en inglés y cuenta para tu meta.
        </p>
        <div className={estilos.chips}>
          {MINUTOS_RAPIDOS.map((m) => (
            <button key={m} type="button" className={estilos.chip} data-elegido={inmersion === m} onClick={() => setInmersion(m)}>
              {m} min
            </button>
          ))}
        </div>
        {inmersion && (
          <div className={estilos.inmersion}>
            <input value={que} onChange={(e) => setQue(e.target.value)} maxLength={80} placeholder="¿Qué fue? (opcional): una serie, un video, un podcast" />
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
      </section>

      <section className={estilos.bloque}>
        <h2>Tu camino</h2>
        <CaminoMovil ambito="ingles" sinCabecera />
      </section>
    </section>
  );
}
