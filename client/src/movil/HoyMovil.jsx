// "Hoy": la pantalla de inicio del celular. Lo que toca repasar, seguir aprendiendo,
// la chuleta del día y tu racha. Pensada para abrirla 5 minutos entre clases.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api.js";
import { Markdown } from "../components/Markdown.jsx";
import { Esqueleto } from "../components/Esqueleto.jsx";
import { Llama } from "../components/Llama.jsx";
import { AuroraText } from "../components/ui/aurora-text.jsx";
import { SlidingNumber } from "../components/ui/sliding-number.jsx";
import { nombreColeccion } from "../lib/etiquetas.js";
import { AnilloProgreso } from "../components/AnilloProgreso.jsx";
import { avanceUnidad, terminada } from "./leccion/motor.js";
import estilos from "./HoyMovil.module.css";

const AREAS = ["javascript", "react", "typescript", "node"];

function fechaLarga(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

/** Un número estable por día: la chuleta del día cambia cada día, pero no al recargar. */
function numeroDelDia(fecha, total) {
  const n = [...fecha].reduce((suma, c) => (suma * 31 + c.charCodeAt(0)) % 100_003, 7);
  return n % total;
}

export function HoyMovil() {
  const [hoy, setHoy] = useState(api.hoy.guardado);
  const [temas, setTemas] = useState(api.temas.guardado);
  const [chuletas, setChuletas] = useState(api.chuletas.guardado);
  const [error, setError] = useState(null);
  const [lecciones, setLecciones] = useState(null);

  useEffect(() => {
    api.hoy().then(setHoy, (e) => setError(e.message));
    api.lecciones().then(setLecciones, () => {});
    api.temas().then(setTemas, () => {});
    api.chuletas().then(setChuletas, () => {});
  }, []);

  if (error) return <p className={estilos.mensaje}>No se pudo cargar el contenido: {error}</p>;
  if (!hoy) return <Esqueleto variante="tarjetas" />;

  // Sigue aprendiendo: el primer tema (en orden de estudio) cuyo quiz todavía no hiciste.
  const ordenados = (temas ?? []).slice().sort((a, b) => AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || a.orden - b.orden);
  const siguienteTema = ordenados.find((t) => !t.quiz) ?? ordenados[0];
  const chuleta = chuletas?.length ? chuletas[numeroDelDia(hoy.hoy, chuletas.length)] : null;
  const repasos = hoy.ejerciciosParaRepasar;
  const nada = hoy.tarjetasParaHoy === 0 && repasos.length === 0;

  return (
    <section className={estilos.pagina}>
      <header className={estilos.cabecera}>
        <p className={estilos.fecha}>{fechaLarga(hoy.hoy)}</p>
        <h1 className={estilos.saludo}>
          {hoy.config.nombre ? (
            <>
              Hola, <AuroraText>{hoy.config.nombre.split(" ")[0]}</AuroraText>
            </>
          ) : (
            <AuroraText>Hola</AuroraText>
          )}
        </h1>
        <p className={estilos.frase}>{hoy.frase}</p>
      </header>

      <div className={estilos.racha} data-encendida={hoy.racha > 0}>
        <Llama encendida={hoy.racha > 0} tamano={34} />
        <div>
          <strong className={estilos.rachaNumero}>
            <SlidingNumber number={hoy.racha} />
          </strong>
          <span>{hoy.racha === 1 ? "día seguido estudiando" : "días seguidos estudiando"}</span>
        </div>
      </div>

      {lecciones && <TarjetaLeccion datos={lecciones} />}

      {hoy.config.objetivo && (
        <blockquote className={estilos.objetivo}>
          <span>Tu objetivo</span>
          {hoy.config.objetivo}
        </blockquote>
      )}

      <h2 className={estilos.titulo}>Para hoy</h2>
      {nada ? (
        <p className={estilos.vacio}>Nada pendiente por repasar. Aprovecha para avanzar un tema o hacer un quiz.</p>
      ) : (
        <div className={estilos.lista}>
          {hoy.tarjetasParaHoy > 0 && (
            <Link to="/entrevistas" className={estilos.tarjeta} data-tipo="tarjetas">
              <span className={estilos.numero}>{hoy.tarjetasParaHoy}</span>
              <span className={estilos.texto}>
                <strong>{hoy.tarjetasParaHoy === 1 ? "Tarjeta de entrevista" : "Tarjetas de entrevista"}</strong>
                <small>Te tocan hoy: respóndelas y califícate</small>
              </span>
              <i aria-hidden>→</i>
            </Link>
          )}
          {repasos.slice(0, 5).map((e) => (
            <Link key={e.id} to={`/practicar/${e.id}`} className={estilos.tarjeta} data-tipo="ejercicio">
              <span className={estilos.numero}>↻</span>
              <span className={estilos.texto}>
                <strong>{e.titulo}</strong>
                <small>Repasar · {nombreColeccion(e.coleccion)}</small>
              </span>
              <i aria-hidden>→</i>
            </Link>
          ))}
          {repasos.length > 5 && (
            <Link to="/practicar/lista?estado=repasar" className={estilos.verMas}>
              Ver los {repasos.length} ejercicios para repasar
            </Link>
          )}
        </div>
      )}

      {siguienteTema && (
        <>
          <h2 className={estilos.titulo}>Sigue aprendiendo</h2>
          <Link to={`/aprender/${siguienteTema.id}`} className={estilos.tema} data-area={siguienteTema.area}>
            <span className={estilos.temaNumero}>{String(siguienteTema.orden).padStart(2, "0")}</span>
            <span className={estilos.texto}>
              <strong>{siguienteTema.titulo}</strong>
              <small>{siguienteTema.descripcion}</small>
            </span>
          </Link>
        </>
      )}

      {chuleta?.chuleta && (
        <>
          <h2 className={estilos.titulo}>
            Chuleta del día
            <Link to="/chuletas" className={estilos.enlaceTitulo}>
              Ver todas
            </Link>
          </h2>
          <article className={estilos.chuleta} data-area={chuleta.area}>
            <Link to={`/aprender/${chuleta.id}`} className={estilos.chuletaTema}>
              {chuleta.titulo} →
            </Link>
            <Markdown>{chuleta.chuleta}</Markdown>
          </article>
        </>
      )}
    </section>
  );
}

/** La lección del día: la unidad actual, su avance y los botones para empezar. */
function TarjetaLeccion({ datos }) {
  const unidad = datos.unidades.find((u) => u.id === datos.unidadActual) ?? datos.unidades[0];
  if (!unidad) return null;
  const av = avanceUnidad(datos.items, datos.registros, unidad.id);
  const enCurso = datos.enCurso && !terminada(datos.enCurso);
  const errores = datos.items.filter((it) => datos.registros[it.clave]?.caja === 1 && !datos.reportados[it.clave]).length;

  return (
    <div className={estilos.leccion} data-area={unidad.area}>
      <div className={estilos.leccionCabeza}>
        <AnilloProgreso valor={av.porcentaje} tamano={64} grosor={6} completo={av.dominada}>
          <span className={estilos.leccionPct}>{Math.round(av.porcentaje * 100)}%</span>
        </AnilloProgreso>
        <div className={estilos.texto}>
          <small>Tu unidad · {datos.lecciones?.xp ?? 0} XP</small>
          <strong>{unidad.titulo}</strong>
        </div>
      </div>
      {enCurso ? (
        <Link to="/leccion?retomar=1" className={`boton boton-primario ${estilos.empezar}`}>
          Continuar la lección
        </Link>
      ) : (
        <Link to="/leccion" className={`boton boton-primario ${estilos.empezar}`}>
          Empezar lección
        </Link>
      )}
      <div className={estilos.leccionEnlaces}>
        <Link to="/leccion?modo=rapida">Rápida (5)</Link>
        {errores > 0 && <Link to="/leccion?modo=errores">Repasar errores ({errores})</Link>}
        <Link to="/camino">Ver el camino</Link>
      </div>
    </div>
  );
}
